# Node App 001

Proyecto_001 nprofesional para proyectos __Node.js__ con Docker, Docker Scout y CI/CD integrado mediante GitHub Actions.

Diseñada para servir como **punto de partida limpio, seguro y reutilizable** para nuevos proyectos Node.

---

## 🚀 Características

- Node.js **24 LTS**
- Imagen Docker **multi-stage** (builder + runtime)
- Usuario no root en runtime
- Docker Scout (SBOM + CVEs)
- GitHub Actions:

   - Build
   - Scan de vulnerabilidades
   - Push automático a Docker Hub

- Política de versiones semver
- Puerto estandarizado y sin conflictos

---

## 📦 Requisitos

- Docker Desktop
- Node.js ≥ 20 (solo si trabajas fuera de Docker)
- Cuenta en Docker Hub
- Cuenta en GitHub

---

## 🧱 Estructura del proyecto

.
├── Dockerfile
├── docker-compose.yml
├── package.json
├── package-lock.json
├── server.js
├── .dockerignore
├── .env.example
└── .github/
└── workflows/
└── docker.yml

---

## ▶️ Ejecución rápida (Docker)

### 1. Construir la imagen

```bash
docker build -t node-base-template .
```

# 2. Ejecutar el contenedor

```bash




docker run --rm -p 5080:3000 node-base-template

👉 Accede en el navegador a:
http://localhost:5080

⸻

🐳 Uso con docker-compose (recomendado)

docker compose up --build

Acceso:

http://localhost:5080


⸻

⚙️ Variables de entorno

Copia el archivo de ejemplo:

cp .env.example .env

Variables habituales:

NODE_ENV=development
PORT=3000

El puerto interno siempre es 3000.
El puerto externo del host es 5080 (estandarizado).

⸻

🔐 Seguridad y análisis de vulnerabilidades

Este proyecto integra Docker Scout para:
	•	Generación automática de SBOM
	•	Análisis de CVEs
	•	Bloqueo del pipeline si hay vulnerabilidades HIGH o CRITICAL

Se ejecuta automáticamente en GitHub Actions en:
	•	push a main
	•	creación de tags (vX.Y.Z)

⸻

🔄 CI/CD (GitHub Actions)

El workflow:
	•	Construye la imagen
	•	Genera SBOM y provenance
	•	Analiza vulnerabilidades
	•	Publica la imagen en Docker Hub

Tags generados:
	•	latest
	•	versión semver (v1.0.1, etc.)

⸻

🏷 Versionado

Este proyecto sigue Semantic Versioning:
	•	v1.0.0 → versión base
	•	v1.x.y → mejoras compatibles
	•	v2.0.0 → cambios rompientes

⸻

🧩 Uso como plantilla

Este repositorio está marcado como Template Repository.

Para crear un nuevo proyecto:
	1.	Pulsa Use this template
	2.	Crea tu nuevo repositorio
	3.	Cambia:
	•	name en package.json
	•	nombre de la imagen Docker
	•	README si procede

⸻

📄 Licencia

MIT

⸻

👤 Autor

Eugenio De Frutos Sánchez
🌐 https://www.edefrutos.me
🐙 https://github.com/edfrutos


```

## Security & Vulnerabilities

This project uses Docker Scout to scan for vulnerabilities.

Known high-severity vulnerabilities coming from the base OS image
(e.g. Debian packages such as gpgv) are currently not blocking the CI
pipeline if no fixed version exists and the package is not used at runtime.

All application-level dependencies are strictly enforced.
