# SIRA - Sistema Inteligente de Recomendações Acadêmicas

O SIRA+ é um ecossistema acadêmico moderno projetado para agregar, recomendar e organizar materiais científicos (artigos e livros) em uma arquitetura robusta e escalável de Monorepo.

## 🛠️ Tecnologias e Arquitetura

*   **Backend (NestJS 11):** API modular com injeção de dependência nativa.
    *   **Segurança:** Autenticação via JWT (JSON Web Tokens) e Hashing de senhas utilizando o algoritmo moderno **scrypt** (módulo nativo `node:crypto`).
    *   **Persistência:** PostgreSQL 17 gerenciado via **Prisma ORM**.
    *   **Integrações:** Agregação em tempo real das APIs Google Books e Semantic Scholar.
*   **Frontend (React 19):** Interface performática construída com Vite 8.
    *   **Estado Global:** Context API para gerenciamento de sessão e persistência de token em LocalStorage.
    *   **Estilização:** Tailwind CSS 4 para uma interface limpa e responsiva.
*   **Infraestrutura (Docker):** Orquestração completa via Docker Compose para paridade total de ambientes.

## ✨ Funcionalidades Implementadas

- [x] **Sistema de Usuários:** Registro e Login com proteção de rotas.
- [x] **Busca Acadêmica:** Pesquisa integrada em múltiplas bases científicas com cache inteligente em memória.
- [x] **Favoritos Persistentes:** Salve artigos e livros diretamente no seu perfil. Os dados são sincronizados no PostgreSQL e permanecem disponíveis em qualquer dispositivo.
- [x] **Catálogo Integrado:** Navegação por categorias (Ciências da Computação, Direito, etc.) com paginação simulada via APIs externas.
- [x] **Documentação Automática:** Swagger UI configurado para testes rápidos dos endpoints.

## 🏗️ Padrões de Platform Engineering

1.  **Zero-Dependency Security:** Uso de módulos nativos do Node.js para criptografia, eliminando vulnerabilidades de pacotes de terceiros e problemas de compilação C++ em containers.
2.  **Hot Reload Full-Stack:** Volumes montados para pastas de código (`src`) e modelos de dados (`prisma`), permitindo desenvolvimento ágil sem reinicialização de containers.
3.  **Dockerização Otimizada:** Imagens multi-stage para manter o ambiente de produção leve e seguro, rodando sob usuário não-root.
4.  **Resiliência de Inicialização:** Sistema de healthcheck garantindo que a API só inicie após o banco de dados estar pronto para conexões.

## 🚀 Como Iniciar o Projeto

### 1. Requisitos
- Docker e Docker Compose instalados.

### 2. Configuração de Ambiente
Antes de subir os containers, crie os arquivos `.env` a partir dos exemplos:
```bash
cp sira-backend/.env.example sira-backend/.env
cp sira-frontend/.env.example sira-frontend/.env
```

Edite o arquivo `sira-backend/.env` e configure sua chave secreta:
```env
DATABASE_URL="postgresql://sira_user:sira_password@postgres:5432/sira_db?schema=public"
JWT_SECRET="sua_chave_secreta_aqui"
# Opcional para aumentar limites de busca
GOOGLE_BOOKS_API_KEY=""
SEMANTIC_SCHOLAR_API_KEY=""
```

Observacao: no ambiente Docker, o backend acessa o banco por `postgres:5432`. A porta publicada para acesso a partir da sua maquina host e `localhost:5433`.

### 3. Subir o Ambiente
```bash
docker-compose up -d --build
```

Esse comando faz o build das imagens e sobe os containers em background, liberando o terminal para outros comandos.

### 4. Acessar os Serviços
- **Interface:** [http://localhost:5173](http://localhost:5173)
- **Documentação Swagger:** [http://localhost:3002/api/docs](http://localhost:3002/api/docs)
- **Healthcheck:** [http://localhost:3002/api/v1/health](http://localhost:3002/api/v1/health)
- **PostgreSQL no host:** `localhost:5433`

### 5. Acompanhar os Logs
Para acompanhar os logs em tempo real, abra 2 terminais separados:

Terminal 1, frontend:
```bash
docker-compose logs -f frontend
```

Terminal 2, backend:
```bash
docker-compose logs -f backend
```

---

**Comandos Úteis:**
- Resetar banco de dados: `docker-compose down -v`
- Ver status dos containers: `docker-compose ps`
- Sincronizar Prisma após mudar schema: `docker exec sira-backend npx prisma generate`
