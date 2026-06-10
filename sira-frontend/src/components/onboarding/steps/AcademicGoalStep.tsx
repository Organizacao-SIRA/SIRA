import React from 'react';
import { useTranslation } from 'react-i18next';
import {
  Target, Rocket, BookOpen,
  Briefcase, FlaskConical, ScrollText, X,
} from 'lucide-react';
import { preferenceValueLabel } from '@/i18n/preferenceLabels';

// Ícone por objetivo, indexado pelo valor canônico (não pela posição na lista),
// para não quebrar se a constante for reordenada. Valores desconhecidos caem no
// fallback `Target`.
const GOAL_ICONS: Record<string, React.ElementType> = {
  'TCC': ScrollText,
  'Pesquisa científica': FlaskConical,
  'Estudo de disciplina': BookOpen,
  'Concursos': Briefcase,
  'Trabalho profissional': Rocket,
};

interface AcademicGoalStepProps {
  goals: string[];
  selected: string;
  onSelect: (goal: string) => void;
}

export const AcademicGoalStep = ({ goals, selected, onSelect }: AcademicGoalStepProps) => {
  const { t } = useTranslation('onboarding');
  const { t: tp } = useTranslation('preferences');

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
    <header className="flex items-start gap-3">
      <div className="p-2 bg-primary-soft rounded-lg text-link">
        <Target className="w-5 h-5" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="text-lg sm:text-xl font-bold text-primary-dark dark:text-text">
          {t('goal.title')} <span className="text-xs font-normal text-text-subtle ml-1">{t('goal.optional')}</span>
        </h2>
        <p className="text-sm text-text-muted mt-0.5">
          {t('goal.description')}
        </p>
      </div>
    </header>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {goals.map((goal) => {
        const Icon = GOAL_ICONS[goal] || Target;
        const isSelected = selected === goal;
        return (
          <button
            key={goal}
            type="button"
            onClick={() => onSelect(isSelected ? '' : goal)}
            aria-pressed={isSelected}
            className={`flex items-center gap-3 p-3.5 rounded-xl border-2 transition-all cursor-pointer text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 ${
              isSelected
                ? 'border-selected-border bg-selected'
                : 'border-border bg-surface-muted hover:border-border-strong hover:bg-surface'
            }`}
          >
            <span
              className={`p-2 rounded-lg flex-shrink-0 ${
                isSelected ? 'bg-primary text-white' : 'bg-surface text-text-subtle'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
            </span>
            <span
              className={`text-sm font-semibold flex-1 ${
                isSelected ? 'text-link' : 'text-text'
              }`}
            >
              {preferenceValueLabel(goal, tp)}
            </span>
          </button>
        );
      })}
    </div>

    {selected && (
      <button
        type="button"
        onClick={() => onSelect('')}
        className="text-xs font-bold text-text-muted hover:text-danger-strong inline-flex items-center gap-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger-strong/40 rounded px-1 py-0.5"
      >
        <X className="w-3.5 h-3.5" />
        {t('goal.clear')}
      </button>
    )}
    </div>
  );
};
