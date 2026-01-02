const { db } = require("../db");

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
  return {
    ...row,
    done: Boolean(row.done),
  };
}

async function list({ done } = {}) {
  let rows;
  if (done === undefined) {
    rows = await all("SELECT * FROM tasks ORDER BY id DESC");
  } else {
    rows = await all("SELECT * FROM tasks WHERE done = ? ORDER BY id DESC", [done ? 1 : 0]);
  }
  return (rows || []).map(mapTask);
}

async function getById(id) {
  const row = await get("SELECT * FROM tasks WHERE id = ?", [id]);
  return mapTask(row);
}

async function create({ title, done = false }) {
  const now = new Date().toISOString();
  const r = await run(
    "INSERT INTO tasks (title, done, created_at, updated_at) VALUES (?, ?, ?, ?)",
    [title, done ? 1 : 0, now, now]
  );
  const row = await get("SELECT * FROM tasks WHERE id = ?", [r.lastID]);
  return mapTask(row);
}

async function update(id, { title, done }) {
  const now = new Date().toISOString();
  // Construcción dinámica segura
  const fields = [];
  const params = [];

  if (title !== undefined) {
    fields.push("title = ?");
    params.push(title);
  }
  if (done !== undefined) {
    fields.push("done = ?");
    params.push(done ? 1 : 0);
  }
  fields.push("updated_at = ?");
  params.push(now);

  params.push(id);

  await run(`UPDATE tasks SET ${fields.join(", ")} WHERE id = ?`, params);
  const row = await get("SELECT * FROM tasks WHERE id = ?", [id]);
  return mapTask(row);
}

async function remove(id) {
  const r = await run("DELETE FROM tasks WHERE id = ?", [id]);
  return r.changes > 0;
}

// Solo para tests (no usar en prod)
async function _reset() {
  await run("DELETE FROM tasks");
}

module.exports = { list, getById, create, update, remove, _reset };