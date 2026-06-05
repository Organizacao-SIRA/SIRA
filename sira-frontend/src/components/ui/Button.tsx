import { type ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'navbarAction';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  ...props
}: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 rounded-full cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/60 focus-visible:ring-offset-1 focus-visible:ring-offset-surface disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]';

  const variants = {
    primary:      'bg-primary hover:bg-primary-dark text-white shadow-sm border border-transparent',
    secondary:    'bg-surface hover:bg-surface-muted text-link hover:text-link-hover border border-border-strong',
    outline:      'bg-transparent hover:bg-primary-soft text-link hover:text-link-hover border border-link',
    ghost:        'bg-transparent hover:bg-primary-soft text-link hover:text-link-hover border border-transparent',
    danger:       'bg-danger-fill hover:bg-danger-fill-hover text-white shadow-sm border border-transparent',
    navbarAction: 'bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border border-white/20 hover:border-white/40 focus-visible:ring-white/50',
  };

  const sizes = {
    sm:   'px-4 py-2 text-sm',
    md:   'px-6 py-2.5 text-base',
    lg:   'px-8 py-3 text-lg',
    icon: 'w-9 h-9',
  };

  const hasCustomSizing = /\b(p|px|py|pt|pb|pl|pr)-/.test(className) || (/\bw-/.test(className) && /\bh-/.test(className));
  const sizeClass = hasCustomSizing ? '' : sizes[size];

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizeClass} ${className}`}
      disabled={isLoading || disabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" className="text-current" />}
      {children}
    </button>
  );
};
