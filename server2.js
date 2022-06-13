const http=require('http');
const fs=require('fs')
const express=require('express');
const client=require('./data/userDetail1')
const app=express();
const cors = require("cors");
const bodyParser = require('body-parser')
const crypto = require('crypto');
const compiler = require('ezcompilex');
const collection = client.db("sample").collection("mytable");
app.use(cors());
const port=5000;
const server=http.createServer(app);
//app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
const option = {stats : true};
compiler.init(option);
server.listen(process.env.PORT || port,()=>{
    console.log(`listening port:${port}`)
});
client.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});
app.get('/', (req, res) => {
    res.send({
      status: 200,
      message: 'hello'
    })
      .end()
  })
app.post('/savedata',(req,res)=>{
    console.log(req.body);
    const userDetail=req.body;
    const mykey = crypto.createCipher('aes-128-cbc', 'userPassword');
    let userPassword = mykey.update(userDetail.user_password, 'utf8', 'hex')
    userPassword += mykey.final('hex');
    const userdata={
      user_Name : userDetail.user_Name,
      user_moblieNo : userDetail.user_moblieNo,
      user_password : userPassword

    }
    collection.insertOne(userdata, (err)=>{
      if(err) throw err
      else{
        res.status(200).send({ status: 200, message: 'SUCCESS' })
        console.log("user data is updated")
      }
    })
});
app.post('/checkdata',(req,res)=>{
  //console.log(req.body);
  const userDetail=req.body;
  // const sql=`select * from mytable;`
  const flag={message:'INCORRECT DETAILS'};
  collection.find({}).toArray((err, result)=>{
    if(err) throw err
    //console.log(JSON.stringify(result))
    const allUserDetail= result
    console.log(allUserDetail);
    allUserDetail.map((i)=>{
      const mykey = crypto.createDecipher('aes-128-cbc', 'userPassword');
      let mypassword = mykey.update(i.user_password, 'hex', 'utf8')
      mypassword += mykey.final('utf8');
      i.user_password=mypassword;
      console.log(mypassword+"<-->"+userDetail.user_password)
      if(i.user_password === userDetail.user_password
        && i.user_moblieNo===userDetail.user_moblieNo
            && i.user_Name === userDetail.user_Name){
         flag.message='SUCCESS';
         console.log(flag.message)
      }
          
        
    });
    res.status(200).send({ status: 200, message: flag.message })
  }) 
});
app.post(`/onlineCompiler`,(req,res)=>{
  const dir = 'temp';
  if (!fs.existsSync(dir)){
      fs.mkdirSync(dir);
    }
  console.log(req.body)
  const codeDetail=req.body
  
  function addData(data){
      const mergeData=(datas)=>{
          crtOutput=datas.output; 
          data={...data,crtOutput};
          console.log(data);
          sendData(data)
      };
      let crtOutput=null;
      const envData={OS : "Linux"};
      if(codeDetail.inputRadio)
          compiler.compileJavaWithInput(envData , codeDetail.crtCode, codeDetail.input , (datas)=>{mergeData(datas)});     	
      else
          compiler.compileJava(envData , codeDetail.code , addData);
      
      //console.log(data)
  }
  if(codeDetail.lang === 'C'||codeDetail.lang === 'C++'){
    const envData =  { OS : "Linux" , cmd : 'gcc'}
    if(codeDetail.inputRadio)
      compiler.compileCPPWithInput(envData , codeDetail.code, codeDetail.input , addData);     	
    else
      compiler.compileCPP(envData , codeDetail.code , addData);
  }
  else if(codeDetail.lang === 'Python'){
    const envData={OS : "Linux"};
    if(codeDetail.inputRadio)
      compiler.compilePythonWithInput(envData , codeDetail.code, codeDetail.input , addData);     	
    else
      compiler.compilePython(envData , codeDetail.code , addData);
  }
  else if(codeDetail.lang === 'Java')
  {
    const envData={OS : "Linux"};
    if(codeDetail.inputRadio)
      compiler.compileJavaWithInput(envData , codeDetail.code, codeDetail.input , addData);     	
    else
      compiler.compileJava(envData , codeDetail.code , addData);
  }
  
  function sendData(data) {     
      if (fs.existsSync(dir)){ 
      fs.rmdir(dir, { recursive: true }, (err) => {
          if (err) {
              throw err;
          }
      }); 
      }
      if (!fs.existsSync(dir))
      {
      fs.mkdirSync(dir);
      }
    if(data.error)
    {
      try{
        res.send({output : data.error})
        res.end()
      }
      catch(e){
        console.log(e);
      }
              
    }
    else
    {
      //console.log(data.output)
      try{
          //console.log(data)
          res.send(data)
          res.end()
      }
      catch(e){
        console.log(e);
      }
    }
  }
})