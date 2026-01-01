const request = require("supertest");
const app = require("../src/app");

describe("health/version/echo", () => {
  test("GET /health -> ok", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
  });

  test("GET /version -> contiene name/version", async () => {
    const res = await request(app).get("/version");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name");
    expect(res.body).toHaveProperty("version");
  });

  test("POST /echo -> devuelve lo recibido", async () => {
    const payload = { hola: "mundo" };
    const res = await request(app).post("/echo").send(payload);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ received: payload });
  });
});