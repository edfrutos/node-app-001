const request = require("supertest");
const { app } = require("../src/app");
const tasksService = require("../src/services/tasks.service");

describe("Tasks API", () => {
  beforeEach(async () => {
    await tasksService._reset();
  });

  test("GET /tasks -> lista vacía + meta", async () => {
    const { statusCode, body } = await request(app).get("/tasks");
    expect(statusCode).toBe(200);
    expect(body.items).toEqual([]);
    expect(body).toHaveProperty("meta");
    expect(body.meta).toMatchObject({ page: 1 });
  });

  test("POST /tasks -> crea tarea", async () => {
    const { statusCode, body } = await request(app)
      .post("/tasks")
      .send({ title: "Comprar pan" });

    expect(statusCode).toBe(201);
    expect(body).toHaveProperty("id");
    expect(body.title).toBe("Comprar pan");
    expect(body.done).toBe(false);
  });

  test("GET /tasks?search=pan -> filtra por búsqueda", async () => {
    await request(app).post("/tasks").send({ title: "Comprar pan" });
    await request(app).post("/tasks").send({ title: "Comprar leche" });

    const { statusCode, body } = await request(app).get("/tasks?search=pan");
    expect(statusCode).toBe(200);
    expect(body.items).toHaveLength(1);
    expect(body.items[0].title).toMatch(/pan/i);
  });

  test("GET /tasks?done=false -> filtra por done", async () => {
    const {
      body: { id },
    } = await request(app).post("/tasks").send({ title: "T1" });

    await request(app).patch(`/tasks/${id}`).send({ done: true });

    const { statusCode, body } = await request(app).get("/tasks?done=false");
    expect(statusCode).toBe(200);
    expect(body.items.find((x) => x.id === id)).toBeUndefined();
  });

  test("GET /tasks?limit=5&page=2 -> paginación", async () => {
    // crea 12 tareas para asegurar 3 páginas con limit=5
    for (let i = 1; i <= 12; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await request(app).post("/tasks").send({ title: `T${i}` });
    }

    const { statusCode, body } = await request(app).get("/tasks?limit=5&page=2");
    expect(statusCode).toBe(200);
    expect(body.items.length).toBe(5);
    expect(body).toHaveProperty("meta");
    expect(body.meta).toMatchObject({ page: 2, limit: 5 });
  });

  test("PATCH /tasks/:id -> actualiza done", async () => {
    const {
      body: { id },
    } = await request(app).post("/tasks").send({ title: "T1" });

    const { statusCode, body } = await request(app)
      .patch(`/tasks/${id}`)
      .send({ done: true });

    expect(statusCode).toBe(200);
    expect(body.done).toBe(true);
  });

  test("DELETE /tasks/:id -> 204 y luego 404", async () => {
    const {
      body: { id },
    } = await request(app).post("/tasks").send({ title: "T1" });

    const del = await request(app).delete(`/tasks/${id}`);
    expect(del.statusCode).toBe(204);

    const get = await request(app).get(`/tasks/${id}`);
    expect(get.statusCode).toBe(404);
  });
});