// src/errors/httpError.js

class HttpError extends Error {
    /**
     * @param {number} statusCode
     * @param {string} code - stable error code, e.g. VALIDATION_ERROR
     * @param {string} message
     * @param {object} [details]
     */
    constructor(statusCode, code, message, details) {
      super(message);
      this.name = "HttpError";
      this.statusCode = statusCode;
      this.code = code;
      this.details = details;
    }
  }
  
  function badRequest(message, details) {
    return new HttpError(400, "VALIDATION_ERROR", message, details);
  }
  
  function notFound(message = "Not found", details) {
    return new HttpError(404, "NOT_FOUND", message, details);
  }
  
  function conflict(message, details) {
    return new HttpError(409, "CONFLICT", message, details);
  }
  
  module.exports = { HttpError, badRequest, notFound, conflict };