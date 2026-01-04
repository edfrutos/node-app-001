// src/routes/tasks.routes.js
const express = require("express");
const ctrl = require("../controllers/tasks.controller");

const router = express.Router();

router.get("/", ctrl.list);
router.get("/:id", ctrl.getById);
router.post("/", ctrl.create);
router.patch("/:id", ctrl.patch);
router.delete("/:id", ctrl.remove);

module.exports = router;