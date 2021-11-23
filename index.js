const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json()); 

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.pdjyv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run(){
    try{
        await client.connect();
        const database = client.db("tourismDb");
        const toursCollection = database.collection("tours");
        const bookingTourCollection = database.collection("bookingTour");
        //GET Single Tour
        app.get('/tours/:id', async (req,res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id)};
            const tour = await toursCollection.findOne(query);
            res.json(tour);
          });
        // GET API 
        app.get('/tours', async (req,res) => {
            const cursor = toursCollection.find();
            const tours = await cursor.toArray();
            res.send(tours);
        });
        // POST API tour Packages
        app.post('/tours', async (req,res) => {
            const tour = req.body;
            console.log('hitting the post api',tour);
            const result = await toursCollection.insertOne(tour);
            console.log(result);
            res.json(result);
        });

        //Add Booking Tour
       app.post('/bookingTour', async (req,res) =>{
            const bookingTour = req.body;
            console.log('hitting the post api',bookingTour);
            const result = await bookingTourCollection.insertOne(bookingTour);
   
            console.log(result);
            res.json(result);
       });

       // GET booking tour 
       app.get('/bookingTour', async (req,res) => {
        const cursor = bookingTourCollection.find();
        const bookingTour = await cursor.toArray();
        res.send(bookingTour);
       });

       //GET Single user booking
       app.get('/bookingTour/:email', async (req,res) => {
        const result = await bookingTourCollection.find({
            email: req.params.email,
        }).toArray();
        res.json(result);
      });

       //DELETE API
       app.delete('/bookingTour/:id', async (req,res) => {
        const id = req.params.id;
        const query = { _id: ObjectId(id)};
        const result = await bookingTourCollection.deleteOne(query);
        res.json(result);
      });
      
      //update status
      app.put("/bookingTour/:id", async (req, res)=>{
        const id = req.params.id;
        const query = { _id: ObjectId(id)};
        const option = {upsert: true};
        const updateDoc = {$set:{
           status: "Approved"
        }}
        const result = await bookingTourCollection.updateOne(query, updateDoc, option)
        res.send(result);
      });

    }
    finally{
        //await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req,res) => {
    console.log('Connecting');
    res.send('Running Tourism Server');
});


app.listen(port, () => {
    console.log('Running Tourism Server on port',port);
});