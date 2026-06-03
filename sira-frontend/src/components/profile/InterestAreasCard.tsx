import { School, CheckCircle2, Globe, Cpu, Landmark, Scale, LineChart, GraduationCap, Activity, TrendingUp, Users } from 'lucide-react';
import type { ElementType } from 'react';
import { useTranslation } from 'react-i18next';
import { SectionCard } from './SectionCard';
import { preferenceTopicDescription, preferenceTopicLabel } from '../../i18n/preferenceLabels';
import type { PreferenceTopic } from '../../types';

const TOPIC_ICONS: Record<string, ElementType> = {
  ia:  Cpu,
  gp:  Landmark,
  dir: Scale,
  cd:  LineChart,
  edu: GraduationCap,
  sau: Activity,
  eco: TrendingUp,
  soc: Users,
  amb: Globe,
};

interface InterestAreasCardProps {
  isEditing: boolean;
  topicsList: PreferenceTopic[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export const InterestAreasCard = ({ isEditing, topicsList, selectedIds, onToggle }: InterestAreasCardProps) => {
  const { t } = useTranslation('profile');
  const { t: tp } = useTranslation('preferences');

  return (
    <SectionCard icon={School} title={t('sections.interests')}>
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {topicsList.map((topic) => {
        const Icon = TOPIC_ICONS[topic.id] || Globe;
        const isSelected = selectedIds.includes(topic.id);

        return (
          <button
            key={topic.id}
            onClick={() => isEditing && onToggle(topic.id)}
            disabled={!isEditing}
            aria-pressed={isSelected}
            className={`relative p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 active:scale-[0.97] ${
              isSelected
                ? 'border-selected-border bg-selected text-link shadow-sm'
                : 'border-border bg-surface-muted text-text-muted'
            } ${isEditing ? 'cursor-pointer hover:border-link hover:bg-primary-soft shadow-sm' : 'cursor-default'}`}
            title={preferenceTopicDescription(topic, tp)}
          >
            {isSelected && (
              <CheckCircle2 className="absolute top-2 right-2 w-4 h-4 text-link" />
            )}
            <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-link' : 'text-text-subtle dark:text-text-muted'}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-link' : 'text-text-muted'}`}>
              {preferenceTopicLabel(topic, tp)}
            </span>
          </button>
        );
      })}
    </div>
    </SectionCard>
  );
};
