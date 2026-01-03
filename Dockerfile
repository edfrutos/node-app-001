########################
# Builder
########################
FROM node:24-bookworm-slim AS builder

WORKDIR /app

# Copiamos manifests
COPY package*.json ./

# Instalamos SOLO dependencias de producción
RUN npm ci --omit=dev

# Copiamos el resto del código
COPY . .

########################
# Runtime (SIN npm)
########################
FROM node:24-bookworm-slim

# Crear usuario no-root
RUN groupadd --system app \
  && useradd --system --gid app --create-home --home-dir /home/app app

WORKDIR /app

# Copiamos la app ya construida
COPY --from=builder /app /app

# 🔥 Eliminamos npm y herramientas innecesarias + permisos
RUN rm -rf /usr/local/lib/node_modules/npm \
  && rm -f /usr/local/bin/npm /usr/local/bin/npx \
  && chown -R app:app /app

# Build info (inyectable en build)
ARG APP_VERSION=dev
ARG GIT_SHA=unknown
ARG BUILD_DATE=unknown

ENV APP_NAME=node-app-001 \
    APP_VERSION=$APP_VERSION \
    GIT_SHA=$GIT_SHA \
    BUILD_DATE=$BUILD_DATE \
    NODE_ENV=production \
    DB_PATH=/app/data/tasks.sqlite \
    DB_FILE=/app/data/tasks.sqlite

RUN mkdir -p /app/data \
   && chown -R app:app /app/data

VOLUME ["/app/data"]

USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]