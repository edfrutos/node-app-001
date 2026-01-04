// src/openapi.js
const swaggerJSDoc = require("swagger-jsdoc");

const PORT = process.env.PORT || 3000;

const definition = {
  openapi: "3.0.3",
  info: {
    title: "node-app-001 API",
    version: process.env.APP_VERSION || "dev",
    description: "API de ejemplo profesional: health/version/ready/tasks (SQLite)",
  },
  servers: [{ url: `http://localhost:${PORT}` }],
  tags: [{ name: "System" }, { name: "Tasks" }],
};

const options = {
  definition,
  apis: [], // vamos a declarar el spec “a mano” abajo
};

const base = swaggerJSDoc(options);

// Extendemos con paths definidos explícitamente (robusto y simple)
base.paths = {
  "/health": {
    get: {
      tags: ["System"],
      summary: "Healthcheck",
      responses: {
        200: { description: "OK" },
      },
    },
  },
  "/ready": {
    get: {
      tags: ["System"],
      summary: "Readiness",
      responses: {
        200: { description: "Ready" },
        503: { description: "Not ready" },
      },
    },
  },
  "/version": {
    get: {
      tags: ["System"],
      summary: "Build/version info",
      responses: {
        200: { description: "Build metadata" },
      },
    },
  },
  "/tasks": {
    get: {
      tags: ["Tasks"],
      summary: "List tasks (filters + pagination)",
      parameters: [
        { name: "page", in: "query", schema: { type: "integer", minimum: 1 }, description: "Página (1..)" },
        { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 }, description: "Elementos por página" },
        { name: "search", in: "query", schema: { type: "string" }, description: "Búsqueda por título" },
        { name: "done", in: "query", schema: { type: "boolean" }, description: "Filtra por done=true/false" },
      ],
      responses: {
        200: { description: "Lista de tareas" },
      },
    },
    post: {
      tags: ["Tasks"],
      summary: "Create task",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              required: ["title"],
              properties: {
                title: { type: "string" },
              },
            },
          },
        },
      },
      responses: {
        201: { description: "Creada" },
        400: { description: "Validación" },
      },
    },
  },
  "/tasks/{id}": {
    get: {
      tags: ["Tasks"],
      summary: "Get task by id",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      responses: {
        200: { description: "OK" },
        404: { description: "Not found" },
      },
    },
    patch: {
      tags: ["Tasks"],
      summary: "Patch task",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                title: { type: "string" },
                done: { type: "boolean" },
              },
            },
          },
        },
      },
      responses: {
        200: { description: "Actualizada" },
        400: { description: "Validación" },
        404: { description: "Not found" },
      },
    },
    delete: {
      tags: ["Tasks"],
      summary: "Delete task",
      parameters: [{ name: "id", in: "path", required: true, schema: { type: "integer" } }],
      responses: {
        204: { description: "Deleted" },
        404: { description: "Not found" },
      },
    },
  },
};

module.exports = { openapi: base };