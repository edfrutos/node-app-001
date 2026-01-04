// __tests__/docs.test.js
const request = require("supertest");
const { app } = require("../src/app");

describe("Docs", () => {
  test("GET /docs -> redirect (301/302/307/308) o html (200)", async () => {
    const res = await request(app).get("/docs");

    // Dependiendo del router/middleware puede devolver HTML directo (200)
    // o redirigir a /docs/ con varios códigos válidos.
    expect([200, 301, 302, 307, 308]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(res.headers["content-type"]).toMatch(/text\/html/);
    } else {
      expect(res.headers.location).toBe("/docs/");
    }
  });

  test("GET /docs/ -> html (200) o redirect (301/302/307/308) o 404 si DOCS_ENABLED=false", async () => {
    const res = await request(app).get("/docs/");

    // Si DOCS_ENABLED=false, el app expone 404 con texto.
    // En modo normal, swagger-ui devuelve HTML.
    // En algunos montajes (strict routing / proxy), puede haber redirect.
    expect([200, 301, 302, 307, 308, 404]).toContain(res.statusCode);

    if (res.statusCode === 200) {
      expect(res.headers["content-type"]).toMatch(/text\/html/);
      return;
    }

    if (res.statusCode === 404) {
      expect(res.text).toMatch(/Docs disabled/i);
      return;
    }

    // Redirect: normalmente apunta a /docs/
    expect(res.headers.location).toBe("/docs/");
  });
});