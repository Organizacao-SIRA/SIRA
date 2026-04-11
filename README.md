# SIRA - Sistema Inteligente de Recomendações Acadêmicas

O SIRA é um sistema de recomendações acadêmicas desenvolvido em uma arquitetura de monorepo com foco em performance e escalabilidade.

## 🛠️ Tecnologias e Aplicação

*   **Backend (sira-backend):** API construída com **NestJS 11** e **TypeScript**. Segue uma arquitetura modular com injeção de dependência nativa.
*   **Frontend (sira-frontend):** Aplicação Single Page (SPA) desenvolvida com **React 19**, **Vite 8** e **Tailwind CSS 4**. Focada em renderização rápida e Hot Reload (HMR).
*   **Banco de Dados:** **PostgreSQL 17** rodando em container isolado.
*   **ORM:** **Prisma 7** para modelagem de dados e gerenciamento de migrations (conectado ao Postgres).
*   **Infraestrutura:** **Docker & Docker Compose**. Tudo roda em containers para garantir que o ambiente seja idêntico em qualquer máquina.

## 🏗️ Estrutura de Infraestrutura

1.  **Dockerização Multi-stage:** O backend e o frontend possuem builds divididos em estágios. Isso significa que as ferramentas de desenvolvimento (compiladores, linters) ficam de fora da imagem final, deixando-a leve e segura.
2.  **Segurança Non-Root:** O backend roda com um usuário de sistema limitado (`nestjs`), não como root, seguindo boas práticas de segurança de containers.
3.  **Rede Interna:** Os serviços se comunicam via uma rede privada interna do Docker (`sira-network`), permitindo que a API acesse o banco apenas pelo nome do serviço (`postgres`).
4.  **Resiliência:** O backend possui um sistema de *healthcheck* que aguarda o banco de dados estar totalmente pronto antes de iniciar o serviço.

## 🚀 Como Iniciar o Projeto

Certifique-se de ter o **Docker** instalado em sua máquina.

### 1. Configurar Variáveis de Ambiente
Antes de subir os containers, é necessário criar os arquivos `.env` a partir dos exemplos fornecidos:

```bash
# Na raiz do projeto:
cp sira-backend/.env.example sira-backend/.env
cp sira-frontend/.env.example sira-frontend/.env
```

*Nota: No arquivo `sira-backend/.env`, você pode precisar configurar chaves de API externas (como `GOOGLE_BOOKS_API_KEY`) para habilitar todas as funcionalidades de busca.*

### 2. Clonar e Iniciar
Agora, execute o comando abaixo para construir as imagens e subir os containers:

```bash
docker-compose up --build
```

### 2. Acessar os Serviços
Após a finalização do processo, os serviços estarão disponíveis nos seguintes endereços:

*   **Frontend:** [http://localhost:5173](http://localhost:5173)
*   **Backend (Saúde da API):** [http://localhost:3000/api/v1/health](http://localhost:3000/api/v1/health)
*   **Documentação Swagger:** [http://localhost:3000/api/docs](http://localhost:3000/api/docs)

### 3. Desenvolvimento em Tempo Real
O projeto está configurado com **volumes montados**. Isso significa que qualquer alteração que você fizer no código das pastas `src/` (tanto no backend quanto no frontend) será refletida instantaneamente dentro do container sem que você precise reiniciá-lo.

---

**Nota:** Se precisar resetar o banco de dados completamente:
```bash
docker-compose down -v
```
