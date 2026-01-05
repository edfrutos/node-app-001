// src/routes/tasks.routes.js
const express = require("express");
const ctrl = require("../controllers/tasks.controller");

const router = express.Router();

// ------------------------------------------------------------
// Helpers
// ------------------------------------------------------------
function asyncHandler(fn) {
  return function wrapped(req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function toInt(value, fallback) {
  if (value === undefined || value === null || value === "") return fallback;
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function toBool(value) {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value === "boolean") return value;
  const s = String(value).trim().toLowerCase();
  if (["true", "1", "yes", "y", "on"].includes(s)) return true;
  if (["false", "0", "no", "n", "off"].includes(s)) return false;
  return undefined;
}

// Normaliza query params para el listado (control fino)
function normalizeListQuery(req, _res, next) {
  const page = Math.max(1, toInt(req.query.page, 1));
  const limit = Math.min(100, Math.max(1, toInt(req.query.limit, 20)));

  const done = toBool(req.query.done);

  const search = typeof req.query.search === "string" ? req.query.search.trim() : undefined;

  const sortRaw = typeof req.query.sort === "string" ? req.query.sort.trim() : "id";
  const orderRaw = typeof req.query.order === "string" ? req.query.order.trim() : "desc";

  // Lista blanca simple (evita SQL injection si el repo usa sort/order dinámicos)
  const sortWhitelist = new Set(["id", "title", "done", "created_at", "updated_at"]);
  const sort = sortWhitelist.has(sortRaw) ? sortRaw : "id";

  const order = orderRaw.toLowerCase() === "asc" ? "asc" : "desc";

  // Mantén compatibilidad: exponemos tanto `req.query` normalizado como `req.listQuery`
  req.listQuery = { page, limit, done, search, sort, order };
  req.query = { ...req.query, page, limit, sort, order };
  if (done !== undefined) req.query.done = done;
  if (search) req.query.search = search;

  next();
}

// Valida :id como entero
router.param("id", (req, res, next, id) => {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) {
    return res.status(400).json({ error: "id must be a positive integer" });
  }
  req.params.id = String(n);
  next();
});

// ------------------------------------------------------------
// Routes
// ------------------------------------------------------------
router.get("/", normalizeListQuery, asyncHandler(ctrl.list));
router.get("/:id", asyncHandler(ctrl.getById));
router.post("/", asyncHandler(ctrl.create));
router.patch("/:id", asyncHandler(ctrl.patch));
router.delete("/:id", asyncHandler(ctrl.remove));

module.exports = router;