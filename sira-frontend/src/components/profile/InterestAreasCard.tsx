import { School, CheckCircle2, Globe, Cpu, Landmark, Scale, LineChart, GraduationCap, Activity, TrendingUp, Users } from 'lucide-react';
import type { ElementType } from 'react';
import { SectionCard } from './SectionCard';
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

export const InterestAreasCard = ({ isEditing, topicsList, selectedIds, onToggle }: InterestAreasCardProps) => (
  <SectionCard icon={School} title="Áreas de Interesse">
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
            className={`relative p-4 rounded-xl border-2 flex flex-col items-center justify-center text-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-[0.97] ${
              isSelected
                ? 'border-primary bg-primary text-white shadow-sm'
                : 'border-border bg-surface-muted text-text-muted'
            } ${isEditing ? 'cursor-pointer hover:border-primary hover:bg-primary/10 shadow-sm' : 'cursor-default'}`}
            title={topic.description}
          >
            {isSelected && (
              <CheckCircle2 className={`absolute top-2 right-2 w-4 h-4 ${isEditing ? 'text-white/80' : 'text-white/60'}`} />
            )}
            <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-white' : 'text-text-subtle dark:text-text-muted'}`} />
            <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-white' : 'text-text-muted'}`}>
              {topic.label}
            </span>
          </button>
        );
      })}
    </div>
  </SectionCard>
);
