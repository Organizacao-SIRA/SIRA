/**
 * PT01 — Autenticação e Cadastro de Usuário (RF001 - Login)
 * Casos de Teste: CT03 (login válido), CT04 (senha incorreta).
 */

describe('Login (RF001)', () => {
  let user: { email: string; password: string };

  before(() => {
    // Usuário fixo para todo o describe — os testes de login não alteram a
    // conta, então reaproveitar evita registrar um usuário por teste.
    cy.apiRegister().then((registered) => {
      user = { email: registered.email, password: registered.password };
    });
  });

  beforeEach(() => {
    cy.visit('/login');
  });

  it('CT03 — autentica com credenciais válidas e sai da tela de login', () => {
    cy.getByTestId('login-email').type(user.email);
    cy.getByTestId('login-password').type(user.password);
    cy.getByTestId('login-submit').click();

    cy.url().should('not.include', '/login');
    cy.window().its('localStorage.sira_access_token').should('be.a', 'string').and('not.be.empty');
  });

  it('CT04 — rejeita login com senha incorreta e mantém o usuário na tela de login', () => {
    cy.getByTestId('login-email').type(user.email);
    cy.getByTestId('login-password').type('SenhaErrada000!');
    cy.getByTestId('login-submit').click();

    cy.contains('[role="alert"]', 'E-mail ou senha inválidos.').should('be.visible');
    cy.url().should('include', '/login');
    cy.getByTestId('login-email').should('have.value', user.email);
  });

  it('exige e-mail e senha antes de chamar a API (validação client-side)', () => {
    cy.getByTestId('login-submit').click();

    cy.contains('[role="alert"]', 'Informe seu e-mail.').should('be.visible');
    cy.url().should('include', '/login');
  });
});
