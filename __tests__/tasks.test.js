const request = require("supertest");
const { app } = require("../src/app");
const tasksService = require("../src/services/tasks.service");

describe("Tasks API", () => {
  beforeEach(async () => {
    await tasksService._reset();
  });

  test("GET /tasks -> lista vacía + meta", async () => {
    const res = await request(app).get("/tasks");
    expect(res.statusCode).toBe(200);
    expect(res.body.items).toEqual([]);
    expect(res.body).toHaveProperty("meta");
    expect(res.body.meta).toMatchObject({ page: 1 });
  });

  test("POST /tasks -> crea tarea", async () => {
    const res = await request(app).post("/tasks").send({ title: "Comprar pan" });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.title).toBe("Comprar pan");
    expect(res.body.done).toBe(false);
  });

  test("GET /tasks?search=pan -> filtra por búsqueda", async () => {
    await request(app).post("/tasks").send({ title: "Comprar pan" });
    await request(app).post("/tasks").send({ title: "Comprar leche" });

    const res = await request(app).get("/tasks?search=pan");
    expect(res.statusCode).toBe(200);
    expect(res.body.items.length).toBe(1);
    expect(res.body.items[0].title).toMatch(/pan/i);
  });

  test("GET /tasks?done=false -> filtra por done", async () => {
    const { body: { id } } = await request(app).post("/tasks").send({ title: "T1" });

    await request(app).patch(`/tasks/${id}`).send({ done: true });

    const res = await request(app).get("/tasks?done=false");
    expect(res.statusCode).toBe(200);
    expect(res.body.items.find((x) => x.id === id)).toBeUndefined();
  });

  test("PATCH /tasks/:id -> actualiza done", async () => {
    const created = await request(app).post("/tasks").send({ title: "T1" });
    const { id } = created.body;

    const res = await request(app)
      .patch(`/tasks/${id}`)
      .send({ done: true });
    expect(res.statusCode).toBe(200);
    expect(res.body.done).toBe(true);
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