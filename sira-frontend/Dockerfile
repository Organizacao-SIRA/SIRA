# Stage 1: Base (Instala dependências)
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Stage 2: Development (Para rodar com Hot Reload)
FROM base AS development
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Stage 3: Build (Gera os arquivos estáticos)
FROM base AS builder
RUN npm run build

# Stage 4: Production (Nginx para servir os arquivos estáticos)
FROM nginx:stable-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
RUN echo "server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
