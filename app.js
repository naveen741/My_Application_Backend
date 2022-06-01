const http=require('http');
const express=require('express');
const db=require('./data/userDetail')
const app=express();
const cors = require("cors");
const bodyParser = require('body-parser')
const crypto = require('crypto');
app.use(cors());
const port=8082;
const server=http.createServer(app);
//app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
server.listen(port,()=>{
    console.log(`listening port:${port}`)
});
db.connect(function(err) {
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