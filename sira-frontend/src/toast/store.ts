import type { Toast, ToastOptions, ToastVariant } from './types';

/**
 * Store singleton de toasts — vive FORA do React.
 *
 * Permite disparar `toast.error()` de qualquer lugar (componentes, hooks e
 * código não-React como o `services/api.ts`). O React consome via
 * `useSyncExternalStore` no `<Toaster/>`.
 */

const MAX_VISIBLE = 4;

const DEFAULT_DURATION: Record<ToastVariant, number | null> = {
  success: 3000,
  info: 3000,
  warning: 3000,
  error: 5000,
};

let toasts: Toast[] = [];
const listeners = new Set<() => void>();
const timers = new Map<string, ReturnType<typeof setTimeout>>();

const emit = (): void => {
  for (const listener of listeners) listener();
};

const subscribe = (listener: () => void): (() => void) => {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
};

// Retorna a mesma referência enquanto o estado não muda — requisito do
// useSyncExternalStore para não entrar em loop de re-render.
const getSnapshot = (): Toast[] => toasts;

const clearTimer = (id: string): void => {
  const timer = timers.get(id);
  if (timer) {
    clearTimeout(timer);
    timers.delete(id);
  }
};

const dismiss = (id: string): void => {
  clearTimer(id);
  toasts = toasts.filter((t) => t.id !== id);
  emit();
};

const show = (variant: ToastVariant, message: string, options: ToastOptions = {}): string => {
  // Dedup: ignora se for idêntico ao último toast visível (evita spam em double-submit).
  const last = toasts[toasts.length - 1];
  if (last && last.variant === variant && last.message === message) {
    return last.id;
  }

  const id = crypto.randomUUID();
  const duration = options.duration !== undefined ? options.duration : DEFAULT_DURATION[variant];

  let next = [...toasts, { id, variant, message, duration }];

  // Cap de visíveis: descarta o(s) mais antigo(s), limpando seus timers.
  while (next.length > MAX_VISIBLE) {
    clearTimer(next[0].id);
    next = next.slice(1);
  }

  toasts = next;
  emit();

  if (duration !== null) {
    timers.set(id, setTimeout(() => dismiss(id), duration));
  }

  return id;
};

/** Consumido pelo `<Toaster/>` via useSyncExternalStore. */
export const toastStore = { subscribe, getSnapshot, dismiss };

/** API imperativa importável de qualquer lugar. */
export const toast = {
  success: (message: string, options?: ToastOptions) => show('success', message, options),
  error: (message: string, options?: ToastOptions) => show('error', message, options),
  warning: (message: string, options?: ToastOptions) => show('warning', message, options),
  info: (message: string, options?: ToastOptions) => show('info', message, options),
  dismiss,
};
