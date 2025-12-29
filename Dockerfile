########################
# Builder
########################
FROM node:24-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev

COPY . .

########################
# Runtime
########################
FROM node:24-bookworm-slim

# Usuario no root
RUN groupadd --system app \
  && useradd --system --gid app --create-home --home-dir /home/app app

WORKDIR /app

COPY --from=builder /app /app
RUN chown -R app:app /app

USER app

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:3000/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]