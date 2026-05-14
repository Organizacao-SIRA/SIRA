# SIRA - Sistema Inteligente de Recomendações Acadêmicas

O SIRA+ é um ecossistema acadêmico moderno projetado para agregar, recomendar e organizar materiais científicos (artigos e livros) em uma arquitetura robusta e escalável de Monorepo.

## 🛠️ Tecnologias e Arquitetura

*   **Backend (NestJS 11):** API modular com injeção de dependência nativa.
    *   **Segurança:** Autenticação via JWT (JSON Web Tokens) e Hashing de senhas utilizando o algoritmo moderno **scrypt** (módulo nativo `node:crypto`).
    *   **Persistência:** PostgreSQL 17 gerenciado via **Prisma ORM**.
    *   **Integrações:** Agregação em tempo real das APIs Google Books e Semantic Scholar.
    *   **IA:** Busca conversacional e ranking de materiais via Anthropic (Claude), com fallback automático para Google Gemini.
*   **Frontend (React 19):** Interface performática construída com Vite 8.
    *   **Estado Global:** Context API para gerenciamento de sessão e persistência de token em LocalStorage.
    *   **Estilização:** Tailwind CSS 4 para uma interface limpa e responsiva.
*   **Infraestrutura (Docker):** Orquestração completa via Docker Compose para paridade total de ambientes.

## ✨ Funcionalidades Implementadas

- [x] **Sistema de Usuários:** Registro e Login com proteção de rotas.
- [x] **Busca Conversacional por IA:** Chat inteligente que interpreta o pedido, busca nas bases acadêmicas e retorna uma seleção justificada.
- [x] **Busca Acadêmica Direta:** Pesquisa integrada em múltiplas bases científicas com cache inteligente em memória e ranking por IA.
- [x] **Recomendações Personalizadas:** Sugestões baseadas no perfil, favoritos e histórico de buscas do usuário.
- [x] **Favoritos Persistentes:** Salve artigos e livros diretamente no seu perfil.
- [x] **Catálogo Integrado:** Navegação por categorias com paginação via APIs externas.
- [x] **Documentação Automática:** Swagger UI configurado para testes rápidos dos endpoints.

## 🏗️ Padrões de Platform Engineering

1.  **AI Provider Agnóstico:** Abstração `AiProvider` com fallback automático Claude → Gemini, sem impacto no código de negócio.
2.  **Zero-Dependency Security:** Uso de módulos nativos do Node.js para criptografia.
3.  **Hot Reload Full-Stack:** Docker Compose Watch para sincronização automática de código.
4.  **Dockerização Otimizada:** Imagens multi-stage para produção leve e segura, rodando sob usuário não-root.
5.  **Resiliência de Inicialização:** Healthcheck garantindo que a API só inicie após o banco estar pronto.

---

## 🚀 Como Executar o Projeto

Há dois modos de execução. Escolha o que se encaixa no seu objetivo:

| Modo | Quando usar |
|------|-------------|
| **Local** | Desenvolvimento diário — hot reload nativo, debug com breakpoint, iteração rápida |
| **Docker Completo** | Testar integração entre serviços, simular ambiente de produção antes de um merge |

---

### Pré-requisitos (ambos os modos)

- Node.js 22+
- Docker e Docker Compose
- Chaves de API (veja abaixo)

#### Chaves de API necessárias

