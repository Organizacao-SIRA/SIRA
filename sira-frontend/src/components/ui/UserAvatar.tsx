import { useState } from 'react';
import { useTranslation } from 'react-i18next';

interface UserAvatarProps {
  name: string;
  imageUrl?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const AVATAR_COLORS = [
  'border-sky-200 bg-sky-100 text-sky-800 dark:border-sky-400/30 dark:bg-sky-500/20 dark:text-sky-100',
  'border-violet-200 bg-violet-100 text-violet-800 dark:border-violet-400/30 dark:bg-violet-500/20 dark:text-violet-100',
  'border-emerald-200 bg-emerald-100 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-500/20 dark:text-emerald-100',
  'border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-400/30 dark:bg-amber-500/20 dark:text-amber-100',
  'border-rose-200 bg-rose-100 text-rose-800 dark:border-rose-400/30 dark:bg-rose-500/20 dark:text-rose-100',
  'border-cyan-200 bg-cyan-100 text-cyan-800 dark:border-cyan-400/30 dark:bg-cyan-500/20 dark:text-cyan-100',
  'border-pink-200 bg-pink-100 text-pink-800 dark:border-pink-400/30 dark:bg-pink-500/20 dark:text-pink-100',
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
  const { t } = useTranslation('common');
  const letter = (name || '?').charAt(0).toUpperCase();
  const { container, text } = sizes[size];
  const color = getAvatarColor(name);
  const [failedImageUrl, setFailedImageUrl] = useState<string | null>(null);

  const showImage = !!imageUrl && failedImageUrl !== imageUrl;

  return (
    <div className={`${container} rounded-full border flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden ${showImage ? 'border-border bg-surface-muted' : color} ${className}`}>
      {showImage ? (
        <img
          src={imageUrl!}
          alt={t('avatar.imageAlt', { name: name || t('avatar.fallbackName') })}
          className="w-full h-full object-cover"
          onError={() => setFailedImageUrl(imageUrl)}
        />
      ) : (
        <span className={`${text} font-black leading-none`}>{letter}</span>
      )}
    </div>
  );
};
