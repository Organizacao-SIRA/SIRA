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
*   **Infraestrutura (Docker):** Docker Compose provê **apenas a infraestrutura local** (PostgreSQL e, opcionalmente, pgAdmin). Backend e frontend rodam **nativamente na máquina do dev** com hot reload. Em produção, o backend é publicado como imagem Docker (Render, via `render.yaml`).

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
3.  **Hot Reload Nativo:** Backend (NestJS `--watch`) e frontend (Vite) recarregam direto na máquina, sem camada de container no caminho.
4.  **Imagem de Produção Otimizada:** Backend empacotado com Dockerfile multi-stage para deploy leve e seguro, rodando sob usuário não-root.
5.  **Resiliência de Inicialização:** Healthcheck do PostgreSQL garantindo que o banco aceite conexões antes do uso.

---

## 🚀 Como Executar o Projeto

O projeto roda em modo **local**: o **PostgreSQL sobe em container** (Docker, apenas infra) e **backend + frontend rodam diretamente na sua máquina**, com hot reload nativo do Node e do Vite.

### Pré-requisitos

- Node.js 22+
- Docker e Docker Compose (somente para o banco de dados)
- Chaves de API (veja abaixo)

#### Chaves de API necessárias

| Variável | Obrigatória | Onde obter |
|----------|-------------|------------|
| `ANTHROPIC_API_KEY` | **Sim** — toda a funcionalidade de IA depende dela | [console.anthropic.com](https://console.anthropic.com) |
| `GEMINI_API_KEY` | Não — fallback automático se o Claude estiver indisponível | [aistudio.google.com](https://aistudio.google.com) |
| `GOOGLE_BOOKS_API_KEY` | Não — aumenta o limite de requisições ao Google Books | [console.cloud.google.com](https://console.cloud.google.com) |
| `SEMANTIC_SCHOLAR_API_KEY` | Não — aumenta o limite de requisições ao Semantic Scholar | [api.semanticscholar.org](https://api.semanticscholar.org) |

---

### 1. Configure as variáveis de ambiente

```bash
cp sira-backend/.env.example sira-backend/.env
cp sira-frontend/.env.example sira-frontend/.env
```

Edite `sira-backend/.env` com suas chaves. O `DATABASE_URL` já aponta para `localhost:5433` (porta exposta pelo container do Postgres):

```env
DATABASE_URL="postgresql://sira_user:sira_password@localhost:5433/sira_db?schema=public"
ANTHROPIC_API_KEY="sua_chave_aqui"
JWT_SECRET="uma_string_secreta_qualquer"
AVATAR_STORAGE_DRIVER="local"
```

Para avatares, use `AVATAR_STORAGE_DRIVER="local"` no desenvolvimento. Em produção, use `AVATAR_STORAGE_DRIVER="cloudinary"` e configure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY` e `CLOUDINARY_API_SECRET`.

No frontend, deixe `VITE_API_URL` **vazio** em desenvolvimento: o Vite faz proxy de `/api` e `/uploads` para `http://localhost:3000` automaticamente.

### 2. Suba apenas o banco de dados (infra)

```bash
docker compose up postgres -d
```

### 3. Sincronize o schema do banco

Na primeira execução (ou após mudanças no `schema.prisma`), aplique o schema:

```bash
cd sira-backend
npm install
npx prisma db push      # cria/atualiza as tabelas conforme o schema
```

### 4. Rode os serviços

Abra dois terminais:

```bash
# Terminal 1 — Backend (http://localhost:3000)
cd sira-backend
npm run dev
```

```bash
# Terminal 2 — Frontend (http://localhost:5173)
cd sira-frontend
npm install
npm run dev
```

> Atalho: na raiz do monorepo, `npm run dev` sobe backend e frontend juntos (ainda assim, suba o Postgres antes com o passo 2).

### 5. Acesse

- **Interface:** [http://localhost:5173](http://localhost:5173)
- **Swagger:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)
- **Healthcheck:** [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)

> **pgAdmin (opcional):** para subir a interface gráfica do banco:
> ```bash
> docker compose --profile tools up -d pgadmin
> ```
> Acesse [http://localhost:5050](http://localhost:5050) — Login: `admin@sira.com` / Senha: `admin`

---

## 🛠️ Comandos de Desenvolvimento e Manutenção

### Banco de Dados (Prisma)

Rode os comandos na pasta `sira-backend` (o banco precisa estar no ar — passo 2 acima):

```bash
cd sira-backend
npx prisma generate                        # Regenera os tipos do client (após mudar o schema)
npx prisma db push                         # Sincroniza o schema com o banco sem criar histórico
npx prisma migrate dev --name "descricao"  # Cria uma migração com histórico
npx prisma studio                          # Abre o explorador visual do banco
```

> O fluxo padrão deste projeto é o `prisma db push` (sem histórico de migrations). O `.env` é carregado automaticamente pelo `prisma.config.ts`.

### Controle do banco (Docker)

```bash
docker compose up postgres -d        # Sobe o banco
docker compose stop postgres         # Para o banco (mantém os dados)
docker compose down                  # Remove os containers (mantém o volume de dados)
docker compose down -v               # Remove containers E apaga todos os dados do banco
docker compose ps                    # Status dos containers
```

---

## 🧪 Testes E2E (Cypress)

A suíte cobre os fluxos de Autenticação/Cadastro, Gestão de Perfil e Gestão de Favoritos. Pesquisa e Recomendação dependem do Claude e são testadas manualmente.

Com o banco (passo 2) e o backend (passo 4) no ar, rode a partir de `sira-frontend`:

```bash
cd sira-frontend
npm run cypress:open   # abre a interface interativa do Cypress
npm run cypress:run    # roda a suíte completa em modo headless
npm run e2e             # sobe o frontend automaticamente e roda cypress:run
```

> `cypress:open` e `cypress:run` esperam o frontend já rodando em `http://localhost:5173` (passo 4). Já `e2e` sobe o frontend sozinho antes de rodar os testes, mas o backend e o banco de dados continuam sendo pré-requisitos.

Para apontar os testes para outra URL de API, sobrescreva a variável `apiUrl`:

```bash
npx cypress run --env apiUrl=http://localhost:3000/api/v1
```

---

## 🔧 Solução de Problemas

**Erro `The column ... does not exist in the current database` (ex.: erro 500 no login):**
O banco está desatualizado em relação ao `schema.prisma` (faltam colunas/tabelas). Sincronize:
```bash
cd sira-backend && npx prisma db push
```

**Erro TS2353 — propriedade inexistente no Prisma Client:**
Acontece após mudar o `schema.prisma` ou atualizar a versão do Prisma sem regenerar o client.
```bash
cd sira-backend && npx prisma generate
```

**Backend não conecta no banco (`ECONNREFUSED` / `Can't reach database server`):**
O container do Postgres não está no ar. Suba-o e confira o status:
```bash
docker compose up postgres -d
docker inspect -f '{{.State.Health.Status}}' sira-postgres   # deve retornar "healthy"
```

**Frontend não fala com a API:**
Confirme que `VITE_API_URL` está **vazio** no `.env` do frontend (em dev usa-se o proxy do Vite) e que o backend está rodando em `http://localhost:3000`.

**Reset total do banco (apaga os dados):**
```bash
docker compose down -v
docker compose up postgres -d
cd sira-backend && npx prisma db push
```
