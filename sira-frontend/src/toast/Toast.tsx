import { CheckCircle, AlertCircle, AlertTriangle, Info, X, type LucideIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { Toast as ToastData, ToastVariant } from './types';

// Toasts usam uma superfície neutra do tema. A variante aparece como acento
// lateral e chip de ícone, evitando cards inteiros muito coloridos no dark mode.
const variantAccent: Record<ToastVariant, string> = {
  success: 'border-l-success-strong',
  error: 'border-l-danger-strong',
  warning: 'border-l-warning-strong',
  info: 'border-l-info-strong',
};

const variantIconTone: Record<ToastVariant, string> = {
  success: 'border-success-border bg-success-soft text-success-strong',
  error: 'border-danger-border bg-danger-soft text-danger-strong',
  warning: 'border-warning-border bg-warning-soft text-warning-strong',
  info: 'border-info-border bg-info-soft text-info-strong',
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
      className={`pointer-events-auto overflow-hidden rounded-xl border border-l-4 border-border-strong bg-surface text-text shadow-[0_18px_45px_rgba(15,23,42,0.18)] animate-toast-in motion-reduce:animate-none dark:shadow-[0_18px_60px_rgba(0,0,0,0.45)] ${variantAccent[toast.variant]}`}
    >
      <div className="flex items-start gap-3 p-3.5">
        <span className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border ${variantIconTone[toast.variant]}`}>
          <Icon className="h-4.5 w-4.5" />
        </span>
        <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          aria-label={t('actions.close')}
          className="flex-shrink-0 -mr-1 -mt-1 rounded-lg p-1 text-text-muted transition-colors hover:bg-surface-subtle hover:text-text cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/60"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
