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


//verifyjwt

function verifyJWT(req, res, next) {

    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).send('unauthorized access');
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next();
    })

}



async function run(){
    try{

        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token });
            }
            res.status(403).send({ accessToken: '' })
        });


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
            const cursor = await MachineCollection.findOne(query);
            res.send(cursor)
        
        })
        //get all machin data 
        app.get('/AllMachine', async(req, res)=>{
            const query = {}
            const cursor = await MachineCollection.find(query).toArray()
            res.send(cursor)
            console.log("singledata koi ase",cursor);
        })

    
        app.get('/machineData/:id', async(req, res)=>{
            const id = req.params.id ;
            const query = {_id:ObjectId(id)}
            const cursor = await MachineCollection.find(query).toArray();  
           
            console.log(id);
            res.send(cursor)
        })


          //delete booking 
     app.delete("/AllMachine/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await MachineCollection.deleteOne(query);
       console.log('delte reuse', result);
      res.send(result);
    });

        //add booking .. 
        app.post('/AllMachine', async(req, res)=>{
          const booking = req.body ;
          const bookingResult = await MachineCollection.insertOne(booking);
          res.send(bookingResult);
          console.log(bookingResult);
        })
      
        //completed to machine cateogory data upload 
        app.get('/machine_category/:id', async(req, res) =>{
            const id = req.params.id;
            const query = {category_id:id}
            const filter = await MachineCollection.find(query).toArray()
        
            console.log('all machine data by category',filter);
            res.send(filter)
       
       })
     
//    save users
     app.post('/users', async(req, res)=>{
        const user = req.body;
        const result = await usersCollection.insertOne(user);
        res.send(result)
        console.log(result);
     })

     
               //get user by email 
     app.get('/users/:email', async(req, res)=>{
        const email = req.params.email ;
        const query ={email:email}
        console.log('email user email totoo', email, query);
        const user = await usersCollection.findOne(query);
        console.log("email user",user);
        res.send(user);

     })

     //update user
     app.put('/users', async (req, res) => {
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

      //get all user
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
    
      //payment post to db
      app.put('/payment', async (req, res) =>{
        const payment = req.body;
        const result = await paymentCollection.insertOne(payment);
        const id = payment.bookingId
        const filter = {_id: ObjectId(id)}
        const updatedDoc = {
            $set: {
                paid: true,
                transactionId: payment.transactionId
            }
        }
        const updatedResult = await MachineCollection.updateOne(filter, updatedDoc)
        res.send(result);
        console.log("payment history", result);
    })
      //payment post to stripe 
    
      app.post('/create-payment-intent', async (req, res) => {
        const payment = req.body;
        console.log('payment ',payment);
        const price = payment.resalePrice;
        const amount = price * 100;

        const paymentIntent = await stripe.paymentIntents.create({
            currency: 'usd',
            amount: amount,
            "payment_method_types": [
                "card"
            ]
        });
        console.log('paymentintent', paymentIntent);
        console.log('paymentintent', paymentIntent.client_secret);
        res.send({
            clientSecret: paymentIntent.client_secret,
        });
    });
    }
    catch(error){
        console.log('catch erorr is a', error);
    }

//for ad :
app.put('/AllMachine/publish/:id', async (req, res) => {
    const { id } = req.params;
    const filter = { _id: ObjectId(id) }
    const updateDoc = {
        $set: {
            type: req.body.type
        }
    }
    try {
        const result = await MachineCollection.updateOne(filter, updateDoc)
        res.send({
            success: true,
            data: result
        })
    } catch (error) {
        console.log(error.name, error.message)
        res.send({
            success: false,
            message: error.message
        })
    }
})
//get ad :
app.get('/advertises', async (req, res) => {
    const available = req.query.available;
    const type = req.query.type;
    const quary = { available: available, type: type }
    try {
        const result = await MachineCollection.find(quary).toArray()
        res.send({
            success: true,
            data: result
        })
    } catch (error) {
        console.log(error.name, error.message)
        res.send({
            success: false,
            message: error.message
        })
    }
})
    
}
run();






app.get('/', async(req, res)=>{
    res.send('app running ')
})

app.listen(port, ()=>{
    console.log(`app running on ${port}`);
})