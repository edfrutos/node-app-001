// __tests__/tasks.test.js
process.env.DB_PATH = ":memory:";

const request = require("supertest");
const app = require("../src/app");
const tasksService = require("../src/services/tasks.service");

describe("Tasks API", () => {
  beforeEach(async () => {
    await tasksService._reset();
  });

  test("GET /tasks -> lista vacía", async () => {
    const { statusCode, body } = await request(app).get("/tasks");
    expect(statusCode).toBe(200);
    expect(body).toEqual({ items: [] });
  });

  test("POST /tasks -> crea tarea", async () => {
    const { statusCode, body } = await request(app).post("/tasks").send({ title: "Comprar pan" });
    expect(statusCode).toBe(201);
    expect(body).toHaveProperty("id");
    expect(body.title).toBe("Comprar pan");
    expect(body.done).toBe(false);
  });

  test("PATCH /tasks/:id -> actualiza done", async () => {
    const created = await request(app).post("/tasks").send({ title: "T1" });
    const { id } = created.body;

    const { statusCode, body } = await request(app).patch(`/tasks/${id}`).send({ done: true });
    expect(statusCode).toBe(200);
    expect(body.done).toBe(true);
  });

  test("DELETE /tasks/:id -> 204 y luego 404", async () => {
    const created = await request(app).post("/tasks").send({ title: "T1" });
    const { id } = created.body;

    const del = await request(app).delete(`/tasks/${id}`);
    expect(del.statusCode).toBe(204);

    const get = await request(app).get(`/tasks/${id}`);
    expect(get.statusCode).toBe(404);
  });
});