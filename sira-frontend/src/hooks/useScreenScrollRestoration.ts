import { useCallback, useEffect, type RefObject } from 'react';

export const useScreenScrollRestoration = (
  ref: RefObject<HTMLElement | null>,
  activeScreen: string,
  storageKeys: Record<string, string>,
  resetScreens: string[] = [],
) => {
  const saveScroll = useCallback((screen = activeScreen) => {
    const key = storageKeys[screen];
    if (!key || !ref.current) return;

    try {
      sessionStorage.setItem(key, String(ref.current.scrollTop));
    } catch {
      // sessionStorage can be unavailable in private browsing modes.
    }
  }, [activeScreen, ref, storageKeys]);

  useEffect(() => {
    const key = storageKeys[activeScreen];
    if (!key) {
      if (!resetScreens.includes(activeScreen) || !ref.current) return;

      requestAnimationFrame(() => {
        if (ref.current) ref.current.scrollTop = 0;
      });
      return;
    }

    let savedY: string | null = null;
    try {
      savedY = sessionStorage.getItem(key);
    } catch {
      // sessionStorage can be unavailable in private browsing modes.
    }
    if (!savedY || !ref.current) return;

    const nextScrollTop = parseInt(savedY, 10);
    if (!Number.isFinite(nextScrollTop)) return;

    requestAnimationFrame(() => {
      if (ref.current) ref.current.scrollTop = nextScrollTop;
    });
  }, [activeScreen, ref, resetScreens, storageKeys]);

  return saveScroll;
};
