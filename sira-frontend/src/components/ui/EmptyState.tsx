import React from 'react';
import { PackageOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './Button';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({
  title,
  description,
  icon,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) => {
  const { t } = useTranslation('common');
  const resolvedTitle = title ?? t('states.emptyTitle');
  const resolvedDescription = description ?? t('states.emptyDescription');

  return (
    <div className={`w-full flex flex-col items-center justify-center p-8 text-center bg-surface rounded-2xl border-2 border-dashed border-border-strong ${className}`}>
      <div className="w-16 h-16 text-text-subtle mb-4 flex items-center justify-center">
        {icon || <PackageOpen className="w-full h-full" />}
      </div>
      <h3 className="text-lg font-bold text-text-muted uppercase tracking-wide mb-2">{resolvedTitle}</h3>
      <p className="text-sm text-text-subtle max-w-sm mb-6 leading-relaxed">
        {resolvedDescription}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
