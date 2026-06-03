import { useTranslation } from 'react-i18next';
import { UserAvatar } from './UserAvatar';

interface UserProfileChipProps {
  name: string;
  avatarUrl?: string | null;
  onClick: () => void;
  onPrefetch?: () => void;
}

export const UserProfileChip = ({ name, avatarUrl, onClick, onPrefetch }: UserProfileChipProps) => {
  const { t } = useTranslation('navigation');

  return (
    <button
      onClick={onClick}
      onMouseEnter={onPrefetch}
      onFocus={onPrefetch}
      aria-label={t('user.goToProfile')}
      className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-full p-1 sm:pl-1.5 sm:pr-3.5 sm:py-1.5 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:opacity-75 min-w-0"
    >
      <UserAvatar name={name} imageUrl={avatarUrl} size="sm" />
      <span className="hidden sm:block text-sm font-semibold text-white max-w-[90px] md:max-w-[130px] truncate">{name}</span>
    </button>
  );
};
