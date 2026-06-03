import { useEffect, useState } from 'react';

const DEFAULT_BREAKPOINT = 640;

export const useIsMobile = (breakpoint: number = DEFAULT_BREAKPOINT): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== 'undefined' ? window.innerWidth < breakpoint : false,
  );

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const handleChange = (event: MediaQueryListEvent) => setIsMobile(event.matches);

    queueMicrotask(() => setIsMobile(query.matches));
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, [breakpoint]);

  return isMobile;
};
