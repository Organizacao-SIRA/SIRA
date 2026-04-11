#!/bin/sh

# Se houver schema.prisma, tenta rodar as migrations
if [ -f "./prisma/schema.prisma" ]; then
  echo "Prisma schema found. Checking for migrations..."
  if [ "$NODE_ENV" = "production" ]; then
    npx prisma migrate deploy
  else
    # Em desenvolvimento, usa o nome 'init' e evita perguntas interativas
    npx prisma migrate dev --name init --skip-seed || true
  fi
fi

# Executa o comando principal (CMD do Dockerfile)
exec "$@"
