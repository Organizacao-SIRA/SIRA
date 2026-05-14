import { defineConfig } from 'prisma/config';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Carrega o .env manualmente para garantir que o Prisma Config o veja
dotenv.config({ path: join(__dirname, '.env') });

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
