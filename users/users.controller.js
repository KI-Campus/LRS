const express = require("express");
const jwtAuthz = require("express-jwt-authz");
const router = express.Router();
const userService = require("./user.service");

let jwtScopeOptions = {
  failWithError: false,
  customScopeKey: "role",
};

// Public routes
router.post("/authenticate", authenticate);

// Make /register reachable for development environment. But for initial deployment, make /register reachable
if (process.env.NODE_ENV === "development") {
  router.post("/register", registerAdmin);
}
// Make /register reachable only for admin scope in production environment
else {
  router.post("/register", jwtAuthz(["admin"], jwtScopeOptions), registerAdmin);
}

// User scope private routes
router.get("/current", getCurrent);
router.put("/current", updateCurrent);

// Admin scope private routes
router.get("/getall", jwtAuthz(["admin"], jwtScopeOptions), getAll);
router.get("/:id", jwtAuthz(["admin"], jwtScopeOptions), getById);
router.put("/:id", jwtAuthz(["admin"], jwtScopeOptions), update);
router.delete("/:id", jwtAuthz(["admin"], jwtScopeOptions), _delete);
router.post("/register", jwtAuthz(["admin"], jwtScopeOptions), register);
module.exports = router;

function authenticate(req, res, next) {
  userService
    .authenticate(req.body)
    .then((user) =>
      user
        ? res.json(user)
        : res.status(400).json({
            success: false,
            message: "Email or password is incorrect. Please try again",
          })
    )
    .catch((err) => next(err));
}

function register(req, res, next) {
  userService
    .create(req.body)
    .then(() => res.json({ success: true }))
    .catch((err) => next(err));
}

function registerAdmin(req, res, next) {
  userService
    .create(req.body, true)
    .then(() => res.json({ success: true }))
    .catch((err) => next(err));
}

function getAll(req, res, next) {
  userService
    .getAll(req)
    .then((users) => res.json(users))
    .catch((err) => next(err));
}

function getCurrent(req, res, next) {
  userService
    .getById(req.user.sub)
    .then((user) => (user ? res.json(user) : res.sendStatus(404)))
    .catch((err) => next(err));
}

function getById(req, res, next) {
  userService
    .getById(req.params.id)
    .then((user) => (user ? res.json(user) : res.sendStatus(404)))
    .catch((err) => next(err));
}

function update(req, res, next) {
  userService
    .update(req.params.id, req.body)
    .then(() => res.json({ success: true, user: req.body }))
    .catch((err) => next(err));
}

function updateCurrent(req, res, next) {
  userService
    .update(req.user.sub, req.body)
    .then(() => res.json({ success: true, user: req.body }))
    .catch((err) => next(err));
}

function _delete(req, res, next) {
  userService
    .delete(req.params.id)
    .then(() => res.json({ success: true }))
    .catch((err) => next(err));
}
