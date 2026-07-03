/**
 * PT01 — Autenticação e Cadastro de Usuário (RF003 - Cadastro)
 * Casos de Teste: CT01 (cadastro válido), CT02 (e-mail duplicado).
 *
 * A UI redireciona todo usuário recém-autenticado, sem onboarding concluído,
 * para /onboarding (ver ProtectedLayout) — por isso o teste verifica "saiu da
 * tela de cadastro com uma sessão autenticada", que é a garantia por trás do
 * "Estado alcançado: Usuário cadastrado e Autenticado" do plano, em vez de um
 * caminho fixo para o feed de recomendações.
 */

describe('Cadastro de usuário (RF003)', () => {
  beforeEach(() => {
    cy.visit('/register');
  });

  it('CT01 — cadastra um novo usuário com dados válidos e autentica a sessão', () => {
    const stamp = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const email = `sira.e2e.${stamp}@teste.ufc.br`;

    cy.getByTestId('register-name').type('João da Silva');
    cy.getByTestId('register-email').type(email);
    cy.getByTestId('register-password').type('SenhaForte@123');
    cy.getByTestId('register-confirm-password').type('SenhaForte@123');
    cy.getByTestId('register-submit').click();

    // Saiu da tela pública de cadastro — o AuthGate só deixa isso acontecer
    // com sessão autenticada (senão o próprio /register te devolve para lá).
    cy.url().should('not.include', '/register');
    cy.window().its('localStorage.sira_access_token').should('be.a', 'string').and('not.be.empty');
    cy.window().its('localStorage.@sira:user').then((raw) => {
      const stored = JSON.parse(raw as unknown as string);
      expect(stored.email).to.eq(email);
    });
  });

  it('CT02 — bloqueia cadastro com e-mail já existente', () => {
    cy.apiRegister().then((existing) => {
      cy.getByTestId('register-name').type('Maria Oliveira');
      cy.getByTestId('register-email').type(existing.email);
      cy.getByTestId('register-password').type('OutraSenha#456');
      cy.getByTestId('register-confirm-password').type('OutraSenha#456');
      cy.getByTestId('register-submit').click();

      cy.contains('[role="alert"]', 'E-mail já cadastrado.').should('be.visible');
      cy.url().should('include', '/register');
    });
  });

  it('valida senha fraca no cliente antes de chamar a API (partição de equivalência)', () => {
    cy.getByTestId('register-name').type('Usuário Fraco');
    cy.getByTestId('register-email').type(`sira.e2e.weak.${Date.now()}@teste.ufc.br`);
    cy.getByTestId('register-password').type('12345');
    cy.getByTestId('register-confirm-password').type('12345');
    cy.getByTestId('register-submit').click();

    cy.contains('[role="alert"]', 'A senha não atende aos requisitos de segurança.').should('be.visible');
    cy.url().should('include', '/register');
  });

  it('valida confirmação de senha divergente', () => {
    cy.getByTestId('register-name').type('Usuário Divergente');
    cy.getByTestId('register-email').type(`sira.e2e.mismatch.${Date.now()}@teste.ufc.br`);
    cy.getByTestId('register-password').type('SenhaForte@123');
    cy.getByTestId('register-confirm-password').type('SenhaDiferente@123');
    cy.getByTestId('register-submit').click();

    cy.contains('[role="alert"]', 'As senhas não coincidem.').should('be.visible');
    cy.url().should('include', '/register');
  });
});
