require("dotenv").config();
require("rootpath")();
const express = require("express");
const app = express();
const jwt = require("_helpers/jwt");
const errorHandler = require("_helpers/error-handler");

app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "500mb" }));

// Serve files in public folder
app.use(express.static("public"));

// Use JWT auth to secure the API
app.use(jwt());

// User API routes
app.use("/users", require("./users/users.controller"));

// Default route for status
app.get("/status", (req, res) => {
  res.send({ status: "LRS is up" });
});

// Global error handler
app.use(errorHandler);

// MongoDB direct connection with Mongoose

// Mongo import and init variables
const { MongoClient } = require("mongodb");
var mongo_url = process.env.MONGO_URL || "mongodb://localhost:27017";
const m_client = new MongoClient(mongo_url, { useUnifiedTopology: true });
let m_database;
let m_collection;

// Async function to connect to MongoDB and initiaize variables for db and collection
async function connectMongo() {
  try {
    await m_client.connect();
    m_database = m_client.db(process.env.MONGO_DB || "lrs");
    m_collection = m_database.collection(
      process.env.MONGO_XAPI_COLLECTION || "records"
    );
    console.log("Native MongoDB Driver connected");
  } catch (err) {
    console.log("Error connecting to Mongo Server: ", err);
  }
}
connectMongo();

// LRS endpoint to accept post data
app.post("/lrs", (req, res) => {
  try {
    // Encryption of personal data is moved to LTI Tool
    m_collection.insertOne(req.body, function (err, mong_res) {
      console.log(new Date(), " record inserted");
      res.send(JSON.stringify({ result: "done" }));
      res.status(200).end();
    });
  } catch (err) {
    console.log(new Date(), "Error inserting record: ", err);
    res.status(500).end();
  }
});

// Start the Server
const port =
  process.env.NODE_ENV === "production" ? process.env.PORT || 80 : 4000;
const server = app.listen(port, function () {
  console.log("Server listening on port " + port);
});
