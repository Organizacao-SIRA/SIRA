import { useEffect, useState, useCallback } from 'react';

export type ViewMode = 'horizontal' | 'vertical';

const STORAGE_KEY = '@sira:viewMode';

const readStored = (fallback: ViewMode): ViewMode => {
  if (typeof window === 'undefined') return fallback;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === 'horizontal' || stored === 'vertical' ? stored : fallback;
};

export const useViewMode = (defaultMode: ViewMode = 'horizontal') => {
  const [mode, setMode] = useState<ViewMode>(() => readStored(defaultMode));

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const toggle = useCallback(() => {
    setMode(m => (m === 'horizontal' ? 'vertical' : 'horizontal'));
  }, []);

  return { mode, setMode, toggle };
};
