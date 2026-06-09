// Carrega o .env local: o Prisma CLI moderno (prisma.config.ts) NÃO carrega
// o .env automaticamente, então fazemos isso aqui para que `prisma db push`,
// `migrate` e `generate` enxerguem o DATABASE_URL ao rodar localmente.
import 'dotenv/config';
import { defineConfig } from 'prisma/config';

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
