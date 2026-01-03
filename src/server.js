// src/server.js
// Entry point del servicio HTTP

const { app, setReady } = require("./app");
const { initDb, closeDb } = require("./db");

const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || "0.0.0.0";

function log(...args) {
  // logs consistentes para CI/containers
  console.log("[server]", ...args);
}

async function safeInitDb() {
  // Si no hay DB (o falla), preferimos arrancar igualmente pero marcar /ready = false.
  // Esto permite que el servicio levante y sea depurable.
  try {
    await initDb();
    setReady(true);
    log("db initialized");
  } catch (err) {
    setReady(false);
    console.error("[server] db init failed:", err && err.stack ? err.stack : err);
  }
}

async function main() {
  log("boot", { HOST, PORT, node: process.version });

  await safeInitDb();

  const server = app.listen(PORT, HOST, () => {
    log(`listening on http://${HOST}:${PORT}`);
  });

  server.on("error", (err) => {
    console.error(
      "[server] listen error:",
      err && err.code ? err.code : "",
      err && err.message ? err.message : err
    );
    process.exit(1);
  });

  // Cierre limpio (Docker/K8s/Heroku)
  const shutdown = async (signal) => {
    try {
      log(`shutdown: ${signal}`);
      setReady(false);
      await closeDb();
    } catch (err) {
      console.error("[server] shutdown error:", err && err.stack ? err.stack : err);
    } finally {
      server.close(() => process.exit(0));
      // fallback duro
      setTimeout(() => process.exit(1), 10_000).unref();
    }
  };

  process.on("SIGINT", () => shutdown("SIGINT"));
  process.on("SIGTERM", () => shutdown("SIGTERM"));
}

// Asegura que SIEMPRE se ejecute
main().catch((err) => {
  console.error("[server] fatal boot error:", err && err.stack ? err.stack : err);
  process.exit(1);
});