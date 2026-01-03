const request = require("supertest");
const { app } = require("../src/app");
const tasksService = require("../src/services/tasks.service");
const { initDb } = require("../src/db");

describe("Tasks API", () => {
  beforeAll(async () => {
    process.env.DB_PATH = ":memory:";
    await initDb();
  });

  beforeEach(async () => {
    await tasksService._reset();
  });

  test("GET /tasks -> lista vacía", async () => {
    const res = await request(app).get("/tasks");
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ items: [] });
  });

  test("POST /tasks -> crea tarea", async () => {
    const res = await request(app).post("/tasks").send({ title: "Comprar pan" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe("Comprar pan");
    expect(res.body.done).toBe(false);
  });
});