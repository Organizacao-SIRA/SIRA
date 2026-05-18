import { Check } from 'lucide-react';
import { ONBOARDING_STEPS } from '../../types/onboarding';

interface OnboardingProgressProps {
  currentStep: number;
  onJumpTo?: (step: number) => void;
}

export const OnboardingProgress = ({ currentStep, onJumpTo }: OnboardingProgressProps) => {
  const total = ONBOARDING_STEPS.length;
  const percent = Math.round(((currentStep + 1) / total) * 100);
  const meta = ONBOARDING_STEPS[currentStep];

  return (
    <div className="space-y-3" aria-label={`Etapa ${currentStep + 1} de ${total}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-text-subtle uppercase tracking-widest">
            Etapa {currentStep + 1} de {total}
          </p>
          <h2 className="text-base sm:text-lg font-bold text-primary-dark dark:text-text truncate">
            {meta.label}
          </h2>
        </div>
        <span className="text-xs font-bold text-primary whitespace-nowrap">{percent}%</span>
      </div>

      <ol className="hidden sm:flex items-center gap-1.5">
        {ONBOARDING_STEPS.map((stepMeta, index) => {
          const isCompleted = index < currentStep;
          const isCurrent = index === currentStep;
          const interactive = onJumpTo && index <= currentStep;
          return (
            <li
              key={stepMeta.id}
              className="flex items-center gap-1.5 flex-1 min-w-0"
              aria-current={isCurrent ? 'step' : undefined}
            >
              <button
                type="button"
                onClick={() => interactive && onJumpTo!(index)}
                disabled={!interactive}
                aria-label={`Ir para ${stepMeta.label}`}
                className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold flex-shrink-0 transition-all ${
                  isCurrent
                    ? 'bg-primary text-white ring-2 ring-primary/30'
                    : isCompleted
                      ? 'bg-primary text-white cursor-pointer hover:bg-primary-dark'
                      : 'bg-surface-muted text-text-subtle border border-border'
                } ${!interactive ? 'cursor-default' : ''} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5" /> : index + 1}
              </button>
              {index < total - 1 && (
                <div
                  className={`h-0.5 flex-1 rounded-full transition-colors ${
                    isCompleted ? 'bg-primary' : 'bg-border'
                  }`}
                />
              )}
            </li>
          );
        })}
      </ol>

      <div className="sm:hidden h-1.5 bg-border rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
