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

# 🔥 Eliminamos npm y herramientas innecesarias
RUN rm -rf /usr/local/lib/node_modules/npm \
  && rm -f /usr/local/bin/npm /usr/local/bin/npx \
  && chown -R app:app /app

USER app

EXPOSE 3000

# Healthcheck simple y fiable
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]