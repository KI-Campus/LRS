let LRS_VERSION = "1.1.0";

const crypto = require("crypto");
require("dotenv").config();
require("rootpath")();
const express = require("express");
const app = express();
const cors = require("cors");
const jwt = require("_helpers/jwt");
const errorHandler = require("_helpers/error-handler");

const { create } = require("./users/user.service");
const db = require("_helpers/db");
const User = db.User;

app.use(cors({ origin: "*" }));

app.use(express.urlencoded({ extended: false }));
app.use(express.json({ limit: "500mb" }));

// Serve files in public folder
app.use(express.static("frontend/build"));

app.use("/consumer/:consumerId", express.static("frontend/build"));
app.use(
  "/consumer/:consumerId/course/:courseId",
  express.static("frontend/build")
);
app.use(
  "/consumer/:consumerId/course/:courseId/exercise/:exerciseId",
  express.static("frontend/build")
);

app.use(
  "/consumer/:consumerId/course/:courseId/exercise/:exerciseId/sub/:subExerciseId",
  express.static("frontend/build")
);

app.use("/consumers", express.static("frontend/build"));
app.use("/users", express.static("frontend/build"));
app.use("/login", express.static("frontend/build"));
app.use("/register", express.static("frontend/build"));
app.use("/login-magic-token/:token", express.static("frontend/build"));

// Use JWT auth to secure the API
app.use(jwt());

// User API routes
app.use("/users", require("./users/users.controller"));

// Default route for status
app.get("/status", (req, res) => {
  res.send({ status: "LRS is up", version: LRS_VERSION });
});

// Global error handler
app.use(errorHandler);

// MongoDB direct connection with Mongoose

// Mongo import and init variables
const { MongoClient } = require("mongodb");
var m_client = new MongoClient(process.env.MONGO_URL + process.env.MONGO_DB, {
  useUnifiedTopology: true,
});

// Async function to connect to MongoDB and initiaize variables for db and collection
async function connectMongo() {
  try {
    await m_client.connect();
    console.log("Native MongoDB Driver connected");
  } catch (err) {
    console.log("Error connecting to Mongo Server: ", err);
  }
}
connectMongo();

require("./consumers/consumers.js").init(m_client);
require("./records.js").init(m_client);

// Consumer API routes
app.use("/consumers", require("./consumers/consumers.js").router);

app.use("/records", require("./records.js").router);

// LRS endpoint to accept post data
app.post("/lrs", async (req, res) => {
  try {
    // Encryption of personal data is moved to LTI Tool

    // Get consumer and course id from the request so that we can store the record in a collection with the same name
    let consumerId = req?.body?.metadata?.session.custom_consumer ?? "null";
    let courseId = req?.body?.metadata?.session.context_id ?? "null";

    // Trim the consumerId and courseId
    consumerId = consumerId?.trim() ?? consumerId;
    courseId = courseId?.trim() ?? courseId;

    // Check for the shared secret key
    const receivedSignature = req.headers["x-signature"];
    const message = JSON.stringify(req.body);

    let SHARED_SECRET_KEY =
      process.env.LRS_SHARED_SECRET_KEY ?? "EasyToReadSharedKey12345";

    const computedSignature = crypto
      .createHmac("sha1", SHARED_SECRET_KEY)
      .update(message)
      .digest("hex");

    if (computedSignature === receivedSignature) {
      // Continue processing the message
    } else {
      console.log("Invalid message signature");
      res
        .status(401)
        .send({ success: false, error: "Invalid message signature" })
        .end();
      return;
    }

    // Check if collection exists, if not create it
    const collectionExists = await m_client
      .db()
      .listCollections({
        name:
          process.env.MONGO_XAPI_COLLECTION +
          "_consumerId_" +
          consumerId +
          "_courseId_" +
          courseId,
      })
      .hasNext();
    if (!collectionExists) {
      // Create a compressed version of the collection
      await m_client
        .db()
        .createCollection(
          process.env.MONGO_XAPI_COLLECTION +
            "_consumerId_" +
            consumerId +
            "_courseId_" +
            courseId,
          {
            storageEngine: {
              wiredTiger: {
                configString: "block_compressor=zlib",
              },
            },
          }
        );
      console.log(
        "Compressed Collection created: ",
        process.env.MONGO_XAPI_COLLECTION +
          "_consumerId_" +
          consumerId +
          "_courseId_" +
          courseId
      );
    }

    m_client
      .db()
      .collection(
        process.env.MONGO_XAPI_COLLECTION +
          "_consumerId_" +
          consumerId +
          "_courseId_" +
          courseId
      )
      .insertOne(req.body, { check_keys: false }, function (err, mong_res) {
        if (err) {
          throw err;
        }
        console.log("xAPI Record inserted");
        console.log("Mongo Response", mong_res);
        res.send(JSON.stringify({ result: "done" }));
        res.status(200).end();
      });
  } catch (err) {
    console.log(new Date(), "Error inserting record: ", err);
    res.status(500).end();
  }
});

