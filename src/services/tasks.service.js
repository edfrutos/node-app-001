// src/services/tasks.service.js
const repo = require("../repositories/tasks.repo.sqlite");

function httpError(statusCode, message) {
  const err = new Error(message);
  err.statusCode = statusCode;
  return err;
}
function badRequest(message) {
  return httpError(400, message);
}
function normalizeId(id) {
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) throw badRequest("id must be a positive integer");
  return n;
}

async function list() {
  const items = await repo.list();
  return { items };
}

async function getById(id) {
  return repo.getById(normalizeId(id));
}

async function create(payload) {
  if (!payload || typeof payload !== "object") throw badRequest("payload is required");
  if (typeof payload.title !== "string") throw badRequest("title is required");

  const title = payload.title.trim();
  if (!title) throw badRequest("title cannot be empty");

  return repo.create({ title });
}

async function patch(id, payload) {
  const taskId = normalizeId(id);
  if (!payload || typeof payload !== "object") throw badRequest("payload is required");

  const updates = {};

  if (Object.prototype.hasOwnProperty.call(payload, "title")) {
    if (typeof payload.title !== "string") throw badRequest("title must be string");
    const title = payload.title.trim();
    if (!title) throw badRequest("title cannot be empty");
    updates.title = title;
  }

  if (Object.prototype.hasOwnProperty.call(payload, "done")) {
    if (typeof payload.done !== "boolean") throw badRequest("done must be boolean");
    updates.done = payload.done;
  }

  if (Object.keys(updates).length === 0) throw badRequest("no valid fields to update");

  return repo.update(taskId, updates);
}

async function remove(id) {
  return repo.remove(normalizeId(id));
}

// SOLO TESTS
async function _reset() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("_reset is test-only");
  }
  await repo._reset();
}

module.exports = { list, getById, create, patch, remove, _reset };