// src/controllers/tasks.controller.js
const tasksService = require("../services/tasks.service");

async function list(req, res) {
  const result = await tasksService.list(req.query);
  res.json(result);
}

async function getById(req, res) {
  const item = await tasksService.getById(Number(req.params.id));
  if (!item) return res.status(404).json({ error: "not_found" });
  res.json(item);
}

async function create(req, res) {
  const item = await tasksService.create(req.body);
  res.status(201).json(item);
}

async function patch(req, res) {
  const item = await tasksService.patch(Number(req.params.id), req.body);
  if (!item) return res.status(404).json({ error: "not_found" });
  res.json(item);
}

async function remove(req, res) {
  const ok = await tasksService.remove(Number(req.params.id));
  if (!ok) return res.status(404).json({ error: "not_found" });
  res.status(204).end();
}

module.exports = { list, getById, create, patch, remove };