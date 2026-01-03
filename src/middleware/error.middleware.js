// src/middleware/error.middleware.js
module.exports = function errorMiddleware(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;

  // Log mínimo (en prod podrías usar un logger)
  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    error: err.message || "internal error",
  });
};