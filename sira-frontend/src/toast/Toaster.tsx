import { useSyncExternalStore } from 'react';
import { createPortal } from 'react-dom';
import { toastStore } from './store';
import { Toast } from './Toast';

/**
 * Única ponte entre o store externo e o React.
 *
 * Renderiza via Portal em `document.body` — decisão-chave: vários contêineres
 * usam `overflow-hidden` (ex.: AuthFormCard) e ancestrais com `transform`, que
 * recortariam um toast inline. O portal escapa isso e garante posição global.
 */
export const Toaster = () => {
  const toasts = useSyncExternalStore(toastStore.subscribe, toastStore.getSnapshot);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div className="pointer-events-none fixed top-4 left-1/2 z-[100] flex w-full max-w-sm -translate-x-1/2 flex-col gap-2 px-4">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={toastStore.dismiss} />
      ))}
    </div>,
    document.body,
  );
};
