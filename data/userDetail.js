const mysql=require('mysql')
module.exports= mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "Tringapps@2001",
  database: "sample"
});

