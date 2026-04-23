#!/bin/sh

# Se houver schema.prisma, tenta sincronizar o banco
if [ -f "./prisma/schema.prisma" ]; then
  echo "Prisma schema found. Syncing database..."
  if [ "$NODE_ENV" = "production" ]; then
    npx prisma migrate deploy
  else
    # Em desenvolvimento, usamos db push para evitar prompts interativos que travam o container
    npx prisma db push --skip-generate
  fi
fi

# Executa o comando principal (CMD do Dockerfile)
exec "$@"
