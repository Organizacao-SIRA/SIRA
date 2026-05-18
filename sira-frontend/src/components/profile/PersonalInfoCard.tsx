import { User as UserIcon } from 'lucide-react';
import { Input } from '../ui/Input';
import { SectionCard } from './SectionCard';

interface PersonalInfoCardProps {
  isEditing: boolean;
  name: string;
  email: string;
  editName: string;
  onChangeName: (value: string) => void;
}

export const PersonalInfoCard = ({ isEditing, name, email, editName, onChangeName }: PersonalInfoCardProps) => (
  <SectionCard icon={UserIcon} title="Dados Pessoais" className="h-full">
    <div className="space-y-4">
      <div className="grid grid-cols-[120px_1fr] items-center text-sm border-b border-border pb-3 min-h-[44px]">
        <span className="text-text-muted">Nome</span>
        {isEditing
          ? <Input value={editName} onChange={(e) => onChangeName(e.target.value)} />
          : <span className="text-text font-bold">{name}</span>
        }
      </div>
      <div className="grid grid-cols-[120px_1fr] items-center text-sm min-h-[44px]">
        <span className="text-text-muted">E-mail</span>
        <span className="text-text text-sm">{email}</span>
      </div>
    </div>
  </SectionCard>
);
