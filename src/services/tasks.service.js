// src/services/tasks.service.js
const repo = require("../repositories/tasks.repo.sqlite");

function httpError(statusCode, message) {
  const e = new Error(message);
  e.statusCode = statusCode;
  return e;
}

function badRequest(message) {
  return httpError(400, message);
}

function notFound(message) {
  return httpError(404, message);
}

async function list() {
  const items = await repo.list();
  return { items };
}

async function getById(id) {
  const item = await repo.getById(id);
  if (!item) throw notFound("task not found");
  return item;
}

async function create(payload) {
  if (!payload || typeof payload.title !== "string") {
    throw badRequest("title is required");
  }
  const title = payload.title.trim();
  if (!title) throw badRequest("title cannot be empty");

  return repo.create({ title });
}

async function patch(id, payload) {
  if (!payload || typeof payload !== "object") {
    throw badRequest("payload is required");
  }

  const updates = {};

  if ("title" in payload) {
    if (typeof payload.title !== "string") throw badRequest("title must be string");
    const t = payload.title.trim();
    if (!t) throw badRequest("title cannot be empty");
    updates.title = t;
  }

  if ("done" in payload) {
    if (typeof payload.done !== "boolean") throw badRequest("done must be boolean");
    updates.done = payload.done;
  }

  const updated = await repo.update(id, updates);
  if (!updated) throw notFound("task not found");
  return updated;
}

async function remove(id) {
  const ok = await repo.remove(id);
  if (!ok) throw notFound("task not found");
  return true;
}

// Solo tests
async function _reset() {
  await repo._reset();
}

module.exports = { list, getById, create, patch, remove, _reset };