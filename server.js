'use strict';

const express = require('express');

const app = express();

app.get('/', (_req, res) => {
  res.status(200).send('OK - node-app-001 is running');
});

app.get('/health', (_req, res) => {
  res.status(200).json({ ok: true });
});

const PORT = Number(process.env.PORT || 3000);
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Servidor escuchando en http://${HOST}:${PORT}`);
});