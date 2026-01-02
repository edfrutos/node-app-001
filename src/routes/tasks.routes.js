// src/routes/tasks.routes.js
const express = require("express");
const tasksService = require("../services/tasks.service");

const router = express.Router();

function badRequest(message) {
  const err = new Error(message);
  err.status = 400;
  return err;
}

function notFound(message = "Not Found") {
  const err = new Error(message);
  err.status = 404;
  return err;
}

router.get("/", async (_req, res, next) => {
  try {
    const items = await tasksService.list();
    res.json({ items });
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req, res, next) => {
  try {
    const { title, done } = req.body || {};
    if (typeof title !== "string" || title.trim().length < 1) {
      throw badRequest("title is required");
    }
    const task = await tasksService.create({ title: title.trim(), done });
    res.status(201).json(task);
  } catch (e) {
    next(e);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const task = await tasksService.getById(req.params.id);
    if (!task) throw notFound("task not found");
    res.json(task);
  } catch (e) {
    next(e);
  }
});

router.patch("/:id", async (req, res, next) => {
  try {
    const { title, done } = req.body || {};
    const patch = {};

    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length < 1) {
        throw badRequest("title must be a non-empty string");
      }
      patch.title = title.trim();
    }
    if (done !== undefined) {
      if (typeof done !== "boolean") {
        throw badRequest("done must be boolean");
      }
      patch.done = done;
    }

    if (Object.keys(patch).length === 0) {
      throw badRequest("provide at least one field: title or done");
    }

    const updated = await tasksService.update(req.params.id, patch);
    if (!updated) throw notFound("task not found");

    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const ok = await tasksService.remove(req.params.id);
    if (!ok) throw notFound("task not found");
    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

module.exports = router;