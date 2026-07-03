# 📋 Arquitetura de Pacotes - SIRA (Monorepo)

## Visão Geral

**SIRA** - Sistema Inteligente de Recomendações Acadêmicas é um monorepo contendo dois pacotes principais: Frontend (React) e Backend (NestJS).

```
SIRA (Monorepo)
├── sira-frontend (React + TypeScript)
├── sira-backend (NestJS + Prisma)
└── docs/ (Documentação)
```

---

## 📦 Pacote Backend (`sira-backend`)

### Tecnologia
- **Framework**: NestJS
- **ORM**: Prisma
- **Autenticação**: JWT
- **Linguagem**: TypeScript

### Estrutura de Diretórios

```
sira-backend/
├── src/
│   ├── main.ts                          # Entrada principal
│   ├── app.module.ts                    # Módulo raiz
│   │
│   ├── auth/                            # Módulo de Autenticação
│   │   ├── auth.controller.ts           # Endpoints de auth
│   │   ├── auth.service.ts              # Lógica de autenticação
│   │   ├── auth.module.ts               # Módulo auth
│   │   ├── jwt.strategy.ts              # Estratégia JWT
│   │   ├── guards/
│   │   │   ├── jwt-auth.guard.ts       # Guard JWT obrigatório
│   │   │   └── optional-jwt-auth.guard.ts
│   │   ├── decorators/
│   │   │   └── current-user.decorator.ts
│   │   └── dto/
│   │       ├── auth.dto.ts
│   │       ├── login.dto.ts
│   │       ├── register.dto.ts
│   │       ├── forgot-password.dto.ts
│   │       └── reset-password.dto.ts
│   │
│   ├── users/                           # Módulo de Usuários
│   │   ├── users.controller.ts          # Endpoints de usuários
│   │   ├── users.service.ts             # Lógica de usuários
│   │   ├── users.module.ts              # Módulo users
│   │   ├── preferences-options.ts       # Opções de preferência
│   │   └── dto/
│   │       ├── complete-onboarding.dto.ts
│   │       └── update-profile.dto.ts
│   │
│   ├── materials/                       # Módulo de Materiais
│   │   ├── materials.controller.ts      # Endpoints de materiais
│   │   ├── materials.service.ts         # Lógica de materiais
│   │   ├── materials.module.ts          # Módulo materials
│   │   └── dto/
│   │       ├── material.dto.ts
│   │       └── chat-search-response.dto.ts
│   │
│   ├── recommendations/                 # Módulo de Recomendações
│   │   ├── recommendations.controller.ts
│   │   ├── recommendations.service.ts
│   │   ├── recommendations.module.ts
│   │   └── dto/
│   │       └── (DTOs de recomendações)
│   │
│   ├── ai/                              # Módulo de IA
│   │   ├── ai.controller.ts
│   │   ├── ai.service.ts
│   │   ├── ai.module.ts
│   │   └── (Lógica de integração com IA)
│   │
│   ├── favorites/                       # Módulo de Favoritos
│   │   ├── favorites.controller.ts      # Endpoints de favoritos
│   │   ├── favorites.service.ts         # Lógica de favoritos
│   │   ├── favorites.module.ts          # Módulo favorites
│   │   └── dto/
│   │       └── add-favorite.dto.ts
│   │
│   └── prisma/                          # Configuração Prisma
│       └── (Client Prisma)
│
├── prisma/
│   ├── schema.prisma                    # Schema do banco de dados
│   └── migrations/                      # Migrações do banco
│
├── uploads/
│   └── avatars/                         # Armazenamento de avatars
│
├── dist/                                # Build compilado
├── package.json                         # Dependências e scripts
├── tsconfig.json                        # Configuração TypeScript
├── nest-cli.json                        # Configuração NestJS
├── .env                                 # Variáveis de ambiente
└── .env.example                         # Template de env

```

### Módulos Principais

| Módulo | Responsabilidade | Endpoints |
|--------|------------------|-----------|
| **Auth** | Autenticação, JWT, Login/Register | `POST /auth/register`, `POST /auth/login`, `POST /auth/forgot-password` |
| **Users** | Gerenciamento de perfil, onboarding | `GET /users/me`, `PUT /users/profile`, `POST /users/onboarding` |
| **Materials** | Catálogo de materiais, busca | `GET /materials`, `GET /materials/:id`, `POST /materials/search` |
| **Recommendations** | Recomendações acadêmicas | `GET /recommendations`, `POST /recommendations` |
| **AI** | Integração com IA para recomendações | `POST /ai/chat` |
| **Favorites** | Gerenciamento de favoritos | `POST /favorites`, `GET /favorites`, `DELETE /favorites/:id` |

---

## 🎨 Pacote Frontend (`sira-frontend`)

