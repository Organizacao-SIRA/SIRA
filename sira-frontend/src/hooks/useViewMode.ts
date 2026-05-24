import { useEffect, useState, useCallback } from 'react';

export type ViewMode = 'horizontal' | 'vertical';

const storageKeyFor = (scope: string) => `@sira:viewMode:${scope}`;

const readStored = (scope: string, fallback: ViewMode): ViewMode => {
  if (typeof window === 'undefined') return fallback;
  const stored = window.localStorage.getItem(storageKeyFor(scope));
  return stored === 'horizontal' || stored === 'vertical' ? stored : fallback;
};

export const useViewMode = (scope: string, defaultMode: ViewMode = 'horizontal') => {
  const [mode, setMode] = useState<ViewMode>(() => readStored(scope, defaultMode));

  useEffect(() => {
    window.localStorage.setItem(storageKeyFor(scope), mode);
  }, [scope, mode]);

  const toggle = useCallback(() => {
    setMode(m => (m === 'horizontal' ? 'vertical' : 'horizontal'));
  }, []);

  return { mode, setMode, toggle };
};
