/**
 * PT02 — Gestão de Perfil e Preferências (RF005 a RF007)
 * Casos de Teste: CT05 (áreas de interesse), CT06 (upload de avatar válido),
 * CT07 (upload de avatar em formato inválido).
 *
 * O onboarding é concluído via API em `cy.loginToApp` para liberar a edição
 * de curso/áreas de interesse/preferências na tela — na UI, essas seções só
 * ficam editáveis depois que `hasCompletedOnboarding` é `true` (ver
 * Profile.tsx / ProtectedLayout).
 */

describe('Gestão de Perfil (RF005-RF007)', () => {
  beforeEach(() => {
    cy.loginToApp({ visit: '/perfil', completeOnboarding: true });
    cy.getByTestId('profile-edit-button').should('be.visible');
  });

  it('CT05 — atualiza o nome e adiciona uma nova área de interesse', () => {
    cy.getByTestId('profile-edit-button').click();

    cy.getByTestId('profile-name-input').clear().type('Nome Atualizado E2E');
    // "Educação" não faz parte do seed de onboarding (ia, cd, comp) — alterna
    // para selecionada.
    cy.contains('button', 'Educação', { timeout: 10000 }).as('interestTile');
    cy.get('@interestTile').should('have.attr', 'aria-pressed', 'false');
    cy.get('@interestTile').click();
    cy.get('@interestTile').should('have.attr', 'aria-pressed', 'true');

    cy.getByTestId('profile-save-button').click();

    cy.contains('[role="status"]', 'Perfil atualizado com sucesso.').should('be.visible');
    cy.getByTestId('profile-edit-button').should('be.visible'); // saiu do modo edição
    cy.getByTestId('profile-name-display').should('have.text', 'Nome Atualizado E2E');
    cy.contains('button', 'Educação').should('have.attr', 'aria-pressed', 'true');
  });

  it('CT06 — envia uma imagem válida e atualiza a foto de perfil', () => {
    cy.getByTestId('profile-avatar-trigger').click();
    cy.get('[role="dialog"]').should('be.visible');

    cy.getByTestId('avatar-file-input').selectFile('cypress/fixtures/avatar-valid.png', { force: true });
    cy.getByTestId('avatar-save-button').should('not.be.disabled').click();

    cy.contains('[role="status"]', 'Foto de perfil atualizada.').should('be.visible');
    cy.get('[role="dialog"]').should('not.exist');
  });

  it('CT07 — rejeita upload de arquivo em formato não suportado', () => {
    cy.getByTestId('profile-avatar-trigger').click();
    cy.getByTestId('avatar-file-input').selectFile('cypress/fixtures/avatar-invalid.txt', { force: true });

    cy.contains('[role="alert"]', 'Formato inválido. Use JPG, PNG ou WEBP.').should('be.visible');
    // Sem seleção válida, o botão de salvar permanece desabilitado — o modal
    // não deixa prosseguir com o arquivo rejeitado.
    cy.getByTestId('avatar-save-button').should('be.disabled');
  });
});
