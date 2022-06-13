const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://naveen741:Welcome%40ta@cluster0.3ifyh.mongodb.net/?retryWrites=true&w=majority";
module.exports= new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });