import type { RegisteredUser } from '../../support/commands';

/**
 * PT04 — Gestão de Favoritos (RF008 a RF012)
 * Casos de Teste: CT12 (listar/filtrar), CT13 (isolamento entre contas),
 * e os fluxos de filtragem (CT23/CT24/CT25).
 *
 * O Módulo de Pesquisa é testado manualmente (ver Plano de Testes, seção 2),
 * então os favoritos são semeados direto pela API em vez de percorrer a
 * busca — o que é exercitado aqui é a tela de Favoritos em si.
 */

const visitFavoritesAs = (registered: RegisteredUser) =>
  cy.visit('/favoritos', {
    onBeforeLoad(win) {
      win.localStorage.setItem('sira_access_token', registered.accessToken);
      win.localStorage.setItem('sira_refresh_token', registered.refreshToken);
      win.localStorage.setItem('@sira:user', JSON.stringify(registered.user));
      // Favoritos não exige perfil acadêmico completo — adia o onboarding
      // como um usuário real faria ao clicar em "fazer depois".
      win.localStorage.setItem(`@sira:onboardingDeferred:${registered.user.id}`, '1');
    },
  });

describe('Gestão de Favoritos (RF008-RF012)', () => {
  it('CT12 — lista os favoritos salvos e filtra por Livros/Artigos', () => {
    cy.apiRegister().then((user) => {
      cy.apiAddFavorite(user.accessToken, { type: 'book', title: 'Livro Favorito E2E' });
      cy.apiAddFavorite(user.accessToken, { type: 'article', title: 'Artigo Favorito E2E' });
      visitFavoritesAs(user);
    });

    cy.contains('[data-testid="material-card"]', 'Livro Favorito E2E').should('be.visible');
    cy.contains('[data-testid="material-card"]', 'Artigo Favorito E2E').should('be.visible');
    cy.contains('2 salvos').should('be.visible');

    cy.getByTestId('favorites-tab-book').click();
    cy.contains('[data-testid="material-card"]', 'Livro Favorito E2E').should('be.visible');
    cy.contains('[data-testid="material-card"]', 'Artigo Favorito E2E').should('not.exist');

    cy.getByTestId('favorites-tab-article').click();
    cy.contains('[data-testid="material-card"]', 'Artigo Favorito E2E').should('be.visible');
    cy.contains('[data-testid="material-card"]', 'Livro Favorito E2E').should('not.exist');

    cy.getByTestId('favorites-tab-all').click();
    cy.contains('[data-testid="material-card"]', 'Livro Favorito E2E').should('be.visible');
    cy.contains('[data-testid="material-card"]', 'Artigo Favorito E2E').should('be.visible');
  });

  it('remove um favorito da lista imediatamente ao clicar no botão de favoritar', () => {
    cy.apiRegister().then((user) => {
      cy.apiAddFavorite(user.accessToken, { title: 'Material a Remover E2E' });
      visitFavoritesAs(user);
    });

    cy.contains('[data-testid="material-card"]', 'Material a Remover E2E')
      .find('[data-testid="favorite-toggle"]')
      .click();

    cy.contains('[role="status"]', 'Removido dos favoritos.').should('be.visible');
    cy.contains('[data-testid="material-card"]', 'Material a Remover E2E').should('not.exist');
    cy.contains('Nenhum material salvo').should('be.visible');
  });

  it('CT25 — mostra estado vazio ao filtrar por um tipo sem itens e restaura a lista ao limpar o filtro', () => {
    cy.apiRegister().then((user) => {
      cy.apiAddFavorite(user.accessToken, { type: 'book', title: 'Único Livro Salvo E2E' });
      visitFavoritesAs(user);
    });

    cy.getByTestId('favorites-tab-article').click();
    cy.contains('Nenhum artigo salvo').should('be.visible');
    cy.contains('[data-testid="material-card"]', 'Único Livro Salvo E2E').should('not.exist');

    cy.getByTestId('favorites-clear-filters').click();
    cy.getByTestId('favorites-tab-all').should('have.attr', 'aria-selected', 'true');
    cy.contains('[data-testid="material-card"]', 'Único Livro Salvo E2E').should('be.visible');
  });

  it('CT13 — isola o acervo de favoritos entre contas diferentes', () => {
    cy.apiRegister({ name: 'Usuária A' })
      .then((userA) => cy.apiAddFavorite(userA.accessToken, { title: 'Favorito Privado de A' }))
      .then((materialOfA) =>
        cy.apiRegister({ name: 'Usuário B' }).then((userB) => ({ materialOfA, userB })),
      )
      .then(({ materialOfA, userB }) =>
        // B tenta remover, via API, um favorito que pertence a A: o backend
        // escopa a busca por userId + materialId, então não encontra nada.
        cy
          .request({
            method: 'DELETE',
            url: `${Cypress.env('apiUrl')}/favorites/${encodeURIComponent(materialOfA.id)}`,
            headers: { Authorization: `Bearer ${userB.accessToken}` },
            failOnStatusCode: false,
          })
          .then((deleteResponse) => ({ materialOfA, userB, deleteResponse })),
      )
      .then(({ materialOfA, userB, deleteResponse }) => {
        expect(deleteResponse.status).to.eq(404);
        expect(deleteResponse.body.code).to.eq('FAVORITE_NOT_FOUND');

        // A listagem de B também não deve vazar o material de A.
        return cy
          .request({
            url: `${Cypress.env('apiUrl')}/favorites/ids`,
            headers: { Authorization: `Bearer ${userB.accessToken}` },
          })
          .then((idsResponse) => ({ materialOfA, userB, idsResponse }));
      })
      .then(({ materialOfA, userB, idsResponse }) => {
        expect(idsResponse.body).to.not.include(materialOfA.id);
        visitFavoritesAs(userB);
      });

    cy.contains('Nenhum material salvo').should('be.visible');
    cy.contains('Favorito Privado de A').should('not.exist');
  });
});
