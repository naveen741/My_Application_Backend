const express = require("express");
var request = require('request');
const cors = require("cors");
const Axios = require("axios");
const app = express();
const PORT = 8000;
 
app.use(cors()); 
app.use(express.json());
 
app.post("/compile", (req, res) => {
    //getting the required data from the request
    let code = req.body.code;
    let lang = req.body.language;
    let input = req.body.input;
 
    // if (lang === "python") {
    //     lang="py"
    // }
    console.log(lang)
    var program = {
        script : code,
        language: lang,
        versionIndex: "4",
        stdin: input,
        clientId: "1c8da115a24d16db1a2d919704a33e12",
        clientSecret:"b7ddcdafc03a357600e0e57f5a242f2285fecbaa7e9d24f863834b061c6e1df9"
    };
    let config = {
        url: 'https://api.jdoodle.com/v1/execute',
        method: "POST",
        data: program
    };
    // request({
    //     url: 'https://api.jdoodle.com/v1/execute',
    //     method: "POST",
    //     json: program
    // },
    // (error, response, body)=> {
    //     console.log('error:', error);
    //     console.log('statusCode:', response && response.statusCode);
    //     console.log('body:', body);
    //     console.log('output',body.output)
    //     res.send(body.output)
    // });
    //calling the code compilation API
    Axios(config)
        .then((response)=>{
            console.log(response.data.output)
            res.send(response.data.output)
            
        }).catch((error)=>{
            console.log(error);
        });
})
 
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});