// LRS endpoint to accept create temporary user request
app.post("/lrs/create_temp_user", async (req, res) => {
  console.log("/lrs/create_temp_user");

  const receivedSignature = req.headers["x-signature"];
  const message = JSON.stringify(req.body);

  let SHARED_SECRET_KEY =
    process.env.LRS_SHARED_SECRET_KEY ?? "EasyToReadSharedKey12345";

  const computedSignature = crypto
    .createHmac("sha1", SHARED_SECRET_KEY)
    .update(message)
    .digest("hex");

  if (computedSignature === receivedSignature) {
    // Continue processing the message
  } else {
    console.log("Invalid message signature");
    res
      .status(401)
      .send({ success: false, error: "Invalid message signature" })
      .end();
    return;
  }

  try {
    // Read post data and create a new user
    let courseId = req?.body?.courseId;
    if (!courseId) {
      throw new Error("Course ID is not provided");
    }
    let consumerId = req?.body?.consumerId;
    if (!consumerId) {
      throw new Error("Consumer ID is not provided");
    }

    // Trim the consumerId and courseId
    consumerId = consumerId?.trim() ?? consumerId;
    courseId = courseId?.trim() ?? courseId;

    // Random User ID
    const userId = require("crypto")
      .createHash("md5")
      .update(Date.now().toString() + Math.random().toString())
      .digest("hex");
    // Create a new user
    let tempUser = {
      email: userId + "_" + consumerId + "_" + courseId + "@temp.com",
      // Random hashed password
      password: require("crypto")
        .createHash("md5")
        .update(Date.now().toString() + Math.random().toString())
        .digest("hex"),
      firstName: "Temp User",
      lastName: userId,
      role: "user",
      coursesAccess: [consumerId + "_courseId_" + courseId],
      // Random MD5 hash
      magicLoginToken: require("crypto")
        .createHash("md5")
        .update(Date.now().toString() + Math.random().toString())
        .digest("hex"),
      // Expire in 1 hour
      expireAt: new Date(Date.now() + 60 * 60 * 1000),
      tempUser: true,
    };

    create(tempUser);

    console.log("Temp User created: ", tempUser);

    // Send the user back to the LTI Tool
    res.send(
      JSON.stringify({
        success: true,
        user: {
          email: tempUser?.email,
          magicLoginToken: tempUser?.magicLoginToken,
          expireAt: tempUser?.expireAt,
        },
      })
    );

    res.status(200).end();
  } catch (err) {
    console.log(new Date(), "Error creating temporary user: ", err);
    res.status(500).send({ success: false, error: err.message }).end();
  }
});

// Get records with find and sorting queries. Also have pagination support (limit and skip)
app.post("/records/get", (req, res) => {
  let query;
  let sort;
  let unwind;
  let limit;
  let skip;
  try {
    req.body.query ? (query = req.body.query) : (query = {});
    req.body.sort ? (sort = req.body.sort) : (sort = {});
    req.body.unwind ? (unwind = req.body.unwind) : (unwind = {});
    req.body.limit ? (limit = req.body.limit) : 0;
    req.body.skip ? (limit = req.body.skip) : 0;
    m_client
      .db()
      .collection(process.env.MONGO_XAPI_COLLECTION)
      .find(query, { limit: limit, skip: skip, sort: sort, unwind: unwind })
      .toArray(function (err, results) {
        if (err) {
          console.log("Error while getting records", err);
          console.log("Input Query was: ", query);
          console.log("Sort Query was: ", sort);
          console.log("Limit: ", limit);
          console.log("Skip: ", skip);
          res.status(500).end();
        } else {
          //console.log("Records request received", req.body);
          res
            .status(200)
            .send({ total: results.length, results: results })
            .end();
        }
      });
  } catch (err) {
    console.log("Error while getting records", err);
    console.log("Input Query was: ", query);
    console.log("Sort Query was: ", sort);
    console.log("Limit: ", limit);
    console.log("Skip: ", skip);
    res.status(500).end();
  }
});

// Start the Server
const port =
  process.env.NODE_ENV === "production" ? process.env.PORT || 80 : 4000;
app.listen(port, function () {
  console.log("Server listening on port " + port);

  // Create a timer to delete expired temp users and delete tmp folder
  setInterval(
    routineCleanup,
    // Every 5 minutes
    5 * 60 * 1000
  );
});

// Run the cleanup function on startup
routineCleanup();

// Timer Function to delete expired temp users and delete tmp folder
function routineCleanup() {
  // Delete expired temp users
  User.deleteMany(
    { tempUser: true, expireAt: { $lte: new Date() } },
    function (err, res) {
      if (err) {
        console.log(
          "Routine Cleanup: Error while deleting expired temp users",
          err
        );
      } else {
        if (res.deletedCount > 0)
          console.log(
            "Routine Cleanup: Expired temp users deleted: ",
            res.deletedCount
          );
      }
    }
  );

  // Delete tmp folder files only if files created more than 5 minutes ago
  try {
    const fs = require("fs");
    const path = require("path");
    const directory = "tmp";
    const now = Date.now();
    fs.readdir(directory, (err, files) => {
      try {
        for (const file of files) {
          fs.stat(path.join(directory, file), (err, stat) => {
            if (err) throw err;

            // Delete files created more than 5 minutes ago
            if (now - stat.birthtimeMs > 5 * 60 * 1000) {
              fs.unlink(path.join(directory, file), (err) => {
                if (err) throw err;
                console.log(`Routine Cleanup: Deleted temp file ${file}`);
              });
            }
          });
        }
      } catch (e) {
        // Ignore error if tmp folder does not exist
        // console.log(
        //   "Routine Cleanup: Error while checking tmp folder files, probably there is no tmp folder",
        //   e
        // );
      }
    });
  } catch (e) {
    console.log("Routine Cleanup: Error while deleting tmp folder files", e);
  }
}
