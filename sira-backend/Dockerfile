# Stage 1: Base (Dependências e Preparação)
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma/
# Copia o entrypoint aqui para estar disponível em todos os estágios
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
RUN npm ci

# Stage 2: Development (Hot Reload)
FROM base AS development
ENV NODE_ENV=development
COPY . .
RUN if [ -f "./prisma/schema.prisma" ]; then npx prisma generate; fi
EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]

# Stage 3: Builder (Compilação)
FROM base AS builder
COPY . .
RUN if [ -f "./prisma/schema.prisma" ]; then npx prisma generate; fi
RUN npm run build

# Stage 4: Production Runner (Imagem Leve)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=base /usr/local/bin/docker-entrypoint.sh /usr/local/bin/

USER nestjs
EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main"]
