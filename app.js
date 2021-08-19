require("dotenv").config();

// Mongo import and init variables
const { MongoClient } = require("mongodb");
var mongo_url = process.env.MONGO_URL || "mongodb://localhost:27017";
const m_client = new MongoClient(mongo_url);
let m_database;
let m_collection;

// ExpressJS import and init variables
const express = require('express')
const session = require("express-session");
var cors = require('cors')
const bodyParser = require("body-parser");
const app = express()
const port = process.env.PORT || 7000;

// Async function to connect to MongoDB and initiaize variables for db and collection
async function connectMongo() {
    try {
        await m_client.connect();
        m_database = m_client.db(process.env.MONGO_DB || "lrs_db");
        m_collection = m_database.collection(process.env.MONGO_COLLECTION || "records");
        console.log("Connected to MongoDB server");
    }
    catch (err) {
        console.log("Error connecting to Mongo Server: ", err);
    }
}
connectMongo();

// ExpressJS setup
app.use(bodyParser.json({ limit: "500mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

// Default route for status
app.get('/', (req, res) => {
    res.send({ 'status': 'LRS is up' })
})

// LRS endpoint to accept post data
app.post('/lrs', (req, res) => {
    try {
        // TODO: Don't save user personal information like name, email. 
        // TODO: User ID must be encrypted
        m_collection.insertOne(req.body, function (err, mong_res) {
            console.log(new Date(), " record inserted");
            res.send(JSON.stringify({ 'result': 'done' }));
            res.status(200).end();
        });
    }
    catch (err) {
        console.log(new Date(), "Error inserting record: ", err);
        res.status(500).end();
    }
})

// Start the ExpressJS HTTP server
app.listen(port, () => {
    console.log(`LRS is listening at port: ${port}`)
})