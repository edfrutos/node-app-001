const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const fs = require("fs");

const DB_PATH = process.env.DB_PATH || path.join(__dirname, "tasks.sqlite");

const db = new sqlite3.Database(DB_PATH);

function initDb() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");
  db.exec(schema);
}

module.exports = { db, initDb };