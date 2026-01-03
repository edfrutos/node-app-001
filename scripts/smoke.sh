#!/usr/bin/env bash
set -euo pipefail

PORT="${PORT:-3000}"
BASE="http://localhost:${PORT}"

npm start &
PID=$!

cleanup() { kill "$PID" 2>/dev/null || true; }
trap cleanup EXIT

echo "Esperando a que el server esté listo..."
for i in {1..60}; do
  if curl -fsS "$BASE/health" >/dev/null; then
    echo "OK"
    break
  fi
  sleep 0.2
done

echo "GET /tasks"
curl -fsS "$BASE/tasks" | jq

echo "POST /tasks"
curl -fsS -X POST "$BASE/tasks" -H 'content-type: application/json' -d '{"title":"Comprar pan"}' | jq

echo "GET /tasks"
curl -fsS "$BASE/tasks" | jq