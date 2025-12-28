# syntax=docker/dockerfile:1

########################
# Builder (con npm)
########################
FROM node:24-bookworm-slim AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

########################
# Runtime (sin npm)
########################
FROM node:24-bookworm-slim

RUN groupadd --system app \
  && useradd --system --gid app --create-home --home-dir /home/app app

WORKDIR /app
COPY --from=builder /app /app
RUN chown -R app:app /app

# 🔒 Quitar npm/npx/corepack (ahí viene el glob vulnerable)
RUN rm -rf /usr/local/lib/node_modules/npm \
  && rm -f /usr/local/bin/npm /usr/local/bin/npx \
  && (rm -f /usr/local/bin/corepack || true)

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

USER app

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:' + (process.env.PORT||3000) + '/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]