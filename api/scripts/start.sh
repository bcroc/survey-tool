#!/usr/bin/env bash
set -euo pipefail

echo "[start] Running prisma migrate deploy..."
npx prisma migrate deploy

echo "[start] Starting API..."
exec node dist/index.js

