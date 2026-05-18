import { Globe, Sparkles } from 'lucide-react';
import { InterestCard } from '../InterestCard';
import { TOPIC_ICONS } from '../../../constants/topicIcons';
import type { PreferenceTopic } from '../../../types';

interface InterestAreasStepProps {
  topics: PreferenceTopic[];
  selected: string[];
  onToggle: (topicId: string) => void;
  error?: string;
  minSelected?: number;
}

export const InterestAreasStep = ({
  topics,
  selected,
  onToggle,
  error,
  minSelected = 3,
}: InterestAreasStepProps) => {
  const remaining = Math.max(0, minSelected - selected.length);
  const reachedMin = selected.length >= minSelected;

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <header className="flex items-start gap-3">
        <div className="p-2 bg-primary-soft rounded-lg text-primary">
          <Sparkles className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-primary-dark dark:text-text">Quais temas te interessam?</h2>
          <p className="text-sm text-text-muted mt-0.5">
            Selecione pelo menos <span className="font-bold text-primary">{minSelected} áreas</span>.
            Você poderá ajustar isso a qualquer momento no perfil.
          </p>
        </div>
      </header>

      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-surface-muted border border-border">
        <span className="text-xs font-bold text-text-muted">
          {selected.length} de {minSelected} mín. selecionado{selected.length === 1 ? '' : 's'}
        </span>
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${
            reachedMin ? 'text-success-strong' : 'text-text-subtle'
          }`}
        >
          {reachedMin ? 'Tudo certo!' : `Faltam ${remaining}`}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {topics.map((topic) => {
          const Icon = TOPIC_ICONS[topic.id] || Globe;
          return (
            <InterestCard
              key={topic.id}
              icon={Icon}
              label={topic.label}
              description={topic.description}
              selected={selected.includes(topic.id)}
              onToggle={() => onToggle(topic.id)}
            />
          );
        })}
      </div>

      {error && <p className="text-xs text-danger-strong font-medium">{error}</p>}
    </div>
  );
};
