const express = require("express");
const jwtAuthz = require("express-jwt-authz");
const router = express.Router();

let jwtScopeOptions = {
  failWithError: true,
  customScopeKey: "role",
};

var m_client;

// Public routes

// User scope private routes

// Admin scope private routes
router.post("/register", jwtAuthz(["admin"], jwtScopeOptions), register);

router.get("/getall", getAll);
router.get("/:id", jwtAuthz(["admin"], jwtScopeOptions), getById);
router.put("/:id", jwtAuthz(["admin"], jwtScopeOptions), update);
router.delete("/:id", jwtAuthz(["admin"], jwtScopeOptions), _delete);

module.exports = { router, init };

function init(mongoClient) {
  m_client = mongoClient;
}

function register(req, res, next) {
  // If consumer id is "all" then show error
  if (req.body.id && req.body.id.toLowerCase() === "all") {
    res
      .status(400)
      .send({ success: false, message: "Consumer ID cannot be 'all'" });
    return;
  }

  if (
    req.body.id &&
    req.body.id.length > 0 &&
    req.body.name &&
    req.body.name.length > 0
  ) {
    req.body.createdAt = new Date();

    // Find if any record exists with the same id
    m_client
      .db()
      .collection(process.env.MONGO_XAPI_COLLECTION + "_" + "consumers")
      .findOne({ id: req.body.id }, (err, result) => {
        if (err) {
          console.log(err);
          res.status(500).send({
            success: false,
            message: "Error while registering consumer",
          });
        } else if (result) {
          res
            .status(409)
            .send({ success: false, message: "Consumer already exists" });
        } else {
          m_client
            .db()
            .collection(process.env.MONGO_XAPI_COLLECTION + "_" + "consumers")
            .insertOne(req.body, (err, result) => {
              if (err) {
                console.log(err);
                res.status(500).send(err);
              } else {
                res.status(200).send({
                  success: true,
                  message: "Consumer created",
                  result: result,
                });
              }
            });
        }
      });
  } else {
    res.status(400).send({ success: false, message: "Invalid request" });
  }
}

function getAll(req, res, next) {
  if (req.user.role === "admin") {
    // Read all consumers
    m_client
      .db()
      .collection(process.env.MONGO_XAPI_COLLECTION + "_" + "consumers")
      .find({})
      .sort({ name: 1 })
      .toArray((err, result) => {
        if (err) {
          console.log("Error reading all consumers for admin", err);
          res
            .status(500)
            .send({ success: false, message: "Error while getting consumers" });
        } else {
          // Admin has access to all
          result.push({ id: "all", name: "All" });
          res.status(200).send({ success: true, result: result });
        }
      });
  }
  // Return only the consumers which this user has access to
  else {
    // Get the list of consumersAccess field of current user
    m_client
      .db()
      .collection(process.env.MONGO_XAPI_COLLECTION + "_" + "users")
      .findOne({ email: req.user.email }, (err, resultUser) => {
        if (err) {
          console.log("Error reading all consumers for user", err);
          res
            .status(500)
            .send({ success: false, message: "Error while getting consumers" });
        } else if (resultUser) {
          // Read all consumers
          m_client
            .db()
            .collection(process.env.MONGO_XAPI_COLLECTION + "_" + "consumers")
            .find()
            .sort({ name: 1 })
            .toArray((err, result) => {
              if (err) {
                console.log(err);
                res.status(500).send({
                  success: false,
                  message: "Error while getting consumers",
                });
              } else {
                // Get coursesAccess field of current user which is an array of course ids like ["consumer1_courseId_course123"]
                // Extract the consumer id from each element of the array, and then check if that consumer id is present in the coursesAccess field of current user
                let consumersAccess = resultUser.coursesAccess.map((item) => {
                  return item.split("_")[0];
                });
                // Filter the consumers array based on the consumersAccess array
                result = result.filter((item) => {
                  return consumersAccess.includes(item.id);
                });
                res.status(200).send({ success: true, result: result });
              }
            });
        } else {
          res.status(404).send({ success: false, message: "User not found" });
        }
      });
  }
}

function getById(req, res, next) {
  // Read consumer by id
  // Check if id is not empty and if it exists
  if (req.params.id && req.params.id.length > 0) {
    m_client
      .db()
      .collection(process.env.MONGO_XAPI_COLLECTION + "_" + "consumers")
      .findOne({ id: req.params.id }, (err, result) => {
        if (err) {
          console.log(err);
          res
            .status(500)
            .send({ success: false, message: "Error while getting consumer" });
        } else if (result) {
          res.status(200).send({ success: true, result: result });
        } else {
          res
            .status(404)
            .send({ success: false, message: "Consumer not found" });
        }
      });
  } else {
    res.status(400).send({ success: false, message: "Invalid request" });
  }
}

function update(req, res, next) {
  // Update consumer by id

  // If consumer id is "all" then show error
  if (req.params.id && req.params.id.toLowerCase() === "all") {
    res
      .status(400)
      .send({ success: false, message: "Consumer id cannot be 'all'" });
    return;
  }

  // Check if id is not empty and if it exists
  if (req.params.id && req.params.id.length > 0) {
    m_client
      .db()
      .collection(process.env.MONGO_XAPI_COLLECTION + "_" + "consumers")
      .updateOne({ id: req.params.id }, { $set: req.body }, (err, result) => {
        if (err) {
          console.log(err);
          res
            .status(500)
            .send({ success: false, message: "Error while updating consumer" });
        } else if (result) {
          res.status(200).send({ success: true, result: result });
        } else {
          res
            .status(404)
            .send({ success: false, message: "Consumer not found" });
        }
      });
  } else {
    res.status(400).send({ success: false, message: "Invalid request" });
  }
}

function _delete(req, res, next) {
  // Delete consumer by id
  // Check if id is not empty and if it exists
  if (req.params.id && req.params.id.length > 0) {
    // Check if consumer id is found in the database
    m_client
      .db()
      .collection(process.env.MONGO_XAPI_COLLECTION + "_" + "consumers")
      .findOne({ id: req.params.id }, (err, result) => {
        if (err) {
          console.log(err);
          res
            .status(500)
            .send({ success: false, message: "Error while deleting consumer" });
        } else if (result) {
          // Delete consumer

          m_client
            .db()
            .collection(process.env.MONGO_XAPI_COLLECTION + "_" + "consumers")
            .deleteOne({ id: req.params.id }, (err, result) => {
              if (err) {
                console.log(err);
                res.status(500).send({
                  success: false,
                  message: "Error while deleting consumer",
                });
              } else if (result) {
                res.status(200).send({ success: true, result: result });
              } else {
                res
                  .status(404)
                  .send({ success: false, message: "Consumer not found" });
              }
            });
        } else {
          res
            .status(404)
            .send({ success: false, message: "Consumer not found" });
        }
      });
  }
}
