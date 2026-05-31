import { Globe, Sparkles } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { InterestCard } from '../InterestCard';
import { TOPIC_ICONS } from '../../../constants/topicIcons';
import { preferenceTopicDescription, preferenceTopicLabel } from '../../../i18n/preferenceLabels';
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
  const { t } = useTranslation('onboarding');
  const { t: tp } = useTranslation('preferences');
  const remaining = Math.max(0, minSelected - selected.length);
  const reachedMin = selected.length >= minSelected;

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <header className="flex items-start gap-3">
        <div className="p-2 bg-primary-soft rounded-lg text-primary">
          <Sparkles className="w-5 h-5" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-primary-dark dark:text-text">{t('interests.title')}</h2>
          <p className="text-sm text-text-muted mt-0.5">
            <Trans
              i18nKey="interests.description"
              ns="onboarding"
              values={{ count: minSelected }}
              components={{ strong: <span className="font-bold text-primary" /> }}
            />
          </p>
        </div>
      </header>

      <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-surface-muted border border-border">
        <span className="text-xs font-bold text-text-muted">
          {t('interests.selected', { selected: selected.length, min: minSelected, count: selected.length })}
        </span>
        <span
          className={`text-[10px] font-bold uppercase tracking-widest ${
            reachedMin ? 'text-success-strong' : 'text-text-subtle'
          }`}
        >
          {reachedMin ? t('interests.done') : t('interests.missing', { count: remaining })}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {topics.map((topic) => {
          const Icon = TOPIC_ICONS[topic.id] || Globe;
          return (
            <InterestCard
              key={topic.id}
              icon={Icon}
              label={preferenceTopicLabel(topic, tp)}
              description={preferenceTopicDescription(topic, tp)}
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
