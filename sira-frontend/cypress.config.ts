import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    supportFile: 'cypress/support/e2e.ts',
    specPattern: 'cypress/e2e/**/*.cy.ts',
    fixturesFolder: 'cypress/fixtures',
    video: false,
    viewportWidth: 1280,
    viewportHeight: 800,
    defaultCommandTimeout: 8000,
    retries: {
      runMode: 1,
      openMode: 0,
    },
    env: {
      // URL da API do backend NestJS — sobrescreva com `--env apiUrl=...`
      // ou a variável de ambiente CYPRESS_apiUrl para outros ambientes.
      apiUrl: 'http://localhost:3000/api/v1',
    },
    setupNodeEvents() {
      // Nenhum plugin/task customizado necessário no momento.
    },
  },
});
