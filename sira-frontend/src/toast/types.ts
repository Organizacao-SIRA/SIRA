export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  variant: ToastVariant;
  message: string;
  /** Duração em ms até o auto-dismiss. `null` = fixo (não some sozinho). */
  duration: number | null;
}

export interface ToastOptions {
  duration?: number | null;
}
