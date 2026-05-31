import { Camera } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UserAvatar } from '../ui/UserAvatar';

interface ProfileAvatarProps {
  name: string;
  avatarUrl: string | null;
  onChangeRequest: () => void;
}

export const ProfileAvatar = ({ name, avatarUrl, onChangeRequest }: ProfileAvatarProps) => {
  const { t } = useTranslation('profile');

  return (
    <div className="relative inline-block">
      <UserAvatar name={name} imageUrl={avatarUrl} size="xl" className="ring-4 ring-surface" />
      <button
        type="button"
        onClick={onChangeRequest}
        aria-label={t('avatar.changePhoto')}
        title={t('avatar.changeTitle')}
        className="absolute -bottom-1 -right-1 bg-primary hover:bg-primary-dark text-white p-2.5 rounded-full shadow-md border-2 border-surface transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:opacity-80"
      >
        <Camera className="w-4 h-4" />
      </button>
    </div>
  );
};
