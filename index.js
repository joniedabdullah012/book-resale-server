const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const jwt = require('jsonwebtoken')
require('dotenv').config()

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY)

const port = process.env.PORT || 5000;

// middlewear

app.use(cors())
app.use(express.json());
// const details = require('./data.json');




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kmvb6d0.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


// FUNCTION JWT*****


function verifyJWT(req, res, next) {
    // console.log('token inside', req.headers.authorization);
    const authHeader = req.headers.authorization
    if (!authHeader) {
        return res.status(401).send('unauthorized access')
    }

    const token = authHeader.split(' ')[1];

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
            console.log('token', req.headers.authorization);

            const query = { email: email }
            const bookings = await bookingCollection.find(query).toArray()
            res.send(bookings)


        });


        app.get('/bookings/:id', async (req, res) => {

            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const booking = await bookingCollection.findOne(query)
            res.send(booking)





        })
        // // 
        // SELLER COLLECTION

        const usersCollection = client.db('bookResale').collection('users')

        app.post('/users', async (req, res) => {
            const user = req.body;
            console.log(user);
            const result = await usersCollection.insertOne(user)
            res.send(result)


        });

        app.get('/users', async (req, res) => {

            const query = {};
            const users = await usersCollection.find(query).toArray();
            res.send(users)


        });


        // make admin

        app.get('/users/admin/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isAdmin: user?.role === 'admin' })
        })
        // make seller

        app.get('/users/seller/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email }
            const user = await usersCollection.findOne(query);
            res.send({ isSeller: user?.role === 'seller' })
        })



        app.put('/users/admin/:id', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user?.role !== 'admin') {
                return res.status(403).send({ message: 'Forbidden access' })
            }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };

            const updatedDoc = {
                $set: {
                    role: 'admin'

                }

            }

            const result = await usersCollection.updateOne(filter, updatedDoc, options)
            res.send(result)



        });

        // make seller

        app.put('/users/seller/:id', verifyJWT, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const query = { email: decodedEmail };
            const user = await usersCollection.findOne(query);

            if (user?.role !== 'seller') {
                return res.status(403).send({ message: 'Forbidden access' })
            }

            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const options = { upsert: true };

            const updatedDoc = {
                $set: {
                    role: 'seller'

                }

            }

            const result = await usersCollection.updateOne(filter, updatedDoc, options)
            res.send(result)



        });

        // add product 

        const productsCollection = client.db('bookResale').collection('products')

        app.post('/products', verifyJWT, async (req, res) => {
            const products = req.body;
            const result = await productsCollection.insertOne(products)
            res.send(result)

        });

        app.get('/products', verifyJWT, async (req, res) => {
            const query = {};
            const products = await productsCollection.find(query).toArray()
            res.send(products)
        })

        // JWT**************


        app.get('/jwt', async (req, res) => {
            const email = req.query.email;
            const query = { email: email }
            const user = await usersCollection.findOne(query)


            if (user) {
                const token = jwt.sign({ email }, process.env.ACCESS_TOKEN, { expiresIn: '1h' })
                return res.send({ accessToken: token });

            }

            res.status(403).send({ accessToken: '' })


        });

        // delete product

        app.delete('/products/:id', verifyJWT, async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) }
            const result = await productsCollection.deleteOne(filter)
            res.send(result)


        });

        app.post('/create-payment-intent', async (req, res) => {
            const booking = req.body;
            const resale_price = booking.resale_price
            const amount = resale_price * 100;

            const paymentIntent = await stripe.paymentIntents.create({
                currency: 'usd',
                amount: amount,
                "payment_method_types": [
                    "card"
                ]
            });

            res.send({
                clientSecret: paymentIntent.client_secret,

            })




        });
        // payment collection

        const paymentCollection = client.db('bookResale').collection('payments')

        app.post('/payment', async (req, res) => {
            const payment = req.body;
            const result = await paymentCollection.insertOne(payment)
            const id = payment.bookingId
            const filter = { _id: ObjectId(id) }
            const updatedDoc = {
                $set: {
                    paid: true,
                    transactionId: payment.transactionId
                }
            }
            const updateResult = await bookingCollection.updateOne(filter, updatedDoc)
            res.send(result)


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


