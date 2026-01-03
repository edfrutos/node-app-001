// src/controllers/tasks.controller.js
const tasksService = require("../services/tasks.service");

async function list(_req, res, next) {
  try {
    const result = await tasksService.list();
    res.json(result); // { items: [...] }
  } catch (e) {
    next(e);
  }
}

async function getById(req, res, next) {
  try {
    const item = await tasksService.getById(req.params.id);
    res.json(item);
  } catch (e) {
    next(e);
  }
}

async function create(req, res, next) {
  try {
    const item = await tasksService.create(req.body);
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
}

async function patch(req, res, next) {
  try {
    const item = await tasksService.patch(req.params.id, req.body);
    res.json(item);
  } catch (e) {
    next(e);
  }
}

async function remove(req, res, next) {
  try {
    await tasksService.remove(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

module.exports = { list, getById, create, patch, remove };