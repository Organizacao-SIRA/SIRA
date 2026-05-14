import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorState = ({
  title = 'Ocorreu um erro',
  message = 'Não foi possível carregar os dados. Por favor, tente novamente mais tarde.',
  onRetry,
  className = '',
}: ErrorStateProps) => {
  return (
    <div className={`w-full flex flex-col items-center justify-center p-8 text-center bg-danger-soft rounded-2xl border border-danger-border ${className}`}>
      <div className="w-14 h-14 text-danger-strong mb-4 flex items-center justify-center">
        <AlertTriangle className="w-full h-full" />
      </div>
      <h3 className="text-xl font-bold text-danger-strong mb-2">{title}</h3>
      <p className="text-sm text-danger-strong max-w-md mb-6 leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <Button variant="danger" onClick={onRetry} className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Tentar Novamente
        </Button>
      )}
    </div>
  );
};
