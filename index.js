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


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lrjyghr.mongodb.net/?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const MachineCollection = client.db('machineCollection').collection('AllMachine');
const categoryCollection = client.db('machineCollection').collection('machine_category');


async function run(){
    try{
         //get all machine by category 
        app.get('/AllMachine/:id', async(req, res)=>{
            const id = req.params.id;
            const query ={category_id:id}
            const cursor = await MachineCollection.findOne(query)
            res.send(cursor)
            console.log(cursor);
        })
        //get all machine category
        app.get('/machine_category', async(req, res)=>{
            const query ={}
            const cursor = await categoryCollection.find(query).toArray();
            res.send(cursor)
            console.log(cursor);
        })
    }
    catch(error){
        console.log('catch erorr is a', error);
    }
}
run();






app.get('/', async(req, res)=>{
    res.send('app running ')
})

app.listen(port, ()=>{
    console.log(`app running on ${port}`);
})