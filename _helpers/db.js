const mongoose = require("mongoose");
const connectionOptions = {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
};
mongoose
  .connect(
    process.env.MONGO_URL, connectionOptions
  )
  .then(() => {
    console.log("Mongoose connected");
  });
mongoose.Promise = global.Promise;

module.exports = {
  User: require("../users/user.model"),
};
