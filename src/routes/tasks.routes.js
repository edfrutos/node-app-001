// src/routes/tasks.routes.js
const express = require("express");
const tasksController = require("../controllers/tasks.controller");

const router = express.Router();

router.get("/", tasksController.list);
router.post("/", tasksController.create);
router.get("/:id", tasksController.getById);
router.patch("/:id", tasksController.patch);
router.delete("/:id", tasksController.remove);

module.exports = router;