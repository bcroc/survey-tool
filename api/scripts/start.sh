#!/usr/bin/env bash
set -euo pipefail

echo "[start] Running prisma migrate deploy (will fallback to db push if needed)..."
if npx prisma migrate deploy; then
	echo "[start] migrations applied"
else
	echo "[start] prisma migrate deploy failed; attempting prisma db push to ensure schema is present"
	npx prisma db push
fi

echo "[start] Starting API..."
exec node dist/index.js

