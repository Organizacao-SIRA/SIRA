import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Button } from '../ui/Button';

interface OnboardingActionsProps {
  step: number;
  totalSteps: number;
  canAdvance: boolean;
  isSaving: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
  hint?: React.ReactNode;
}

export const OnboardingActions = ({
  step,
  totalSteps,
  canAdvance,
  isSaving,
  onBack,
  onNext,
  onSubmit,
  hint,
}: OnboardingActionsProps) => {
  const isFirst = step === 0;
  const isLast = step === totalSteps - 1;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center justify-between sm:justify-start gap-3 min-w-0">
        {!isFirst && (
          <button
            type="button"
            onClick={onBack}
            className="text-text-muted hover:text-primary text-sm font-bold flex items-center gap-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-md px-1 py-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Voltar
          </button>
        )}
        {hint && <div className="text-[10px] font-bold uppercase tracking-widest text-text-subtle truncate">{hint}</div>}
      </div>

      {isLast ? (
        <Button
          type="button"
          onClick={onSubmit}
          isLoading={isSaving}
          className="w-full sm:w-auto"
        >
          {isSaving ? (
            'Salvando...'
          ) : (
            <>
              <Check className="w-4 h-4" />
              Finalizar configuração
            </>
          )}
        </Button>
      ) : (
        <Button
          type="button"
          onClick={onNext}
          disabled={!canAdvance}
          className="w-full sm:w-auto group"
        >
          {isFirst ? 'Começar' : 'Continuar'}
          <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      )}
    </div>
  );
};
