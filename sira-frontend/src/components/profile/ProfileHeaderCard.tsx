import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
}: ProfileHeaderCardProps) => {
  const { t } = useTranslation('profile');

  return (
    <div className="bg-surface p-5 sm:p-6 rounded-2xl border border-border shadow-sm flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5">
    <ProfileAvatar
      name={name}
      avatarUrl={resolveAvatarUrl(avatarUrl)}
      onChangeRequest={onAvatarChangeRequest}
    />
    <div className="flex-1 min-w-0 text-center sm:text-left w-full">
      <h2 className="text-xl sm:text-2xl font-bold text-primary-dark dark:text-text truncate">{name}</h2>
      <p className="text-text-muted text-sm truncate">{email}</p>
    </div>
    {hasCompletedOnboarding ? (
      <StatusBadge variant="success" icon={<ShieldCheck className="w-4 h-4" />} className="rounded-full px-4 py-2 text-xs flex-shrink-0">
        {t('status.completed')}
      </StatusBadge>
    ) : (
      <StatusBadge variant="warning" icon={<AlertTriangle className="w-4 h-4" />} className="rounded-full px-4 py-2 text-xs flex-shrink-0">
        {t('status.pending')}
      </StatusBadge>
    )}
    </div>
  );
};
