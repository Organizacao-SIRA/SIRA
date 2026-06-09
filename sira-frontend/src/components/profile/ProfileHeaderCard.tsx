import { ShieldCheck, AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
    <div className="sira-card p-5 sm:p-6 rounded-2xl flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-5">
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
      <span className="inline-flex items-center gap-2 flex-shrink-0 rounded-full border border-success-border bg-success-soft py-1 pl-1.5 pr-4">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-success text-white">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold text-success-strong">{t('status.completed')}</span>
      </span>
    ) : (
      <span className="inline-flex items-center gap-2 flex-shrink-0 rounded-full border border-warning-border bg-warning-soft py-1 pl-1.5 pr-4">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent text-primary-darker">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <span className="text-sm font-semibold text-warning-strong">{t('status.pending')}</span>
      </span>
    )}
    </div>
  );
};
