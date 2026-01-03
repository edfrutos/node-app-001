const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

let db;

/**
 * DB_PATH:
 * - ":memory:" para tests
 * - Por defecto: data/app.db
 */
function getDbPath() {
  return process.env.DB_PATH || path.join("data", "app.db");
}

function ensureDirForFile(filePath) {
  if (filePath === ":memory:") return;
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function open() {
  if (db) return db;

  const dbPath = getDbPath();
  ensureDirForFile(dbPath);

  db = new sqlite3.Database(dbPath);
  // Un par de pragmas razonables
  db.exec("PRAGMA journal_mode=WAL;");
  db.exec("PRAGMA foreign_keys=ON;");
  return db;
}

function migrate() {
  const d = open();
  const path = require("path");
  const fs = require("fs");
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  d.exec(schema);
}

function close() {
  return new Promise((resolve, reject) => {
    if (!db) return resolve();
    db.close((err) => {
      if (err) return reject(err);
      db = null;
      resolve();
    });
  });
}

function run(sql, params = []) {
  const d = open();
  return new Promise((resolve, reject) => {
    d.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ changes: this.changes, lastID: this.lastID });
    });
  });
}

function get(sql, params = []) {
  const d = open();
  return new Promise((resolve, reject) => {
    d.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row || null);
    });
  });
}

function all(sql, params = []) {
  const d = open();
  return new Promise((resolve, reject) => {
    d.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows || []);
    });
  });
}

module.exports = { open, migrate, close, run, get, all };