| Variável | Obrigatória | Onde obter |
|----------|-------------|------------|
| `ANTHROPIC_API_KEY` | **Sim** — toda a funcionalidade de IA depende dela | [console.anthropic.com](https://console.anthropic.com) |
| `GEMINI_API_KEY` | Não — fallback automático se o Claude estiver indisponível | [aistudio.google.com](https://aistudio.google.com) |
| `GOOGLE_BOOKS_API_KEY` | Não — aumenta o limite de requisições ao Google Books | [console.cloud.google.com](https://console.cloud.google.com) |
| `SEMANTIC_SCHOLAR_API_KEY` | Não — aumenta o limite de requisições ao Semantic Scholar | [api.semanticscholar.org](https://api.semanticscholar.org) |

---

### Modo 1 — Desenvolvimento Local

Roda apenas o banco de dados no Docker. Backend e frontend sobem diretamente na sua máquina com hot reload nativo do Node e do Vite.

**1. Configure as variáveis de ambiente**

```bash
cp sira-backend/.env.example sira-backend/.env
cp sira-frontend/.env.example sira-frontend/.env
```

Edite `sira-backend/.env` com suas chaves. O `DATABASE_URL` já aponta para `localhost:5433` (porta exposta pelo container do Postgres):

```env
ANTHROPIC_API_KEY="sua_chave_aqui"
JWT_SECRET="uma_string_secreta_qualquer"
```

**2. Suba apenas o banco de dados**

```bash
docker compose up sira-postgres -d
```

**3. Instale as dependências e rode os serviços**

Abra dois terminais:

```bash
# Terminal 1 — Backend (http://localhost:3000)
cd sira-backend
npm install
npm run dev
```

```bash
# Terminal 2 — Frontend (http://localhost:5173)
cd sira-frontend
npm install
npm run dev
```

**4. Acesse**

- **Interface:** [http://localhost:5173](http://localhost:5173)
- **Swagger:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Healthcheck:** [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)

> **Nota:** No modo local, o frontend aponta para `http://localhost:3000` (sem Docker) via `VITE_API_URL` no `.env`.

---

### Modo 2 — Docker Completo

Tudo containerizado. Simula o ambiente de produção e valida a comunicação entre os serviços.

**1. Configure as variáveis de ambiente**

```bash
cp sira-backend/.env.example sira-backend/.env
cp sira-frontend/.env.example sira-frontend/.env
```

Edite `sira-backend/.env`. O `DATABASE_URL` para Docker usa o hostname interno `postgres`:

```env
DATABASE_URL="postgresql://sira_user:sira_password@postgres:5432/sira_db?schema=public"
ANTHROPIC_API_KEY="sua_chave_aqui"
JWT_SECRET="uma_string_secreta_qualquer"
```

**2. Suba o ambiente completo**

```bash
docker compose up --watch
```

Esse comando faz o build das imagens, sobe todos os containers e ativa o hot reload via Docker Compose Watch.

**3. Acesse**

- **Interface:** [http://localhost:5173](http://localhost:5173)
- **Swagger:** [http://localhost:3002/api/docs](http://localhost:3002/api/docs)
- **Healthcheck:** [http://localhost:3002/api/v1/health](http://localhost:3002/api/v1/health)
- **PostgreSQL (host):** `localhost:5433`

> **pgAdmin (opcional):** Para subir a interface gráfica do banco, use:
> ```bash
> docker compose --profile tools up -d pgadmin
> ```
> Acesse [http://localhost:5050](http://localhost:5050) — Login: `admin@sira.com` / Senha: `admin`

**4. Acompanhar logs**

```bash
# Todos os serviços
docker compose logs -f

# Separadamente
docker compose logs -f sira-backend
docker compose logs -f sira-frontend
```

---

## 🛠️ Comandos de Desenvolvimento e Manutenção

### Banco de Dados (Prisma)

No modo **Local**, rode os comandos diretamente na pasta `sira-backend`:

```bash
cd sira-backend
npx prisma generate          # Regenera os tipos do client (obrigatório após mudar o schema)
npx prisma db push           # Sincroniza o schema com o banco sem criar histórico
npx prisma migrate dev --name "descricao"  # Cria uma migração com histórico
```

No modo **Docker**, prefixe com `docker exec sira-backend`:

```bash
docker exec sira-backend npx prisma generate
docker exec sira-backend npx prisma db push
docker exec sira-backend npx prisma migrate dev --name "descricao"
```

---

## 🔧 Solução de Problemas

**Erro TS2353 — propriedade inexistente no Prisma Client:**
Acontece após mudar o `schema.prisma` ou atualizar a versão do Prisma sem regenerar o client.
```bash
# Modo Local
cd sira-backend && npx prisma generate

# Modo Docker
docker exec sira-backend npx prisma generate
# Se persistir, force o rebuild:
docker compose build --no-cache sira-backend && docker compose up -d sira-backend
```

**Hot reload parou de funcionar (modo Docker):**
```bash
docker compose down
docker compose up --watch
```

**Reset total do ambiente Docker:**
```bash
docker compose down -v && docker compose up --build --watch
```

**Ver status dos containers:**
```bash
docker compose ps
docker inspect -f '{{.State.Health.Status}}' sira-postgres
```
