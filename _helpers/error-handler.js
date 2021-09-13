module.exports = errorHandler;

function errorHandler(err, req, res, next) {
  if (typeof err === "string") {
    // Custom application error
    return res.status(400).json({ success: false, message: err });
  }

  if (err.name === "ValidationError") {
    // Mongoose validation error
    return res.status(400).json({ success: false, message: err.message });
  }

  if (err.name === "UnauthorizedError") {
    // JWT authentication error
    return res.status(401).json({ success: false, message: "Invalid Token" });
  }

  // Default to 500 server error
  return res.status(500).json({ success: false, message: err.message });
}
