const http=require('http');
const fs=require('fs')
const express=require('express');
const app=express();
const cors = require("cors");
const bodyParser = require('body-parser')
const compiler = require('ezcompilex');
app.use(cors());
const port=8084;
const server=http.createServer(app);
app.use(bodyParser.json())
const option = {stats : true};
compiler.init(option);
server.listen(port,()=>{
    console.log(`listening port:${port}`)
});
app.get('/', (req, res) => {
    res.send({
      status: 200,
      message: 'hello'
    })
      .end()
})
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