const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
require('dotenv').config()
const port = process.env.PORT || 5000;

// middlewear

app.use(cors())
app.use(express.json());
// const details = require('./data.json');




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kmvb6d0.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {

    try {
        const bookCategories = client.db('bookResale').collection('bookCatagories')
        app.get('/bookCatagories', async (req, res) => {
            const query = {};
            const catagories = await bookCategories.find(query).toArray();
            res.send(catagories)


        });

        const bookCatagoriesId = client.db('bookResale').collection('bookCatagoriesId')
        app.get('/bookCatagoriesId', async (req, res) => {

            const bookId = {}

            const catagory = await bookCatagoriesId.find(bookId).toArray()
            res.send(catagory)

        })
        const bookCatagoriesIdnew = client.db('bookResale').collection('bookCatagoriesId')
        app.get('/bookCatagoriesId/:id', async (req, res) => {


            const id = req.params.id;
            const query = { category: (id) };


            const catagory = await bookCatagoriesIdnew.find(query).toArray()
            res.send(catagory)

        });


        const bookingCollection = client.db('bookResale').collection('bookings')

        app.post('/bookings', async (req, res) => {
            const booking = req.body

            const result = await bookingCollection.insertOne(booking);
            res.send(result);




        });
        app.get('/bookings', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const bookings = await bookingCollection.find(query).toArray()
            res.send(bookings)


        })





    }

    finally {

    }

}
run().catch(console.log)


// practice 




app.get('/', async (req, res) => {
    res.send('books portal server is running')

})


app.listen(port, () => {
    console.log(`books portal running ${port}`)
})


