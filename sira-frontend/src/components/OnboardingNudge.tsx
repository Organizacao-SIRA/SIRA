import { useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';

const DISMISS_KEY = '@sira:onboardingNudgeDismissed';

/**
 * Faixa de reconvite ao onboarding, exibida na área autenticada enquanto o
 * perfil não foi concluído. É a porta de retomada para quem adiou — fica aqui,
 * não nas Configurações.
 *
 * Dispensável por sessão (reaparece no próximo acesso até o usuário concluir).
 * Some sozinha quando `hasCompletedOnboarding` vira true.
 */
export const OnboardingNudge = () => {
  const { t } = useTranslation('onboarding');
  const navigate = useNavigate();
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(DISMISS_KEY) === '1';
    } catch {
      return false;
    }
  });

  if (!user || user.hasCompletedOnboarding || dismissed) return null;

  const dismiss = () => {
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      /* ambiente sem sessionStorage — ignora */
    }
    setDismissed(true);
  };

  return (
    <div className="flex items-center gap-3 border-b border-border bg-primary-soft px-4 py-2.5 sm:px-6 lg:px-8 animate-fadeIn">
      <span className="flex-shrink-0 text-link">
        <Sparkles className="h-4 w-4" aria-hidden="true" />
      </span>
      <p className="min-w-0 flex-1 text-sm text-text">
        <span className="font-semibold text-primary-dark dark:text-text">{t('nudge.title')}</span>
        <span className="ml-1 hidden text-text-muted sm:inline">{t('nudge.description')}</span>
      </p>
      <Button
        variant="primary"
        size="sm"
        onClick={() => navigate('/onboarding')}
        className="flex-shrink-0 px-4 py-1.5 text-sm"
      >
        {t('nudge.cta')}
      </Button>
      <button
        type="button"
        onClick={dismiss}
        aria-label={t('nudge.dismiss')}
        className="flex h-8 w-8 flex-shrink-0 cursor-pointer items-center justify-center rounded-lg text-text-subtle transition-colors hover:bg-surface-subtle hover:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
};
