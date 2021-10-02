const expressJwt = require("express-jwt");
const userService = require("../users/user.service");

module.exports = jwt;

function jwt() {
  const secret = process.env.SECRET;
  return expressJwt({ secret, algorithms: ["HS256"], isRevoked }).unless({
    path: [
      // Public routes that don't require JWT authentication
      "/users/authenticate",
      // "/users/register",                       // Do not allow registration
      "/",
      "/favicon.ico",
      "/lrs",
    ],
  });
}

async function isRevoked(req, payload, done) {
  const user = await userService.getById(payload.sub);

  // Revoke token if user no longer exists
  if (!user) {
    return done(null, true);
  }

  done();
}
