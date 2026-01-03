// src/middleware/error.middleware.js
module.exports = function errorMiddleware(err, _req, res, _next) {
  const status = err.statusCode || err.status || 500;

  // En prod, evita filtrar detalles
  const payload = {
    error: status >= 500 ? "internal_error" : "bad_request",
    message: err.message || "error",
  };

  res.status(status).json(payload);
};