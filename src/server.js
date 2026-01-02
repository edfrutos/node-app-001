const { app, setReady } = require("./app");
const { initDb } = require("./db");

initDb();

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${PORT}`);
});

function shutdown(signal) {
  console.log(`${signal} recibido, cerrando...`);
  setReady(false);

  server.close(() => {
    console.log("HTTP server cerrado.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Cierre forzado (timeout).");
    process.exit(1);
  }, 10000).unref();
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));