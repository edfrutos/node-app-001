// src/repositories/tasks.repo.sqlite.js
const { db, initDb } = require("../db");

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });
}

function mapTask(row) {
  if (!row) return null;
  return { ...row, done: Boolean(row.done) };
}

async function list() {
  await initDb();
  const rows = await all("SELECT * FROM tasks ORDER BY id DESC");
  return (rows || []).map(mapTask);
}

async function getById(id) {
  await initDb();
  const row = await get("SELECT * FROM tasks WHERE id = ?", [id]);
  return mapTask(row);
}

async function create({ title, done = false }) {
  await initDb();
  const now = new Date().toISOString();
  const r = await run(
    "INSERT INTO tasks (title, done, created_at, updated_at) VALUES (?, ?, ?, ?)",
    [title, done ? 1 : 0, now, now]
  );
  return getById(r.lastID);
}

async function update(id, patch) {
  await initDb();

  const now = new Date().toISOString();
  const fields = [];
  const params = [];

  if (patch.title !== undefined) {
    fields.push("title = ?");
    params.push(patch.title);
  }
  if (patch.done !== undefined) {
    fields.push("done = ?");
    params.push(patch.done ? 1 : 0);
  }
  fields.push("updated_at = ?");
  params.push(now);

  params.push(id);

  await run(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`, params);
  return getById(id);
}

async function remove(id) {
  await initDb();
  const r = await run("DELETE FROM tasks WHERE id = ?", [id]);
  return r.changes > 0;
}

async function _reset() {
  await initDb();
  await run("DELETE FROM tasks");
}

module.exports = { list, getById, create, update, remove, _reset };