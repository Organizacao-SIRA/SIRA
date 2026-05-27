#!/bin/sh
set -e

# Se houver schema.prisma, tenta sincronizar o banco
if [ -f "./prisma/schema.prisma" ]; then
  echo "Prisma schema found. Syncing database..."
  npx prisma db push --accept-data-loss
  echo "Database schema applied successfully."
fi

exec "$@"
