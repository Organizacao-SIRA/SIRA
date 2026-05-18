import { useState, useEffect } from 'react';

interface UserAvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const AVATAR_COLORS = [
  { bg: 'bg-blue-500',    text: 'text-white' },
  { bg: 'bg-violet-500',  text: 'text-white' },
  { bg: 'bg-emerald-500', text: 'text-white' },
  { bg: 'bg-amber-400',   text: 'text-white' },
  { bg: 'bg-rose-500',    text: 'text-white' },
  { bg: 'bg-cyan-500',    text: 'text-white' },
  { bg: 'bg-pink-500',    text: 'text-white' },
];

const getAvatarColor = (name: string) => {
  const code = (name || '?').charCodeAt(0);
  return AVATAR_COLORS[code % AVATAR_COLORS.length];
};

const sizes = {
  sm: { container: 'w-7 h-7',  text: 'text-xs'  },
  md: { container: 'w-10 h-10', text: 'text-sm'  },
  lg: { container: 'w-20 h-20', text: 'text-3xl' },
  xl: { container: 'w-28 h-28', text: 'text-4xl' },
};

export const UserAvatar = ({ name, imageUrl, size = 'md', className = '' }: UserAvatarProps) => {
  const letter = (name || '?').charAt(0).toUpperCase();
  const { container, text } = sizes[size];
  const color = getAvatarColor(name);
  const [hasErrored, setHasErrored] = useState(false);

  useEffect(() => {
    setHasErrored(false);
  }, [imageUrl]);

  const showImage = !!imageUrl && !hasErrored;

  return (
    <div className={`${container} rounded-full flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden ${showImage ? 'bg-surface-muted' : color.bg} ${className}`}>
      {showImage ? (
        <img
          src={imageUrl!}
          alt={`Foto de perfil de ${name || 'usuário'}`}
          className="w-full h-full object-cover"
          onError={() => setHasErrored(true)}
        />
      ) : (
        <span className={`${text} font-black ${color.text} leading-none`}>{letter}</span>
      )}
    </div>
  );
};
