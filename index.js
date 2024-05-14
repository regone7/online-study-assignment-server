const express = require('express')
const cors = require('cors')
var jwt = require('jsonwebtoken');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 9000
const app = express()

const corsOptions = {
    origin: [
        'http://localhost:5173',

    ],
    credentials: true,
    optionSuccessStatus: 200,
}
app.use(cors(corsOptions))
app.use(express.json())



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4zosjqm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {
    try {
        // Connect the client to the server	(optional starting in v4.7)
        await client.connect();
        const assignmentCollection = client.db("assignmentDB").collection("assignment");
        const assignmentSubmited = client.db("assignmentDB").collection("assignsubmit");

        // auth
        app.post('/jwt',async(req,res)=>{
            const user = req.body;
            console.log(user)
            const token =jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {expiresIn:'1d'})
            res.cookie('token',token,{
                httpOnly: true,
                secure: true,
                sameSite:'none'
            })
            .send({successs:true})
        })
        app.post('/logout',async(req,res)=>{
            const user = req.body;
            console.log('log out',user)
            res.clearCookie('token', { maxAge:0}).send({ successs: true })
        })


        // server
        app.get('/assignment', async (req, res) => {
            const cursor = assignmentCollection.find();
            const result = await cursor.toArray();
            res.send(result)
        })

        app.get('/assignment/:id', async (req, res) => {
            const id = req.params.id;
            const quary = { _id: new ObjectId(id) }
            const cursor = assignmentCollection.findOne(quary);
            const result = await cursor;
            res.send(result)
        })

        app.post('/assignment', async (req, res) => {
            const infoassignment = req.body;
            // console.log()
            const result = await assignmentCollection.insertOne(infoassignment);
            res.send(result)

        })
        app.put('/update/:id', async (req, res) => {
            const id = req.params.id
            // console.log(id)
            const updateData = req.body
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    ...updateData,
                },
            }
            const result = await assignmentCollection.updateOne(query, updateDoc, options)
            res.send(result)
        })
        app.delete('/delete/:id', async (req, res) => {
            const id = req.params.id;
            const quary = { _id: new ObjectId(id) }
            const result = await assignmentCollection.deleteOne(quary)
            res.send(result)
        })

        app.get('/assignsubmits', async (req, res) => {
            const cursor = assignmentSubmited.find();
            const result = await cursor.toArray();
            res.send(result)
        })
        app.get('/assignsubmits/:id', async (req, res) => {
            const id = req.params.id;
            const quary = { _id: new ObjectId(id) }
            const cursor = assignmentSubmited.findOne(quary);
            const result = await cursor;
            res.send(result)
        })
        app.get('/assignsubmitseml/:email',async(req,res)=>{
            // console.log(req.params.email)
            const email=req.params.email;
            const quary = {email:email}
            const result = await assignmentSubmited.find(quary).toArray();
            res.send(result)
          })
        app.post('/assignsubmit', async (req, res) => {
            const infoassignments = req.body;
            // console.log(infoassignments)
            const result = await assignmentSubmited.insertOne(infoassignments);
            res.send(result)

        })
        app.put('/updates/:id', async (req, res) => {
            const id = req.params.id
            console.log(id)
            const updateMarkData = req.body
            const query = { _id: new ObjectId(id) }
            const options = { upsert: true }
            const updateDoc = {
                $set: {
                    ...updateMarkData,
                },
            }
            console.log(updateDoc)
            const result = await assignmentSubmited.updateOne(query, updateDoc, options)
            res.send(result)
        })

        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Online Study Assignment Server is Running')
})

app.listen(port, () => {
    console.log(`Server is Running on port ${port}`)
})