### Tecnologia
- **Framework**: React 18+
- **Linguagem**: TypeScript
- **UI**: Bootstrap/Custom CSS
- **State Management**: Context API

### Estrutura de Diretórios

```
sira-frontend/
├── public/                              # Arquivos estáticos
│   └── (ícones, favicon, etc)
│
├── src/
│   ├── main.tsx                         # Entrada React
│   ├── App.tsx                          # Componente raiz
│   ├── index.css                        # Estilos globais
│   │
│   ├── pages/                           # Páginas/Rotas
│   │   ├── AiRecommendations.tsx        # Recomendações com IA
│   │   ├── Catalog.tsx                  # Catálogo de materiais
│   │   ├── Details.tsx                  # Detalhes do material
│   │   ├── Favorites.tsx                # Materiais favoritos
│   │   ├── ForgotPassword.tsx           # Recuperação de senha
│   │   ├── Home.tsx                     # Página inicial
│   │   ├── Login.tsx                    # Login
│   │   ├── Onboarding.tsx               # Onboarding inicial
│   │   ├── Profile.tsx                  # Perfil do usuário
│   │   ├── Recommendations.tsx          # Recomendações
│   │   ├── Register.tsx                 # Registro
│   │   └── ResetPassword.tsx            # Reset de senha
│   │
│   ├── components/                      # Componentes Reutilizáveis
│   │   ├── AuthForm.tsx                 # Formulário de autenticação
│   │   ├── Navbar.tsx                   # Barra de navegação
│   │   ├── NavBrand.tsx                 # Logo/Brand nav
│   │   ├── NavLogoutButton.tsx          # Botão logout
│   │   ├── Sidebar.tsx                  # Barra lateral
│   │   ├── CatalogGrid.tsx              # Grid de catálogo
│   │   ├── CatalogPagination.tsx        # Paginação
│   │   ├── CatalogSearchBar.tsx         # Barra de busca
│   │   ├── SearchFilters.tsx            # Filtros de busca
│   │   ├── RecommendationCard.tsx       # Card de recomendação
│   │   ├── RecommendationCardSkeleton.tsx
│   │   ├── MaterialsSection.tsx         # Seção de materiais
│   │   ├── ChatInputForm.tsx            # Input de chat
│   │   ├── ChatLoadingSkeleton.tsx      # Skeleton do chat
│   │   ├── UserMessageBubble.tsx        # Mensagem do usuário
│   │   ├── PromptSuggestions.tsx        # Sugestões de prompt
│   │   │
│   │   ├── ui/                          # Componentes UI básicos
│   │   │   └── (Button, Input, Modal, etc)
│   │   │
│   │   ├── profile/                     # Componentes de Perfil
│   │   │   ├── ProfileForm.tsx
│   │   │   ├── AvatarUpload.tsx
│   │   │   └── PreferencesSection.tsx
│   │   │
│   │   ├── onboarding/                  # Componentes de Onboarding
│   │   │   ├── OnboardingStep.tsx
│   │   │   ├── PreferencesStep.tsx
│   │   │   └── CompleteStep.tsx
│   │   │
│   │   ├── details/                     # Componentes de Detalhes
│   │   │   ├── MaterialHeader.tsx
│   │   │   ├── MaterialContent.tsx
│   │   │   └── MaterialActions.tsx
│   │   │
│   │   └── sidebar/                     # Componentes da Barra Lateral
│   │       ├── SidebarMenu.tsx
│   │       ├── SidebarUser.tsx
│   │       └── SidebarToggle.tsx
│   │
│   ├── contexts/                        # Context API
│   │   ├── AuthContext.tsx              # Contexto de autenticação
│   │   ├── ThemeContext.tsx             # Contexto de tema
│   │   ├── NotificationContext.tsx      # Contexto de notificações
│   │   └── UserContext.tsx              # Contexto de usuário
│   │
│   ├── hooks/                           # Custom Hooks
│   │   ├── useAuth.ts                   # Hook de autenticação
│   │   ├── useUser.ts                   # Hook de usuário
│   │   ├── useFetch.ts                  # Hook de requisição
│   │   └── useLocalStorage.ts           # Hook de localStorage
│   │
│   ├── services/                        # Serviços de API
│   │   ├── api.ts                       # Cliente HTTP (Axios/Fetch)
│   │   ├── authService.ts               # Serviço de auth
│   │   ├── userService.ts               # Serviço de usuário
│   │   ├── materialService.ts           # Serviço de materiais
│   │   ├── recommendationService.ts     # Serviço de recomendações
│   │   ├── aiService.ts                 # Serviço de IA
│   │   └── favoriteService.ts           # Serviço de favoritos
│   │
│   ├── types/                           # Tipos TypeScript
│   │   ├── User.ts                      # Tipo User
│   │   ├── Material.ts                  # Tipo Material
│   │   ├── Recommendation.ts            # Tipo Recommendation
│   │   ├── Auth.ts                      # Tipos de autenticação
│   │   └── api.ts                       # Tipos de API
│   │
│   ├── constants/                       # Constantes
│   │   ├── api.ts                       # URLs de API
│   │   ├── routes.ts                    # Rotas da aplicação
│   │   ├── messages.ts                  # Mensagens
│   │   └── config.ts                    # Configurações
│   │
│   └── assets/                          # Imagens e mídia
│       ├── images/
│       ├── icons/
│       └── fonts/
│
├── package.json                         # Dependências
├── tsconfig.json                        # Configuração TypeScript
├── tsconfig.app.json                    # Config app
├── tsconfig.node.json                   # Config node
├── .env                                 # Variáveis de ambiente
├── .env.example                         # Template de env
└── README.md                            # Documentação frontend

```

