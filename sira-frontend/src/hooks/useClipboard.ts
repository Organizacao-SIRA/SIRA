import { useCallback, useEffect, useRef, useState } from 'react';

type UseClipboardOptions = {
  resetAfterMs?: number;
};

export const useClipboard = ({ resetAfterMs = 2000 }: UseClipboardOptions = {}) => {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const copy = useCallback(async (value: string) => {
    try {
      if (!navigator?.clipboard) {
        throw new Error('Clipboard indisponível neste navegador.');
      }
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setError(null);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), resetAfterMs);
      return true;
    } catch (err: unknown) {
      setCopied(false);
      const message = err instanceof Error ? err.message : 'Falha ao copiar.';
      setError(message);
      return false;
    }
  }, [resetAfterMs]);

  return { copied, error, copy };
};
