const http=require('http');
const fs=require('fs')
const express=require('express');
const db=require('./data/userDetail')
const app=express();
const cors = require("cors");
const bodyParser = require('body-parser')
const crypto = require('crypto');
const compiler = require('ezcompilex');
app.use(cors());
const port=8082;
const server=http.createServer(app);
//app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
const option = {stats : true};
compiler.init(option);
server.listen(process.env.PORT || 5000,()=>{
    console.log(`listening port:${port}`)
});
// db.connect(function(err) {
//     if (err) throw err;
//     console.log("Connected!");
// });
app.get('/', (req, res) => {
    res.send({
      status: 200,
      message: 'hello'
    })
      .end()
  })
app.post('/savedata',(req,res)=>{
    //console.log(req.body);
    const userDetail=req.body;
    const mykey = crypto.createCipher('aes-128-cbc', 'userPassword');
    let userPassword = mykey.update(userDetail.user_password, 'utf8', 'hex')
    userPassword += mykey.final('hex');
    const sql=`insert into mytable values ("${userDetail.user_Name}", "${userDetail.user_moblieNo}", "${userPassword}")`
    db.query(sql, (err, result)=>{
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
  const sql=`select * from mytable;`
  const flag={message:'INCORRECT DETAILS'};
  db.query(sql, (err, result)=>{
    if(err) throw err
    //console.log(JSON.stringify(result))
    const allUserDetail= JSON.parse(JSON.stringify(result))//JSON.stringify(result);
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
    if(codeDetail.lang === 'C'||codeDetail.lang === 'C++'){
      const envData =  { OS : "Linux" , cmd : 'gcc'}
      if(codeDetail.inputRadio)
        compiler.compileCPPWithInput(envData , codeDetail.code, codeDetail.input , sendData);     	
      else
        compiler.compileCPP(envData , codeDetail.code , sendData);
    }
    else if(codeDetail.lang === 'Python'){
      const envData={OS : "Linux"};
      if(codeDetail.inputRadio)
        compiler.compilePythonWithInput(envData , codeDetail.code, codeDetail.input , sendData);     	
      else
        compiler.compilePython(envData , codeDetail.code , sendData);
    }
    else if(codeDetail.lang === 'Java')
    {
      const envData={OS : "Linux"};
      if(codeDetail.inputRadio)
        compiler.compileJavaWithInput(envData , codeDetail.code, codeDetail.input , sendData);     	
      else
        compiler.compileJava(envData , codeDetail.code , sendData);
    }
    function sendData(data) {
      fs.rmdir(dir, { recursive: true }, (err) => {
          if (err) {
              throw err;
          }
      }); 
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
        console.log(data.output)
        try{
          res.send({output : data.output})
          res.end()
        }
        catch(e){
          console.log(e);
        }
      }
    }
})
// compiler.flush(function(){
//   console.log('All temporary files flushed !'); 
// }); 