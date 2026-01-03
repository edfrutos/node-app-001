// src/app.js
const express = require("express");
const helmet = require("helmet");

const { initDb } = require("./db");

const app = express();

app.use(helmet());
app.use(express.json({ limit: "1mb" }));

const APP_NAME = process.env.APP_NAME || "node-app-001";
const APP_VERSION = process.env.APP_VERSION || "dev";
const GIT_SHA = process.env.GIT_SHA || "unknown";
const BUILD_DATE = process.env.BUILD_DATE || "unknown";

app.get("/", (_req, res) => {
  res.type("text").send("OK");
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    name: APP_NAME,
    version: APP_VERSION,
    gitSha: GIT_SHA,
    buildDate: BUILD_DATE,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/version", (_req, res) => {
  res.json({
    name: APP_NAME,
    version: APP_VERSION,
    gitSha: GIT_SHA,
    buildDate: BUILD_DATE,
  });
});

app.post("/echo", (req, res) => {
  res.json({ received: req.body });
});

// Tasks
const tasksRouter = require("./routes/tasks.routes");
app.use("/tasks", tasksRouter);

// Error middleware AL FINAL
const errorMiddleware = require("./middleware/error.middleware");
app.use(errorMiddleware);

// Inicializa DB (idempotente)
initDb().catch((e) => {
  console.error("DB init failed:", e);
  process.exit(1);
});

module.exports = app;