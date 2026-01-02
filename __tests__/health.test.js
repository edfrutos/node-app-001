// __tests__/tasks.test.js
const request = require("supertest");
const { app } = require("../src/app");
const tasksService = require("../src/services/tasks.service");
const { initDb } = require("../src/db");

describe("Tasks API", () => {
  beforeAll(() => {
    initDb();
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

  test("PATCH /tasks/:id -> actualiza done", async () => {
    const created = await request(app).post("/tasks").send({ title: "T1" });
    const { id } = created.body;

    const res = await request(app).patch(`/tasks/${id}`).send({ done: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.done).toBe(true);
  });

  test("DELETE /tasks/:id -> 204", async () => {
    const created = await request(app).post("/tasks").send({ title: "T1" });
    const { id } = created.body;

    const del = await request(app).delete(`/tasks/${id}`);
    expect(del.statusCode).toBe(204);

    const get = await request(app).get(`/tasks/${id}`);
    expect(get.statusCode).toBe(404);
  });
});