### Páginas e Fluxos

| Página | Rota | Autenticação | Descrição |
|--------|------|--------------|-----------|
| **Home** | `/` | Não | Página inicial |
| **Login** | `/login` | Não | Formulário de login |
| **Register** | `/register` | Não | Registro de novo usuário |
| **Onboarding** | `/onboarding` | Sim | Configuração inicial |
| **Catalog** | `/catalog` | Sim | Catálogo de materiais |
| **Details** | `/details/:id` | Sim | Detalhes do material |
| **Favorites** | `/favorites` | Sim | Materiais favoritos |
| **Recommendations** | `/recommendations` | Sim | Recomendações acadêmicas |
| **AI Recommendations** | `/ai-recommendations` | Sim | Chat com IA |
| **Profile** | `/profile` | Sim | Perfil do usuário |
| **Forgot Password** | `/forgot-password` | Não | Recuperar senha |
| **Reset Password** | `/reset-password/:token` | Não | Resetar senha |

---

## 🔄 Fluxo de Dados

```
Frontend (React)                Backend (NestJS)                Database (Prisma)
    ↓                                ↓                               ↓
 UI Components ────→ Services ─→ HTTP Requests ─→ Controllers ──→ Modules ────→ Database
    ↑                                ↑                               ↑
Context API            Auth Guard,    ←────── Responses ←─── Services ─→ Schema
                       Validation
```

---

## 🔐 Autenticação e Segurança

### Fluxo de Autenticação
1. **Frontend**: Usuário faz login
2. **Backend**: Valida credenciais, gera JWT
3. **Frontend**: Armazena token (localStorage/sessionStorage)
4. **Frontend**: Envia token em headers nas próximas requisições
5. **Backend**: Valida JWT com Guard

### Guards de Segurança
- `JwtAuthGuard`: Requer autenticação
- `OptionalJwtAuthGuard`: Autenticação opcional
- Decorador `@CurrentUser()`: Injeta usuário atual

---

## 📊 Modelos de Dados Principais

### Usuário
```typescript
{
  id: string
  email: string
  name: string
  avatar?: string
  preferences: { [key: string]: any }
  isOnboarded: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Material
```typescript
{
  id: string
  title: string
  description: string
  category: string
  url: string
  thumbnail?: string
  createdAt: Date
}
```

### Recomendação
```typescript
{
  id: string
  userId: string
  materialId: string
  score: number
  reason: string
  createdAt: Date
}
```

### Favorito
```typescript
{
  id: string
  userId: string
  materialId: string
  createdAt: Date
}
```

---

## 🚀 Scripts Disponíveis

### Desenvolvimento
```bash
npm run dev:back        # Iniciar backend
npm run dev:front       # Iniciar frontend
npm run dev             # Iniciar ambos (concorrente)
```

### Build
```bash
npm run build:back      # Build backend
npm run build:front     # Build frontend
npm run build           # Build ambos
```

### Linting
```bash
npm run lint            # Lint frontend e backend
```

---

## 🌍 Variáveis de Ambiente

### Backend (.env)
```
DATABASE_URL=...
JWT_SECRET=...
JWT_EXPIRATION=...
SMTP_HOST=...
SMTP_PORT=...
SMTP_USER=...
SMTP_PASS=...
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:3000/api
```

---

## 📝 Convenções

### Backend (NestJS)
- **Modules**: `*.module.ts`
- **Controllers**: `*.controller.ts`
- **Services**: `*.service.ts`
- **DTOs**: `dto/` folder
- **Guards**: `guards/` folder
- **Decorators**: `decorators/` folder

### Frontend (React)
- **Pages**: PascalCase em `pages/`
- **Components**: PascalCase em `components/`
- **Hooks**: camelCase com prefixo `use`
- **Services**: camelCase com sufixo `Service`
- **Types**: PascalCase em `types/`

---

## 📚 Documentação Adicional
- Veja `docs/` para mais informações
- Consulte READMEs individuais de cada pacote
