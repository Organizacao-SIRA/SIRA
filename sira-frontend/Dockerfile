# Estágio 1: Base (Instalação de dependências)
FROM node:22-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Estágio 2: Desenvolvimento (Hot Reload ativado)
FROM base AS development
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]

# Estágio 3: Build (Geração dos arquivos estáticos otimizados)
FROM base AS builder
RUN npm run build

# Estágio 4: Produção (Nginx para servir o front-end)
FROM nginx:stable-alpine AS production
COPY --from=builder /app/dist /usr/share/nginx/html
# Configuração básica do Nginx para suportar roteamento SPA (React/Vite)
RUN echo "server { listen 80; location / { root /usr/share/nginx/html; index index.html; try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
