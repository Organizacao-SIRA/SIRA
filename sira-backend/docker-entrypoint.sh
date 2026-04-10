#!/bin/sh

# Se houver schema.prisma, tenta rodar as migrations
if [ -f "./prisma/schema.prisma" ]; then
  echo "Prisma schema found. Checking for migrations..."
  if [ "$NODE_ENV" = "production" ]; then
    npx prisma migrate deploy
  else
    npx prisma migrate dev
  fi
fi

# Executa o comando principal (CMD do Dockerfile)
exec "$@"
