const request = require("supertest");
const { app, setReady } = require("../src/app");

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
  });

  test("GET /ready -> 200 cuando ready", async () => {
    setReady(true);
    const res = await request(app).get("/ready");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ ready: true });
  });

  test("GET /ready -> 503 cuando NOT ready", async () => {
    setReady(false);
    const res = await request(app).get("/ready");
    expect(res.statusCode).toBe(503);
    expect(res.body).toEqual({ ready: false });
    setReady(true);
  });
});