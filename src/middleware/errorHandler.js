/**
 * Global error handler middleware
 */

const errorHandler = (err, req, res, next) => {
  // Can use proper logging in production
  console.error("Error:", err.message);
  console.error("Stack:", err.stack);

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({
      error: "Validation failed",
      details: messages,
    });
  }

  // Mongoose cast error (invalid ObjectId, etc.)
  if (err.name === "CastError") {
    return res.status(400).json({
      error: "Invalid data format",
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      error: "Duplicate entry",
    });
  }

  // JSON parsing error
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({
      error: "Invalid JSON in request body",
    });
  }

  // Default to 500 Internal Server Error
  return res.status(500).json({
    error: "Internal server error",
  });
};

const notFoundHandler = (req, res) => {
  return res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
  });
};

module.exports = {
  errorHandler,
  notFoundHandler,
};
