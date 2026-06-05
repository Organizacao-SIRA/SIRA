import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

type UseClipboardOptions = {
  resetAfterMs?: number;
};

export const useClipboard = ({ resetAfterMs = 2000 }: UseClipboardOptions = {}) => {
  const { t } = useTranslation('common');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const copy = useCallback(async (value: string) => {
    try {
      if (!navigator?.clipboard) {
        throw new Error(t('errors.clipboardUnavailable'));
      }
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setError(null);
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setCopied(false), resetAfterMs);
      return true;
    } catch (err: unknown) {
      setCopied(false);
      const message = err instanceof Error ? err.message : t('errors.clipboardCopy');
      setError(message);
      return false;
    }
  }, [resetAfterMs, t]);

  return { copied, error, copy };
};
