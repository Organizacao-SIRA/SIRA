import React, { type ButtonHTMLAttributes } from 'react';
import { Spinner } from './Spinner';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
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
  const baseClasses = 'inline-flex items-center justify-center font-bold transition-all rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white shadow-md focus:ring-primary border border-transparent',
    secondary: 'bg-surface hover:bg-surface-muted text-primary border border-border-strong focus:ring-border-strong',
    ghost: 'bg-transparent hover:bg-primary-soft text-primary border border-transparent focus:ring-primary-soft',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-600 border border-transparent',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  // Se 'p-' ou 'w-' ou 'h-' estiver presente no className, assumimos que o desenvolvedor quer controle total do tamanho/espaçamento
  const hasCustomSizing = className.includes('p-') || (className.includes('w-') && className.includes('h-'));
  const sizeClass = hasCustomSizing ? '' : sizes[size];

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizeClass} ${className}`}
      disabled={isLoading || disabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && (
        <span className={children ? "mr-2 flex items-center" : "flex items-center"}>
            <Spinner size="sm" className="text-current" />
        </span>
      )}
      {children}
    </button>
  );
};
