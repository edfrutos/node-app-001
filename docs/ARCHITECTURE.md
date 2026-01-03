# Arquitectura — node-app-001

## Objetivo
Plantilla Node.js profesional con:
- API REST clara
- Tests automáticos
- CI fiable
- Docker listo para producción

---

## Decisiones clave

### 2026-01-03 — Separación app / server
**Decisión**  
`app.js` configura Express.  
`server.js` arranca proceso y recursos (DB, señales).

**Motivación**
- Evitar side-effects en tests
- Facilitar reutilización del app
- Patrón estándar en Node.js backend

**Impacto**
- Tests más limpios
- Arranque explícito
- Base sólida para crecer

---

## Endpoints actuales

- `GET /health`
- `GET /ready`
- `GET /version`
- `POST /echo`
- `GET /tasks`
- `POST /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

---

## Estado del proyecto

- [x] API funcional
- [x] Tests unitarios + integración
- [x] SQLite persistente
- [x] Docker multi-stage
- [x] Smoke test
- [ ] Config por entorno
- [ ] Migraciones DB
- [ ] Observabilidad
