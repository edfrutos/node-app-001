// src/routes/tasks.routes.js
const express = require("express");
const tasksService = require("../services/tasks.service");

const router = express.Router();

router.get("/", async (_req, res, next) => {
  try {
    const data = await tasksService.list();
    res.json(data);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const item = await tasksService.getById(id);
    res.json(item);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const item = await tasksService.create(req.body);
    res.status(201).json(item);
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const item = await tasksService.patch(id, req.body);
    res.json(item);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await tasksService.remove(id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

module.exports = router;