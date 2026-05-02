# Estágio 1: Base (Dependências e Preparação)
FROM node:22-alpine AS base
WORKDIR /app
ARG DATABASE_URL=postgresql://sira_user:sira_password@postgres:5432/sira_db?schema=public
ENV DATABASE_URL=${DATABASE_URL}
COPY package*.json ./
COPY prisma ./prisma/
COPY docker-entrypoint.sh /usr/local/bin/
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh && chmod +x /usr/local/bin/docker-entrypoint.sh
RUN npm ci

# Estágio 2: Desenvolvimento (Com Hot Reload)
FROM base AS development
ENV NODE_ENV=development
COPY . .
RUN npx prisma generate
EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["npm", "run", "dev"]

# Estágio 3: Builder (Compilação do código)
FROM base AS builder
COPY . .
RUN if [ -f "./prisma/schema.prisma" ]; then npx prisma generate; fi
RUN npm run build

# Estágio 4: Dependências de Produção (Instala apenas o necessário para execução)
FROM node:22-alpine AS production-deps
WORKDIR /app
ARG DATABASE_URL=postgresql://sira_user:sira_password@postgres:5432/sira_db?schema=public
ENV DATABASE_URL=${DATABASE_URL}
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --omit=dev && npx prisma generate

# Estágio 5: Runner de Produção (Imagem final otimizada e leve)
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Define grupo e usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nestjs

COPY --from=builder /app/dist ./dist
COPY --from=production-deps /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma
COPY --from=base /usr/local/bin/docker-entrypoint.sh /usr/local/bin/

USER nestjs
EXPOSE 3000
ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main"]
