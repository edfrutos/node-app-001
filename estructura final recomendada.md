# 📁 Estructura final recomendada

## Docker

## Para una plantilla base reutilizable, lo más conveniente (equilibrio entre potencia y simplicidad) es:

## 👉 Docker + Docker Compose + Makefile + README mínimo
## Sin scripts raros, sin dependencias externas, todo estándar y fácil de clonar.

```sh
scout-demo/
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .env.example
├── Makefile
├── package.json
├── server.js
└── README.md
```

### 1️⃣ docker-compose.yml (control total de puertos)

```yaml
services:
  app:
    image: edefrutos/scout-demo:v1
    container_name: scout-demo
    environment:
      NODE_ENV: production
      PORT: 3000
    ports:
      - "${HOST_PORT:-5080}:3000"
    restart: unless-stopped
```

### 2️⃣ .env

```env
HOST_PORT=5080
```

### 3️⃣ Makefile (la clave para no pensar)
#### Este es el corazón de la plantilla.

```makefile
IMAGE=edefrutos/scout-demo:v1

.PHONY: help build scan up down logs ps clean

help:
	@echo "Comandos disponibles:"
	@echo "  make build   → Build con SBOM + provenance"
	@echo "  make scan    → Docker Scout (high only)"
	@echo "  make up      → Arrancar contenedor"
	@echo "  make down    → Parar contenedor"
	@echo "  make logs    → Ver logs"
	@echo "  make ps      → Ver estado"
	@echo "  make clean   → Limpiar imagen"

build:
	docker buildx build --pull \
	  --provenance=mode=max \
	  --sbom=true \
	  -t $(IMAGE) \
	  --load .

scan:
	docker scout cves --only-severity high local://$(IMAGE)

up:
	docker compose up -d

down:
	docker compose down

logs:
	docker compose logs -f

ps:
	docker compose ps

clean:
	docker rmi $(IMAGE) || true
```

### Ahora trabajas así:

```sh
make build
make scan
make up
make logs
make down
```
### Sin memorizar comandos largos. ✔️