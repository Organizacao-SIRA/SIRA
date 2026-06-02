import { CheckCircle, AlertCircle, AlertTriangle, Info, X, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Toast as ToastData, ToastVariant } from './types';

// Reaproveita os tokens do design system (mesmo padrão do StatusBadge).
// `error` mapeia para os tokens `danger`. As três camadas (borda / tint / texto)
// são separadas porque o toast flutua sobre o conteúdo: a tonalidade `*-soft`
// (translúcida no dark) é aplicada SOBRE uma base opaca `bg-surface`, evitando
// que o fundo vaze através do toast.
const variantBorder: Record<ToastVariant, string> = {
  success: 'border-success-border',
  error: 'border-danger-border',
  warning: 'border-warning-border',
  info: 'border-info-border',
};

const variantTint: Record<ToastVariant, string> = {
  success: 'bg-success-soft',
  error: 'bg-danger-soft',
  warning: 'bg-warning-soft',
  info: 'bg-info-soft',
};

const variantText: Record<ToastVariant, string> = {
  success: 'text-success-strong',
  error: 'text-danger-strong',
  warning: 'text-warning-strong',
  info: 'text-info-strong',
};

const variantIcon: Record<ToastVariant, LucideIcon> = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

export const Toast = ({ toast, onDismiss }: ToastProps) => {
  const { t } = useTranslation('common');
  const Icon = variantIcon[toast.variant];
  const isError = toast.variant === 'error';

  return (
    <div
      role={isError ? 'alert' : 'status'}
      aria-live={isError ? 'assertive' : 'polite'}
      className={`pointer-events-auto relative overflow-hidden rounded-xl border shadow-lg animate-toast-in motion-reduce:animate-none ${variantBorder[toast.variant]}`}
    >
      {/* Base opaca + tonalidade da variante por cima (evita vazamento do fundo) */}
      <div className="absolute inset-0 bg-surface" aria-hidden="true" />
      <div className={`absolute inset-0 ${variantTint[toast.variant]}`} aria-hidden="true" />

      <div className={`relative flex items-start gap-3 p-3.5 ${variantText[toast.variant]}`}>
        <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
        <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label={t('actions.close')}
          className="flex-shrink-0 -mr-1 -mt-1 p-1 rounded-lg opacity-70 hover:opacity-100 transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-current"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
