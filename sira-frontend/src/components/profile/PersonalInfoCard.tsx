import { User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Input } from '../ui/Input';
import { SectionCard } from './SectionCard';

interface PersonalInfoCardProps {
  isEditing: boolean;
  name: string;
  email: string;
  editName: string;
  onChangeName: (value: string) => void;
}

export const PersonalInfoCard = ({ isEditing, name, email, editName, onChangeName }: PersonalInfoCardProps) => {
  const { t } = useTranslation('profile');

  return (
    <SectionCard icon={UserIcon} title={t('sections.personal')} className="h-full">
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] sm:items-center text-sm border-b border-border pb-3 gap-1 sm:gap-3 sm:min-h-[44px]">
        <span className="text-text-muted">{t('fields.name')}</span>
        {isEditing
          ? <Input value={editName} onChange={(e) => onChangeName(e.target.value)} />
          : <span className="text-text font-bold break-words">{name}</span>
        }
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] sm:items-center text-sm gap-1 sm:gap-3 sm:min-h-[44px]">
        <span className="text-text-muted">{t('fields.email')}</span>
        <span className="text-text text-sm break-all">{email}</span>
      </div>
    </div>
  </SectionCard>
  );
};
