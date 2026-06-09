/**
 * Estado "adiar onboarding" — por usuário, em localStorage.
 *
 * O onboarding deixa de ser um muro: o usuário pode optar por preencher depois.
 * A *verdade* de "concluído" continua no backend (`hasCompletedOnboarding`);
 * este sinal é apenas de UX, para o gate não forçar de novo quem escolheu adiar.
 *
 * A chave é por `userId` para não vazar entre contas no mesmo dispositivo.
 */
const keyFor = (userId: string) => `@sira:onboardingDeferred:${userId}`;

export const isOnboardingDeferred = (userId: string): boolean => {
  try {
    return localStorage.getItem(keyFor(userId)) === '1';
  } catch {
    return false;
  }
};

export const deferOnboarding = (userId: string): void => {
  try {
    localStorage.setItem(keyFor(userId), '1');
  } catch {
    /* ambiente sem localStorage (ex.: modo privado) — ignora silenciosamente */
  }
};

export const clearOnboardingDeferral = (userId: string): void => {
  try {
    localStorage.removeItem(keyFor(userId));
  } catch {
    /* idem */
  }
};
