'use strict';

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json({ limit: '1mb' }));

app.get('/', (_req, res) => {
  res.status(200).send('OK - scout-demo is running');
});

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

const PORT = Number.parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`Servidor escuchando en http://${HOST}:${PORT}`);
});