const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("_helpers/db");
const User = db.User;

module.exports = {
  authenticate,
  getAll,
  getById,
  create,
  update,
  delete: _delete,
};

async function authenticate({ email, password }) {
  const user = await User.findOne({ email });
  if (user && bcrypt.compareSync(password, user.hash)) {
    const token = jwt.sign(
      { email: email, sub: user.id, role: user.role },
      process.env.SECRET,
      {
        expiresIn: "7d",
      }
    );
    user.lastLogin = Date.now();
    await user.save();
    return {
      ...user.toJSON(),
      token,
    };
  }
}

async function getAll(req) {
  return await User.find();
}

async function getById(id) {
  return await User.findById(id);
}

async function create(userParam, admin = false) {
  // Validate if an email is already taken
  if (await User.findOne({ email: userParam.email })) {
    throw 'email "' + userParam.email + '" is already taken';
  }

  const user = new User(userParam);

  // Hash the password password
  if (userParam.password) {
    user.hash = bcrypt.hashSync(userParam.password, 10);
  }

  // If create an admin argument is there, then add a field role as an admin
  if (admin) { user.role = "admin"; }

  // Save the user to the database
  await user.save();
}

async function update(id, userParam) {
  const user = await User.findById(id);

  // Validate if user exists
  if (!user) throw "User not found";
  if (
    user.email !== userParam.email &&
    (await User.findOne({ email: userParam.email }))
  ) {
    throw 'email "' + userParam.email + '" is already taken';
  }

  // Hash password
  if (userParam.password) {
    userParam.hash = bcrypt.hashSync(userParam.password, 10);
  }

  // Copy userParam properties to user
  Object.assign(user, userParam);

  await user.save();
}

async function _delete(id) {
  await User.findByIdAndRemove(id);
}
