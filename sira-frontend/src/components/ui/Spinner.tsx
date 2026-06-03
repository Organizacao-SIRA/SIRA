import React from 'react';
import { useTranslation } from 'react-i18next';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
  className?: string;
}

export const Spinner = ({ size = 'md', fullScreen = false, className = '' }: SpinnerProps) => {
  const { t } = useTranslation('common');
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-2',
    lg: 'h-12 w-12 border-3',
  };

  // Por padrão o spinner usa a cor currentColor para se adaptar onde for colocado, 
  // mas adiciona a cor primary se nenhuma cor for herdada
  const spinnerElement = (
    <div 
      className={`animate-spin rounded-full border-transparent border-t-current border-r-current ${sizeClasses[size]} ${className}`}
      role="status"
      aria-label={t('states.loading')}
    >
      <span className="sr-only">{t('states.loadingEllipsis')}</span>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-surface/85 z-50 flex flex-col items-center justify-center text-link backdrop-blur-sm">
        {spinnerElement}
      </div>
    );
  }

  return (
    <div className={`text-link inline-flex ${className}`}>
       {spinnerElement}
    </div>
  );
};
