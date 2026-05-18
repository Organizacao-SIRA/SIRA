import { UserAvatar } from './UserAvatar';

interface UserProfileChipProps {
  name: string;
  onClick: () => void;
}

export const UserProfileChip = ({ name, onClick }: UserProfileChipProps) => (
  <button
    onClick={onClick}
    aria-label="Ir para o perfil"
    className="flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-full pl-1.5 pr-3.5 py-1.5 transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 active:opacity-75"
  >
    <UserAvatar name={name} size="sm" />
    <span className="hidden sm:block text-sm font-semibold text-white max-w-[130px] truncate">{name}</span>
  </button>
);
