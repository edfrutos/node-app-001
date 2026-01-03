// scripts/smoke.cjs
/* eslint-disable no-console */
const http = require("http");

// Soporta que src/app.js exporte `app` o exporte el app directamente
function loadApp() {
  const mod = require("../src/app");
  return mod.app || mod;
}

function fetchJson(url, options) {
  return fetch(url, options).then(async (r) => {
    const text = await r.text();
    let json = null;
    try {
      json = JSON.parse(text);
    } catch {
      // si no es JSON, lo dejamos en text para diagnosticar
    }
    return { ok: r.ok, status: r.status, text, json };
  });
}

(async () => {
  const app = loadApp();

  // Puerto efímero libre
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const { port } = server.address();
  const base = `http://127.0.0.1:${port}`;

  try {
    // 1) Health
    const h = await fetchJson(`${base}/health`);
    if (!h.ok || !h.json || h.json.status !== "ok") {
      throw new Error(`[smoke] /health falló: HTTP ${h.status}\n${h.text}`);
    }

    // 2) GET tasks
    const g1 = await fetchJson(`${base}/tasks`);
    if (!g1.ok || !g1.json || !Array.isArray(g1.json.items)) {
      throw new Error(`[smoke] /tasks (GET) falló: HTTP ${g1.status}\n${g1.text}`);
    }

    // 3) POST task
    const p = await fetchJson(`${base}/tasks`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ title: "Comprar pan" }),
    });
    if (p.status !== 201 || !p.json || !p.json.id) {
      throw new Error(`[smoke] /tasks (POST) falló: HTTP ${p.status}\n${p.text}`);
    }

    // 4) GET tasks otra vez
    const g2 = await fetchJson(`${base}/tasks`);
    if (!g2.ok || !g2.json || g2.json.items.length < 1) {
      throw new Error(`[smoke] /tasks (GET2) falló: HTTP ${g2.status}\n${g2.text}`);
    }

    console.log("[smoke] OK ✅", { port, count: g2.json.items.length });
    process.exit(0);
  } catch (e) {
    console.error(String(e));
    process.exit(1);
  } finally {
    server.close();
  }
})();