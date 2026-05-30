import { useCallback, useEffect, type RefObject } from 'react';

export const useScreenScrollRestoration = (
  ref: RefObject<HTMLElement | null>,
  activeScreen: string,
  storageKeys: Record<string, string>,
) => {
  const saveScroll = useCallback((screen = activeScreen) => {
    const key = storageKeys[screen];
    if (!key || !ref.current) return;

    try {
      sessionStorage.setItem(key, String(ref.current.scrollTop));
    } catch {}
  }, [activeScreen, ref, storageKeys]);

  useEffect(() => {
    const key = storageKeys[activeScreen];
    if (!key) return;

    let savedY: string | null = null;
    try {
      savedY = sessionStorage.getItem(key);
    } catch {}
    if (!savedY || !ref.current) return;

    const nextScrollTop = parseInt(savedY, 10);
    if (!Number.isFinite(nextScrollTop)) return;

    requestAnimationFrame(() => {
      if (ref.current) ref.current.scrollTop = nextScrollTop;
    });
  }, [activeScreen, ref, storageKeys]);

  return saveScroll;
};
