import { Sparkles, BookOpen, Compass, BrainCircuit } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface WelcomeStepProps {
  userName?: string | null;
  onSkip?: () => void;
}

const HIGHLIGHTS = [
  { icon: Compass,      labelKey: 'welcome.highlights.recommendations' },
  { icon: BookOpen,     labelKey: 'welcome.highlights.library' },
  { icon: BrainCircuit, labelKey: 'welcome.highlights.aiSearch' },
];

export const WelcomeStep = ({ userName, onSkip }: WelcomeStepProps) => {
  const { t } = useTranslation('onboarding');
  const firstName = userName?.trim().split(' ')[0];

  return (
    <div className="text-center max-w-xl mx-auto">
      <div className="w-16 h-16 bg-primary-soft text-link rounded-full flex items-center justify-center mx-auto mb-5">
        <Sparkles className="w-8 h-8" aria-hidden="true" />
      </div>

      <h1 className="text-2xl sm:text-3xl font-bold text-primary-dark dark:text-text mb-3">
        {firstName ? t('welcome.hello', { name: firstName }) : t('welcome.fallback')}
      </h1>
      <p className="text-text-muted text-sm sm:text-base mb-8">
        {t('welcome.description')}
      </p>

      <ul className="space-y-3 text-left">
        {HIGHLIGHTS.map(({ icon: Icon, labelKey }) => (
          <li
            key={labelKey}
            className="flex items-start gap-3 p-3 rounded-xl bg-surface-muted border border-border"
          >
            <span className="text-link mt-0.5 flex-shrink-0">
              <Icon className="w-5 h-5" aria-hidden="true" />
            </span>
            <span className="text-sm text-text">{t(labelKey)}</span>
          </li>
        ))}
      </ul>

      {onSkip && (
        <button
          type="button"
          onClick={onSkip}
          className="mt-6 text-sm font-semibold text-text-muted hover:text-link transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 rounded-md px-2 py-1"
        >
          {t('welcome.skip')}
        </button>
      )}
    </div>
  );
};
