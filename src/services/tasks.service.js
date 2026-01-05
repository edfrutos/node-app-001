// src/services/tasks.service.js
const repo = require("../repositories/tasks.repo.sqlite");
const { parseListQuery, validateCreate, validatePatch } = require("../validators/tasks.validator");

function badRequest(message) {
  const e = new Error(message);
  e.statusCode = 400;
  return e;
}

// NUEVO: listado paginado + meta
async function list(query = {}) {
  const { page, limit, done, search, sort, order } = parseListQuery(query);

  // Preferimos delegar en el repo para tener un "control fino" consistente
  // (validación/normalización de sort/order/paginación + meta).
  if (typeof repo.listWithMeta === "function") {
    return repo.listWithMeta({ page, limit, done, search, sort, order });
  }

  // Fallback (compatibilidad): lógica anterior si el repo aún no tiene listWithMeta()
  const total = await repo.count({ done, search });
  const pages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, pages);
  const offset = (safePage - 1) * limit;

  const items = await repo.listPaged({ offset, limit, done, search, sort, order });

  return {
    items,
    meta: {
      page: safePage,
      limit,
      total,
      pages,
      sort,
      order,
    },
  };
}

async function getById(id) {
  return repo.getById(id);
}

async function create(payload) {
  const { title } = validateCreate(payload);
  return repo.create({ title });
}

async function patch(id, payload) {
  const updates = validatePatch(payload);
  return repo.update(id, updates);
}

async function remove(id) {
  return repo.remove(id);
}

// para tests
async function _reset() {
  return repo._reset();
}

module.exports = { list, getById, create, patch, remove, _reset };