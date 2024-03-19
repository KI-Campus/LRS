const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Define the user schema
const schema = new Schema({
  hash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date },
  email: { type: String, unique: true, required: true },
  role: { type: String, unique: false, default: "user" },
  coursesAccess: { type: Array, default: [] },
  expireAt: { type: Date, default: undefined },
  magicLoginToken: { type: String, default: undefined },
  tempUser: { type: Boolean, default: false },
});

// When returning the user object, don't include the MongoDB _id and password fields
schema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
    delete ret.hash;
  },
});

module.exports = mongoose.model(
  process.env.MONGO_XAPI_COLLECTION + "_" + "User",
  schema
);
