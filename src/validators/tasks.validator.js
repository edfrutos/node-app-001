// src/validators/tasks.validator.js
function badRequest(message) {
  const e = new Error(message);
  e.statusCode = 400;
  return e;
}

function validateCreate(payload) {
  if (!payload || typeof payload !== "object") throw badRequest("payload is required");
  if (typeof payload.title !== "string") throw badRequest("title is required");

  const title = payload.title.trim();
  if (!title) throw badRequest("title cannot be empty");

  return { title };
}

function validatePatch(payload) {
  if (!payload || typeof payload !== "object") throw badRequest("payload is required");

  const updates = {};
  let touched = false;

  if ("title" in payload) {
    touched = true;
    if (typeof payload.title !== "string") throw badRequest("title must be string");
    const title = payload.title.trim();
    if (!title) throw badRequest("title cannot be empty");
    updates.title = title;
  }

  if ("done" in payload) {
    touched = true;
    if (typeof payload.done !== "boolean") throw badRequest("done must be boolean");
    updates.done = payload.done;
  }

  if (!touched) throw badRequest("no fields to update");
  return updates;
}

module.exports = { validateCreate, validatePatch };