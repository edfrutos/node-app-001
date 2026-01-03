// src/db/index.js
const path = require("path");
const fs = require("fs");
const sqlite3 = require("sqlite3").verbose();

// Para tests: DB_FILE=:memory:
const DB_FILE =
  process.env.DB_FILE ||
  process.env.DB_PATH ||
  path.join(__dirname, "tasks.sqlite");

// si NO es :memory:, asegura directorio
if (DB_FILE !== ":memory:") {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// La conexión existe siempre para que `require('../db').db` funcione
const db = new sqlite3.Database(DB_FILE);

let initialized = false;

function exec(sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => (err ? reject(err) : resolve()));
  });
}

// Compat: si alguna parte del código llama openDb() antes de initDb()
async function openDb() {
  return db;
}

async function initDb() {
  if (initialized) return;

  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  await exec(schema);

  initialized = true;
}

async function closeDb() {
  await new Promise((resolve, reject) => {
    db.close((err) => (err ? reject(err) : resolve()));
  });
  initialized = false;
}

module.exports = { db, openDb, initDb, closeDb };