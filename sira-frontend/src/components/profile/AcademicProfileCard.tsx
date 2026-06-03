import { GraduationCap, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { SectionCard } from './SectionCard';
import { preferenceTopicLabel, preferenceValueLabel } from '../../i18n/preferenceLabels';
import type { PreferenceTopic } from '../../types';

type AcademicProfileField = 'course' | 'educationLevel' | 'mainArea' | 'academicGoal';

interface AcademicProfileCardProps {
  isEditing: boolean;
  data: {
    course: string;
    educationLevel: string;
    mainArea: string;
    academicGoal: string;
  };
  editData: {
    course: string;
    educationLevel: string;
    mainArea: string;
    academicGoal: string;
  };
  onChange: (field: AcademicProfileField, value: string) => void;
  topicsList: PreferenceTopic[];
  educationLevelsList: string[];
  academicGoalsList: string[];
}

const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] sm:items-center text-sm border-b border-border pb-3 last:border-b-0 last:pb-0 gap-1 sm:gap-3 sm:min-h-[44px]">
    <span className="text-text-muted">{label}</span>
    {children}
  </div>
);

export const AcademicProfileCard = ({
  isEditing,
  data,
  editData,
  onChange,
  topicsList,
  educationLevelsList,
  academicGoalsList,
}: AcademicProfileCardProps) => {
  const { t } = useTranslation('profile');
  const { t: tp } = useTranslation('preferences');
  const selectedTopic = topicsList.find(topic => topic.id === data.mainArea);

  return (
    <SectionCard icon={GraduationCap} title={t('sections.academic')} className="h-full">
    <div className="space-y-4">
      <Row label={t('fields.course')}>
        {isEditing
          ? <Input value={editData.course} onChange={(e) => onChange('course', e.target.value)} />
          : <span className="text-text font-bold break-words">{data.course}</span>
        }
      </Row>

      <Row label={t('fields.level')}>
        {isEditing ? (
          <Select
            value={editData.educationLevel}
            onChange={(e) => onChange('educationLevel', e.target.value)}
            options={educationLevelsList.map(l => ({ value: l, label: preferenceValueLabel(l, tp) }))}
          />
        ) : (
          <span className="text-text font-bold">{preferenceValueLabel(data.educationLevel, tp)}</span>
        )}
      </Row>

      <Row label={t('fields.area')}>
        {isEditing ? (
          <Select
            value={editData.mainArea}
            onChange={(e) => onChange('mainArea', e.target.value)}
            options={[
              { value: '', label: t('values.selectArea') },
              ...topicsList.map(topic => ({ value: topic.id, label: preferenceTopicLabel(topic, tp) })),
            ]}
          />
        ) : (
          <span className="text-text font-bold break-words">
            {selectedTopic ? preferenceTopicLabel(selectedTopic, tp) : data.mainArea}
          </span>
        )}
      </Row>

      <Row label={t('fields.objective')}>
        {isEditing ? (
          <Select
            value={editData.academicGoal || ''}
            onChange={(e) => onChange('academicGoal', e.target.value)}
            options={[
              { value: '', label: t('values.notInformed') },
              ...academicGoalsList.map(g => ({ value: g, label: preferenceValueLabel(g, tp) })),
            ]}
          />
        ) : (
          <span className="text-text font-bold flex items-center gap-1.5 break-words">
            <Target className="w-3.5 h-3.5 text-text-subtle flex-shrink-0" />
            {data.academicGoal ? preferenceValueLabel(data.academicGoal, tp) : t('values.notInformed')}
          </span>
        )}
      </Row>
    </div>
    </SectionCard>
  );
};
