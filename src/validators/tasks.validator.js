// src/validators/tasks.validator.js
function badRequest(message) {
  const e = new Error(message);
  e.statusCode = 400;
  return e;
}

function toInt(value, { name, min, max, defaultValue }) {
  if (value === undefined || value === null || value === "") return defaultValue;
  const n = Number(value);
  if (!Number.isInteger(n)) throw badRequest(`${name} must be an integer`);
  if (min !== undefined && n < min) throw badRequest(`${name} must be >= ${min}`);
  if (max !== undefined && n > max) throw badRequest(`${name} must be <= ${max}`);
  return n;
}

function toBool(value, { name }) {
  if (value === undefined || value === null || value === "") return undefined;
  if (value === true || value === false) return value;
  const v = String(value).toLowerCase();

  // Truthy
  if (v === "true" || v === "1" || v === "yes" || v === "y" || v === "on") return true;

  // Falsy
  if (v === "false" || v === "0" || v === "no" || v === "n" || v === "off") return false;

  throw badRequest(`${name} must be boolean (true/false)`);
}

function toOrder(value) {
  if (!value) return "desc";
  const v = String(value).toLowerCase();
  if (v === "asc" || v === "desc") return v;
  throw badRequest("order must be asc or desc");
}

const SORT_WHITELIST = new Set(["id", "title", "done", "created_at", "updated_at"]);

function toSort(value) {
  if (!value) return "created_at";
  const v = String(value);
  if (!SORT_WHITELIST.has(v)) {
    throw badRequest(`sort must be one of: ${[...SORT_WHITELIST].join(", ")}`);
  }
  return v;
}

function parseListQuery(query) {
  const page = toInt(query.page, { name: "page", min: 1, defaultValue: 1 });
  const limit = toInt(query.limit, { name: "limit", min: 1, max: 100, defaultValue: 20 });

  const done = toBool(query.done, { name: "done" });

  const search =
    query.search === undefined || query.search === null
      ? undefined
      : String(query.search).trim() || undefined;

  const sort = toSort(query.sort);
  const order = toOrder(query.order);

  return { page, limit, done, search, sort, order };
}

// (Mantengo helpers clásicos por si los usas para POST/PATCH)
function validateCreate(body) {
  if (!body || typeof body.title !== "string") throw badRequest("title is required");
  const title = body.title.trim();
  if (!title) throw badRequest("title cannot be empty");
  return { title };
}

function validatePatch(body) {
  if (!body || typeof body !== "object") throw badRequest("payload is required");

  const updates = {};
  if ("title" in body) {
    if (typeof body.title !== "string") throw badRequest("title must be string");
    const t = body.title.trim();
    if (!t) throw badRequest("title cannot be empty");
    updates.title = t;
  }

  if ("done" in body) {
    if (typeof body.done !== "boolean") throw badRequest("done must be boolean");
    updates.done = body.done;
  }

  if (Object.keys(updates).length === 0) throw badRequest("no valid fields to update");
  return updates;
}

function parseId(value, { name = "id" } = {}) {
  return toInt(value, { name, min: 1 });
}

module.exports = {
  parseListQuery,
  parseId,
  validateCreate,
  validatePatch,
};