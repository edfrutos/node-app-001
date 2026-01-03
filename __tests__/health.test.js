// __tests__/health.test.js
process.env.DB_PATH = ":memory:";

const request = require("supertest");
const app = require("../src/app");

describe("Endpoints básicos", () => {
  test("GET /health -> 200 y status ok", async () => {
    const { statusCode, body } = await request(app).get("/health");
    expect(statusCode).toBe(200);
    expect(body.status).toBe("ok");
  });

  test("GET /version -> 200 y campos básicos", async () => {
    const { statusCode, body } = await request(app).get("/version");
    expect(statusCode).toBe(200);
    expect(body).toHaveProperty("name");
    expect(body).toHaveProperty("version");
  });

  test("POST /echo -> devuelve lo recibido", async () => {
    const { statusCode, body } = await request(app).post("/echo").send({ hola: "mundo" });
    expect(statusCode).toBe(200);
    expect(body.received).toEqual({ hola: "mundo" });
  });
});