#!/bin/sh
set -e

if [ -f "./prisma/schema.prisma" ]; then
  echo "Applying database schema..."
  if [ "$NODE_ENV" = "production" ]; then
    npx prisma migrate deploy
  else
    npx prisma db push
  fi
  echo "Database schema applied successfully."
fi

exec "$@"
