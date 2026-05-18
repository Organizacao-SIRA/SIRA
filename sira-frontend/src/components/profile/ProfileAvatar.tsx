import { Camera } from 'lucide-react';
import { UserAvatar } from '../ui/UserAvatar';

interface ProfileAvatarProps {
  name: string;
  avatarUrl: string | null;
  onChangeRequest: () => void;
}

export const ProfileAvatar = ({ name, avatarUrl, onChangeRequest }: ProfileAvatarProps) => (
  <div className="relative inline-block">
    <UserAvatar name={name} imageUrl={avatarUrl} size="xl" className="ring-4 ring-surface" />
    <button
      type="button"
      onClick={onChangeRequest}
      aria-label="Alterar foto de perfil"
      title="Alterar foto"
      className="absolute -bottom-1 -right-1 bg-primary hover:bg-primary-dark text-white p-2.5 rounded-full shadow-md border-2 border-surface transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 active:opacity-80"
    >
      <Camera className="w-4 h-4" />
    </button>
  </div>
);
