/// <reference types="cypress" />

/**
 * Comandos customizados para o SIRA+.
 *
 * A suíte cobre apenas os módulos marcados como "Execução Automática" no
 * Plano de Testes (Autenticação/Cadastro, Gestão de Perfil e Gestão de
 * Favoritos). Pesquisa e Recomendação dependem do Claude e são testados
 * manualmente — ver seção 3 (Estratégia de Teste) do plano.
 *
 * Setup via API (register/login/onboarding/favoritos) é usado para chegar
 * rápido ao estado sob teste sem depender da UI de cada fluxo anterior —
 * só a UI do fluxo testado é exercitada pelo teste em si.
 */

export interface AuthUserPayload {
  id: string;
  email: string;
  name: string | null;
  avatarUrl?: string | null;
  hasCompletedOnboarding?: boolean;
  uiLocale?: string;
  [key: string]: unknown;
}

export interface RegisteredUser {
  accessToken: string;
  refreshToken: string;
  user: AuthUserPayload;
  email: string;
  password: string;
  name: string;
}

export interface FavoriteSeed {
  id: string;
  type: 'book' | 'article';
  title: string;
  authors: string;
  year: string;
  source: string;
}

interface LoginToAppOptions {
  /** Rota a visitar após a sessão ser injetada. Padrão: "/". */
  visit?: string;
  /** Sobrescreve nome/e-mail/senha do usuário criado via API. */
  register?: Partial<{ name: string; email: string; password: string }>;
  /**
   * Conclui o onboarding via API antes de visitar a página (padrão: true).
   * Necessário para os testes de Perfil, que exigem `hasCompletedOnboarding`
   * para liberar a edição de curso/áreas de interesse/preferências.
   */
  completeOnboarding?: boolean;
  /**
   * Quando `completeOnboarding` é `false`, marca o onboarding como "adiado"
   * (mesmo mecanismo do botão "fazer depois" da UI) para não ser redirecionado
   * para /onboarding — usado pelos testes de Favoritos, que não dependem de
   * perfil acadêmico completo.
   */
  deferOnboarding?: boolean;
}

const apiUrl = () => Cypress.env('apiUrl') as string;

const uniqueEmail = (prefix = 'sira.e2e') => {
  const stamp = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
  return `${prefix}.${stamp}@teste.ufc.br`;
};

Cypress.Commands.add('getByTestId', (testId: string) => cy.get(`[data-testid="${testId}"]`));

Cypress.Commands.add(
  'apiRegister',
  (overrides: Partial<{ name: string; email: string; password: string }> = {}) => {
    const email = overrides.email ?? uniqueEmail();
    const password = overrides.password ?? 'SiraTeste@123';
    const name = overrides.name ?? 'Usuária de Teste';

    return cy
      .request({
        method: 'POST',
        url: `${apiUrl()}/auth/register`,
        body: { name, email, password, confirmPassword: password },
      })
      .then((response) => ({
        ...(response.body as { accessToken: string; refreshToken: string; user: AuthUserPayload }),
        email,
        password,
        name,
      }) as RegisteredUser);
  },
);

Cypress.Commands.add('apiCompleteOnboarding', (accessToken: string) =>
  cy
    .request({
      method: 'PATCH',
      url: `${apiUrl()}/users/onboarding`,
      headers: { Authorization: `Bearer ${accessToken}` },
      body: {
        course: 'Ciência da Computação',
        educationLevel: 'Graduação',
        mainArea: 'ia',
        subAreas: 'Engenharia de Software',
        languages: ['Português'],
        materialLevels: ['Intermediário'],
        wantsBooks: true,
        wantsArticles: true,
        interests: ['ia', 'cd', 'comp'],
        academicGoal: 'Pesquisa científica',
      },
    })
    .then((response) => response.body as AuthUserPayload),
);

Cypress.Commands.add(
  'apiAddFavorite',
  (accessToken: string, overrides: Partial<FavoriteSeed> = {}) => {
    const stamp = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
    const material: FavoriteSeed = {
      id: overrides.id ?? `e2e-material-${stamp}`,
      type: overrides.type ?? 'book',
      title: overrides.title ?? `Material de Teste ${stamp}`,
      authors: overrides.authors ?? 'Autora de Teste',
      year: overrides.year ?? '2024',
      source: overrides.source ?? 'Google Books',
    };

    return cy
      .request({
        method: 'POST',
        url: `${apiUrl()}/favorites`,
        headers: { Authorization: `Bearer ${accessToken}` },
        body: material,
      })
      .then(() => material);
  },
);

Cypress.Commands.add('loginToApp', (options: LoginToAppOptions = {}) => {
  const { visit = '/', completeOnboarding = true, deferOnboarding = true, register = {} } = options;

  return cy.apiRegister(register).then((registered) => {
    const withFinalUser = completeOnboarding
      ? cy
          .apiCompleteOnboarding(registered.accessToken)
          .then((user) => ({ ...registered, user }) as RegisteredUser)
      : cy.wrap(registered, { log: false });

    return withFinalUser.then((finalUser: RegisteredUser) =>
      cy
        .visit(visit, {
          onBeforeLoad(win) {
            win.localStorage.setItem('sira_access_token', finalUser.accessToken);
            win.localStorage.setItem('sira_refresh_token', finalUser.refreshToken);
            win.localStorage.setItem('@sira:user', JSON.stringify(finalUser.user));
            if (!completeOnboarding && deferOnboarding) {
              win.localStorage.setItem(`@sira:onboardingDeferred:${finalUser.user.id}`, '1');
            }
          },
        })
        .then(() => finalUser),
    );
  });
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /** Atalho para `cy.get('[data-testid="..."]')`. */
      getByTestId(testId: string): Chainable<JQuery<HTMLElement>>;
      /** Cria um usuário novo direto na API (bypassa a UI de cadastro). */
      apiRegister(
        overrides?: Partial<{ name: string; email: string; password: string }>,
      ): Chainable<RegisteredUser>;
      /** Marca o onboarding do usuário autenticado como concluído via API. */
      apiCompleteOnboarding(accessToken: string): Chainable<AuthUserPayload>;
      /** Adiciona um material fabricado aos favoritos do usuário via API. */
      apiAddFavorite(accessToken: string, overrides?: Partial<FavoriteSeed>): Chainable<FavoriteSeed>;
      /** Registra (ou usa credenciais dadas), injeta a sessão e visita a rota. */
      loginToApp(options?: LoginToAppOptions): Chainable<RegisteredUser>;
    }
  }
}
