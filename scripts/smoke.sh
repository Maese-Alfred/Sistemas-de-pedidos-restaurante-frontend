#!/usr/bin/env bash
set -euo pipefail

URL="${1:-http://localhost:8080}"

echo "Smoke test: $URL"
# Espera hasta 30s por el frontend
for i in {1..30}; do
  if curl -fsS "$URL" >/dev/null 2>&1; then
    echo "OK: frontend responde"
    exit 0
  fi
  sleep 1
done

echo "ERROR: frontend no respondió en 30s"
exit 1
