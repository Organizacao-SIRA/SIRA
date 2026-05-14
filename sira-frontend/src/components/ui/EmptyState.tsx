import React from 'react';
import { PackageOpen } from 'lucide-react';
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
  title = 'Nenhum dado encontrado',
  description = 'Não há informações disponíveis para exibir neste momento.',
  icon,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) => {
  return (
    <div className={`w-full flex flex-col items-center justify-center p-8 text-center bg-surface rounded-2xl border-2 border-dashed border-border-strong ${className}`}>
      <div className="w-16 h-16 text-text-subtle mb-4 flex items-center justify-center">
        {icon || <PackageOpen className="w-full h-full" />}
      </div>
      <h3 className="text-lg font-bold text-text-muted uppercase tracking-wide mb-2">{title}</h3>
      <p className="text-sm text-text-subtle max-w-sm mb-6 leading-relaxed">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
