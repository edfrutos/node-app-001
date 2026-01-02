const tasks = require("../services/tasks.service");
const { validateCreate, validateUpdate } = require("../validators/tasks.validator");

async function list(req, res, next) {
  try {
    const { done } = req.query;
    const filter = done === undefined ? {} : { done: done === "true" || done === "1" };
    const rows = await tasks.list(filter);
    res.json(rows);
  } catch (e) { next(e); }
}

async function create(req, res, next) {
  try {
    const data = validateCreate(req.body);
    const row = await tasks.create(data);
    res.status(201).json(row);
  } catch (e) { next(e); }
}

async function update(req, res, next) {
  try {
    const { id } = req.params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum)) return res.status(400).json({ error: "invalid id" });

    const data = validateUpdate(req.body);
    const row = await tasks.update(idNum, data);
    if (!row) return res.status(404).json({ error: "not found" });
    res.json(row);
  } catch (e) { next(e); }
}

async function remove(req, res, next) {
  try {
    const { id } = req.params;
    const idNum = Number(id);
    if (!Number.isInteger(idNum)) return res.status(400).json({ error: "invalid id" });

    const ok = await tasks.remove(idNum);
    if (!ok) return res.status(404).json({ error: "not found" });
    res.status(204).send();
  } catch (e) { next(e); }
}

module.exports = { list, create, update, remove };