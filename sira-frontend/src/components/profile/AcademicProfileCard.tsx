import { GraduationCap, Target } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { SectionCard } from './SectionCard';
import type { PreferenceTopic } from '../../types';

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
  onChange: (field: string, value: string) => void;
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
}: AcademicProfileCardProps) => (
  <SectionCard icon={GraduationCap} title="Perfil Acadêmico" className="h-full">
    <div className="space-y-4">
      <Row label="Curso">
        {isEditing
          ? <Input value={editData.course} onChange={(e) => onChange('course', e.target.value)} />
          : <span className="text-text font-bold break-words">{data.course}</span>
        }
      </Row>

      <Row label="Nível">
        {isEditing ? (
          <Select
            value={editData.educationLevel}
            onChange={(e) => onChange('educationLevel', e.target.value)}
            options={educationLevelsList.map(l => ({ value: l, label: l }))}
          />
        ) : (
          <span className="text-text font-bold">{data.educationLevel}</span>
        )}
      </Row>

      <Row label="Área">
        {isEditing ? (
          <Select
            value={editData.mainArea}
            onChange={(e) => onChange('mainArea', e.target.value)}
            options={[
              { value: '', label: 'Selecione a área' },
              ...topicsList.map(t => ({ value: t.id, label: t.label })),
            ]}
          />
        ) : (
          <span className="text-text font-bold break-words">
            {topicsList.find(t => t.id === data.mainArea)?.label || data.mainArea}
          </span>
        )}
      </Row>

      <Row label="Objetivo">
        {isEditing ? (
          <Select
            value={editData.academicGoal || ''}
            onChange={(e) => onChange('academicGoal', e.target.value)}
            options={[
              { value: '', label: 'Não informado' },
              ...academicGoalsList.map(g => ({ value: g, label: g })),
            ]}
          />
        ) : (
          <span className="text-text font-bold flex items-center gap-1.5 break-words">
            <Target className="w-3.5 h-3.5 text-text-subtle flex-shrink-0" />
            {data.academicGoal || 'Não informado'}
          </span>
        )}
      </Row>
    </div>
  </SectionCard>
);
