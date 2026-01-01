const request = require("supertest");
const { app } = require("../src/app");

describe("Endpoints básicos", () => {
  test("GET /health -> 200 y status ok", async () => {
    const res = await request(app).get("/health");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("status", "ok");
  });

  test("GET /version -> 200 y campos básicos", async () => {
    const res = await request(app).get("/version");
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty("name");
    expect(res.body).toHaveProperty("version");
    expect(res.body).toHaveProperty("gitSha");
    expect(res.body).toHaveProperty("buildDate");
  });

  test("GET /ready -> 200 y ready true", async () => {
    const res = await request(app).get("/ready");
    expect(res.status).toBe(200);
    expect(res.body.ready).toBe(true);
  });

  test("POST /echo -> devuelve lo recibido", async () => {
    const payload = { hola: "mundo" };
    const res = await request(app)
      .post("/echo")
      .set("content-type", "application/json")
      .send(payload);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ received: payload });
  });
});