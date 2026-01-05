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
// src/middleware/error.middleware.js
const { HttpError } = require("../errors/httpError");

function normalizeError(err) {
  // Errores tipados propios
  if (err instanceof HttpError) {
    return {
      statusCode: err.statusCode,
      payload: {
        error: {
          code: err.code,
          message: err.message,
          ...(err.details ? { details: err.details } : {}),
        },
      },
    };
  }

  // Si alguien ya nos puso statusCode (legacy)
  if (err && typeof err.statusCode === "number") {
    return {
      statusCode: err.statusCode,
      payload: {
        error: {
          code: err.code || "ERROR",
          message: err.message || "Error",
        },
      },
    };
  }

  // Fallback
  return {
    statusCode: 500,
    payload: {
      error: {
        code: "INTERNAL_ERROR",
        message: "Internal server error",
      },
    },
  };
}

module.exports = function errorMiddleware(err, req, res, _next) {
  const { statusCode, payload } = normalizeError(err);

  // opcional: no revelar detalles en prod
  // (si quieres, aquí podemos añadir logs estructurados en el siguiente feature)
  res.status(statusCode).json(payload);
};