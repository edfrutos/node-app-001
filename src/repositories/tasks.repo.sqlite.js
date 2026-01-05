// src/repositories/tasks.repo.sqlite.js
const { db, initDb } = require("../db");

// sorting/ordering allowlist to prevent SQL injection
const SORT_WHITELIST = new Set(["id", "title", "done", "created_at", "updated_at"]);

function normalizeListOptions(opts = {}) {
  const page = Math.max(1, Number(opts.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(opts.limit ?? 20)));

  const rawSearch = typeof opts.search === "string" ? opts.search.trim() : "";
  const search = rawSearch.length ? rawSearch : "";

  // done can come as boolean, "true"/"false", 1/0
  let done;
  if (opts.done !== undefined && opts.done !== null && opts.done !== "") {
    if (opts.done === true || opts.done === false) {
      done = opts.done;
    } else {
      const s = String(opts.done).toLowerCase();
      if (s === "true" || s === "1") done = true;
      else if (s === "false" || s === "0") done = false;
      else done = undefined;
    }
  }

  const sortRaw = String(opts.sort ?? "created_at");
  const sort = SORT_WHITELIST.has(sortRaw) ? sortRaw : "created_at";

  const orderRaw = String(opts.order ?? "desc").toLowerCase();
  const order = orderRaw === "asc" ? "asc" : "desc";

  const offset = Math.max(0, Number(opts.offset ?? (page - 1) * limit));

  return { page, limit, offset, search, done, sort, order };
}

function buildWhere({ done, search }) {
  const where = [];
  const params = [];

  if (done !== undefined) {
    where.push("done = ?");
    params.push(done ? 1 : 0);
  }

  if (search) {
    where.push("title LIKE ?");
    params.push(`%${search}%`);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
  return { whereSql, params };
}

async function run(sql, params = []) {
  await initDb();
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

async function get(sql, params = []) {
  await initDb();
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

async function all(sql, params = []) {
  await initDb();
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
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

// --- NUEVO: count con filtros (con normalización)
async function count(opts = {}) {
  await initDb();
  const o = normalizeListOptions(opts);
  const { whereSql, params } = buildWhere(o);

  const row = await get(`SELECT COUNT(*) AS total FROM tasks ${whereSql}`, params);
  return row ? Number(row.total) : 0;
}

// --- NUEVO: listado paginado con filtros y orden (con control fino)
async function listPaged(opts = {}) {
  await initDb();
  const o = normalizeListOptions(opts);
  const { whereSql, params } = buildWhere(o);

  // sort/order are validated via allowlist
  const orderSql = `ORDER BY ${o.sort} ${o.order.toUpperCase()}`;

  const rows = await all(
    `SELECT * FROM tasks ${whereSql} ${orderSql} LIMIT ? OFFSET ?`,
    [...params, o.limit, o.offset]
  );

  return (rows || []).map(mapTask);
}

// --- NUEVO: listado + meta (total/pages) en una sola llamada de repo
async function listWithMeta(opts = {}) {
  const o = normalizeListOptions(opts);
  const total = await count(o);
  const pages = total === 0 ? 0 : Math.ceil(total / o.limit);
  const items = await listPaged(o);

  return {
    items,
    meta: {
      page: o.page,
      limit: o.limit,
      total,
      pages,
      sort: o.sort,
      order: o.order,
    },
  };
}

module.exports = {
  list,
  getById,
  create,
  update,
  remove,
  _reset,
  // NUEVO:
  count,
  listPaged,
  listWithMeta,
};