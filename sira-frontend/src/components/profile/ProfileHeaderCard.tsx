import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';
import { ProfileAvatar } from './ProfileAvatar';
import { resolveAvatarUrl } from '../../services/api';

interface ProfileHeaderCardProps {
  name: string;
  email: string;
  avatarUrl: string | null;
  hasCompletedOnboarding: boolean;
  onAvatarChangeRequest: () => void;
}

export const ProfileHeaderCard = ({
  name,
  email,
  avatarUrl,
  hasCompletedOnboarding,
  onAvatarChangeRequest,
}: ProfileHeaderCardProps) => (
  <div className="bg-surface p-6 rounded-2xl border border-border shadow-sm flex flex-col sm:flex-row items-center sm:items-center gap-5">
    <ProfileAvatar
      name={name}
      avatarUrl={resolveAvatarUrl(avatarUrl)}
      onChangeRequest={onAvatarChangeRequest}
    />
    <div className="flex-1 min-w-0 text-center sm:text-left">
      <h2 className="text-2xl font-bold text-primary-dark dark:text-text truncate">{name}</h2>
      <p className="text-text-muted text-sm truncate">{email}</p>
    </div>
    {hasCompletedOnboarding ? (
      <StatusBadge variant="success" icon={<ShieldCheck className="w-4 h-4" />} className="rounded-full px-4 py-2 text-xs">
        Preferências concluídas
      </StatusBadge>
    ) : (
      <StatusBadge variant="warning" icon={<AlertTriangle className="w-4 h-4" />} className="rounded-full px-4 py-2 text-xs">
        Preferências pendentes
      </StatusBadge>
    )}
  </div>
);
