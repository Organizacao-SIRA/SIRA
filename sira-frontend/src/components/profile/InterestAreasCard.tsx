import { useId, useMemo, useState } from 'react';
import { School, Globe, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from './SectionCard';
import { InterestCard } from '../ui/InterestCard';
import { TOPIC_ICONS } from '../../constants/topicIcons';
import { preferenceTopicDescription, preferenceTopicLabel } from '../../i18n/preferenceLabels';
import type { PreferenceTopic } from '../../types';

/** Quantas áreas aparecem no estado colapsado (~2 linhas no desktop). */
const COLLAPSED_COUNT = 10;

interface InterestAreasCardProps {
  isEditing: boolean;
  topicsList: PreferenceTopic[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export const InterestAreasCard = ({ isEditing, topicsList, selectedIds, onToggle }: InterestAreasCardProps) => {
  const { t } = useTranslation('profile');
  const { t: tp } = useTranslation('preferences');
  const [expanded, setExpanded] = useState(false);
  const gridId = useId();

  // Colapsado: mostra as primeiras N áreas + as que já estão selecionadas — assim
  // uma escolha do usuário nunca fica escondida atrás do "ver mais".
  const visibleTopics = useMemo(() => {
    if (expanded) return topicsList;
    return topicsList.filter(
      (topic, index) => index < COLLAPSED_COUNT || selectedIds.includes(topic.id),
    );
  }, [expanded, topicsList, selectedIds]);

  const hiddenCount = topicsList.length - visibleTopics.length;
  const showToggle = expanded || hiddenCount > 0;

  return (
    <SectionCard icon={School} title={t('sections.interests')}>
    <div id={gridId} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {visibleTopics.map((topic) => (
        <InterestCard
          key={topic.id}
          icon={TOPIC_ICONS[topic.id] || Globe}
          label={preferenceTopicLabel(topic, tp)}
          description={preferenceTopicDescription(topic, tp)}
          selected={selectedIds.includes(topic.id)}
          onToggle={() => onToggle(topic.id)}
          disabled={!isEditing}
        />
      ))}
    </div>

    {showToggle && (
      <div className="mt-4 flex justify-center">
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          aria-controls={gridId}
          className="flex items-center gap-1.5 px-2 py-1 rounded-md text-sm font-semibold text-link cursor-pointer hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40"
        >
          {expanded ? t('actions.showLess') : t('actions.showMore', { count: hiddenCount })}
          <ChevronDown
            className={`w-4 h-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </div>
    )}
    </SectionCard>
  );
};
