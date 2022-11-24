const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

//middleware 
app.use(cors())
app.use(express.json())

//mongodb conneted 


const uri = "mongodb+srv://<username>:<password>@cluster0.lrjyghr.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });










app.get('/', async(req, res)=>{
    res.send('app running ')
})

app.listen(port, ()=>{
    console.log(`app running on ${port}`);
})