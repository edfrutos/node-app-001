// src/middleware/error.middleware.js
module.exports = (err, _req, res, _next) => {
    const status = err.status && Number.isInteger(err.status) ? err.status : 500;
  
    // Log simple (en prod podrías usar pino/winston)
    if (status >= 500) console.error(err);
  
    res.status(status).json({
      error: err.message || "Internal Server Error",
    });
  };