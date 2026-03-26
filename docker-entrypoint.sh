#!/bin/sh
set -e

echo "[backend] Applying Prisma migrations..."
until npx prisma migrate deploy; do
  echo "[backend] Database is unavailable, retrying in 3s..."
  sleep 3
done

if [ "${RUN_SEED_PROD:-false}" = "true" ]; then
  echo "[backend] Running production seed..."
  npm run seed:prod
fi

echo "[backend] Starting NestJS..."
node dist/main