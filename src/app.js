// src/app.js
const express = require("express");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");

const { openapi } = require("./openapi");
const tasksRouter = require("./routes/tasks.routes");
const errorMiddleware = require("./middleware/error.middleware");

const app = express();

app.use(helmet());
app.use(express.json({ limit: "1mb" }));

const APP_NAME = process.env.APP_NAME || "node-app-001";
const APP_VERSION = process.env.APP_VERSION || "dev";
const GIT_SHA = process.env.GIT_SHA || "unknown";
const BUILD_DATE = process.env.BUILD_DATE || "unknown";

app.get("/", (_req, res) => res.type("text").send("OK"));

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

app.post("/echo", (req, res) => res.json({ received: req.body }));

// readiness
let isReady = true;
function setReady(v) {
  isReady = Boolean(v);
}
app.get("/ready", (_req, res) => res.status(isReady ? 200 : 503).json({ ready: isReady }));

// =======================
// Docs (Swagger UI) “pro”
// =======================
// Control fino: separa /docs de /docs/ sin depender del strict routing global
const docsRouter = express.Router({ strict: true });
const swaggerUiOptions = { explorer: true };

// Flag “pro”: permite desactivar la UI en prod (por defecto ON)
// - DOCS_ENABLED=false -> desactiva /docs/ (pero mantiene /openapi.json)
const DOCS_ENABLED = process.env.DOCS_ENABLED !== "false";

// spec JSON (siempre disponible)
docsRouter.get("/openapi.json", (_req, res) => {
  res.set("Cache-Control", "no-store");
  res.json(openapi);
});

// /docs -> /docs/ (canonical)
// 308: redirect permanente (y consistente)
docsRouter.get("/docs", (_req, res) => res.redirect(308, "/docs/"));

if (DOCS_ENABLED) {
  // /docs/ (HTML + assets)
  docsRouter.use("/docs/", swaggerUi.serve, swaggerUi.setup(openapi, swaggerUiOptions));
} else {
  docsRouter.get("/docs/", (_req, res) => res.status(404).type("text").send("Docs disabled"));
}

app.use(docsRouter);

// API routes
app.use("/tasks", tasksRouter);

// error middleware AL FINAL
app.use(errorMiddleware);

module.exports = { app, setReady };
