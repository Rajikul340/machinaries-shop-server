const express = require('express');
const app = express();
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const stripe = require("stripe")(process.env.STRIPE_SK)
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
const usersCollection = client.db("machineCollection").collection("users")
const paymentCollection = client.db("machineCollection").collection("payment")


async function run(){
    try{

       //get all machine category
       app.get('/machine_category', async(req, res)=>{
        const query = {}
         const cursor = await categoryCollection.find(query).toArray()
         res.send(cursor)
         
     })
         //get all machine by category 
        app.get('/AllMachine/:id', async(req, res)=>{
            const id = req.params.id;
            const query ={category_id:id}
            // const query ={_id:ObjectId(id)}
            const cursor = await MachineCollection.findOne(query);
            res.send(cursor)
        
        })
        // app.get('/AllMachine', async(req, res)=>{
        //     const query = {}
        //     const cursor = await MachineCollection.find(query).toArray()
        //     res.send(cursor)
        //     console.log("singledata koi ase",cursor);
        // })

          //delete booking 
     app.delete("/AllMachine/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await MachineCollection.deleteOne(query);
       console.log('delte reuse', result);
      res.send(result);
    });
        //add machine 
        app.post('/AllMachine', async(req, res)=>{
          const booking = req.body ;
          const result = await MachineCollection.insertOne(booking);
          res.send(result);
          console.log(result);
        })
      
        
        app.get('/machine_category/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {category_id:id}
            const filter = await MachineCollection.find(query).toArray()
        
            console.log('all machine data by category',filter);
            res.send(filter)
       
       })
     
   //save users
    //  app.post('/users', async(req, res)=>{
    //     const user = req.body;
    //     const result = await usersCollection.insertOne(user);
    //     res.send(result)
    //     console.log(result);
    //  })
     //get user

     app.get('/users/:email', async(req, res)=>{
        const email = req.query.email ;
        const query ={email:email}
        console.log('email user email totoo', email, query);
        const user = await usersCollection.findOne(query);
        console.log("email user",user);
        res.send(user);

     })
     //update user

     app.put('/users/:email', async (req, res) => {
        const email = req.params.email
        const user = req.body
  
        const filter = { email: email }
        const options = { upsert: true }
        const updateDoc = {
          $set: user,
        }
        const result = await usersCollection.updateOne(filter, updateDoc, options)  
        console.log(result)
        res.send(result)
      })

     app.get('/users', async(req,res)=>{
        const query = {}
        const result = await usersCollection.find(query).toArray()
        res.send(result);
        console.log(result);

     })

       //delete user
     app.delete("/users/:id", async (req, res) => {
        const id = req.params.id;
        console.log('delete id', id);
        const query = { _id: ObjectId(id) };
        console.log('delete query ', query);
        const result = await usersCollection.deleteOne(query);
         console.log('delte reuse', result);
        res.send(result);
      });
    
      app.post('/payment', async(req, res)=>{
        const payment = req.body;
        const id = payment.booking;
        const filter ={_id:ObjectId(id)}
        const updateDoc ={
            $set:{
                paid: true,
                transactionId: payment.transactionId
            }
        }
        const result = await paymentCollection.insertOne(payment);
        const newResult = await paymentCollection.updateOne(filter, updateDoc);
        res.send(result);
     })
   
     app.post('/payment-intents', async(req, res)=>{
        const booking = req.body;
        const price = booking?.resalePrice ;
        const amount = price*100;
        const paymentIntents = await stripe.paymentIntents.create({
            currency:'usd',
            amount:amount,
            "payment_method_types":[
                "card"
            ]

        })

        res.send({clientSecret:paymentIntents.client_secret})
   
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