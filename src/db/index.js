// src/db/index.js
const path = require("path");
const fs = require("fs/promises");
const sqlite3 = require("sqlite3").verbose();

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "tasks.sqlite");
const db = new sqlite3.Database(DB_PATH);

let _initialized = false;

async function initDb() {
  if (_initialized) return;
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = await fs.readFile(schemaPath, "utf8");

  await new Promise((resolve, reject) => {
    db.exec(schema, (err) => (err ? reject(err) : resolve()));
  });

  _initialized = true;
}

module.exports = { db, initDb, DB_PATH };