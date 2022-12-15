const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
const app = express();
const jwt = require('jsonwebtoken')
require('dotenv').config()
const port = process.env.PORT || 5000;

// middlewear

app.use(cors())
app.use(express.json());
// const details = require('./data.json');




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kmvb6d0.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// FUNCTION JWT*****


function verifyJWT(req, res, next) {
    console.log('token', req.headers.authorization);
    const autHeader = req.headers.authorization
    if (!autHeader) {
        return res.status(401).send('unauthorized access')
    }

    const token = authorization.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'forbidden access' })
        }
        req.decoded = decoded;
        next()



    })

}




async function run() {

    try {

        // BOOK CATAGORY*****

        const bookCategories = client.db('bookResale').collection('bookCatagories')
        app.get('/bookCatagories', async (req, res) => {
            const query = {};
            const catagories = await bookCategories.find(query).toArray();
            res.send(catagories)


        });

        // BOOK CATAGORIES ID ALL****

        const bookCatagoriesId = client.db('bookResale').collection('bookCatagoriesId')
        app.get('/bookCatagoriesId', async (req, res) => {

            const bookId = {}

            const catagory = await bookCatagoriesId.find(bookId).toArray()
            res.send(catagory)

        })

        // BOOK CATAGORIES ID
        const bookCatagoriesIdnew = client.db('bookResale').collection('bookCatagoriesId')
        app.get('/bookCatagoriesId/:id', async (req, res) => {


            const id = req.params.id;
            const query = { category: (id) };


            const catagory = await bookCatagoriesIdnew.find(query).toArray()
            res.send(catagory)

        });

        // BOOKINGS COOLLECTION 


        const bookingCollection = client.db('bookResale').collection('bookings')

        app.post('/bookings', async (req, res) => {
            const booking = req.body

            const result = await bookingCollection.insertOne(booking);
            res.send(result);




        });

        // TOKEN 


        app.get('/bookings', verifyJWT, async (req, res) => {
            const email = req.query.email;
            const decodedEmail = req.decoded.email;
            if (email !== decodedEmail) {
                return res.status(403).send({ message: 'forbidden access' })
            }

            const query = { email: email }
            const bookings = await bookingCollection.find(query).toArray()
            res.send(bookings)


        });

        // SELLER COLLECTION

        const usersCollection = client.db('bookResale').collection('usersCollection')

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user)
            res.send(result)


        });

        app.get('/users', async (req, res) => {

            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users)


        })

        // JWT**************


        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query)

            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '23h' })
                return res.send({ accessToken: token });

            }
            console.log(user);

            res.status(403).send({ accessToken: '' })


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


