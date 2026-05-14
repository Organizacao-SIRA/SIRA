interface UserAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizes = {
  sm: { container: 'w-7 h-7', text: 'text-xs' },
  md: { container: 'w-10 h-10', text: 'text-sm' },
  lg: { container: 'w-20 h-20', text: 'text-3xl' },
};

export const UserAvatar = ({ name, size = 'md', className = '' }: UserAvatarProps) => {
  const letter = (name || '?').charAt(0).toUpperCase();
  const { container, text } = sizes[size];

  return (
    <div className={`${container} rounded-full bg-accent flex items-center justify-center flex-shrink-0 shadow-sm ${className}`}>
      <span className={`${text} font-black text-accent-dark leading-none`}>{letter}</span>
    </div>
  );
};
