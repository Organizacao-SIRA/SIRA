import React, { ButtonHTMLAttributes } from 'react';
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
  const baseClasses = 'inline-flex items-center justify-center font-bold transition-all rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer';
  
  const variants = {
    primary: 'bg-primary hover:bg-primary-dark text-white shadow-md focus:ring-primary border border-transparent',
    secondary: 'bg-white hover:bg-gray-50 text-primary border border-gray-200 focus:ring-gray-200',
    ghost: 'bg-transparent hover:bg-blue-50 text-primary border border-transparent focus:ring-blue-50',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-sm focus:ring-red-600 border border-transparent',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-2.5 text-sm',
    lg: 'px-8 py-3 text-base',
  };

  return (
    <button
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading && (
        <span className="mr-2 flex items-center">
            <Spinner size="sm" className="text-current" />
        </span>
      )}
      {children}
    </button>
  );
};
