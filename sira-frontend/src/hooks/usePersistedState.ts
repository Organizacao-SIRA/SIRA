import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';

interface PersistedStateOptions<T> {
  validate?: (value: unknown) => T;
}

const readPersistedValue = <T,>(
  key: string,
  initialValue: T | (() => T),
  validate?: (value: unknown) => T,
): T => {
  const fallback = typeof initialValue === 'function'
    ? (initialValue as () => T)()
    : initialValue;

  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return fallback;

    const parsed = JSON.parse(raw);
    return validate ? validate(parsed) : parsed;
  } catch {
    return fallback;
  }
};

export const usePersistedState = <T,>(
  key: string,
  initialValue: T | (() => T),
  options: PersistedStateOptions<T> = {},
): [T, Dispatch<SetStateAction<T>>, () => void] => {
  const [value, setValue] = useState<T>(() => readPersistedValue(key, initialValue, options.validate));

  useEffect(() => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // sessionStorage can be unavailable in private browsing modes.
    }
  }, [key, value]);

  const clear = useCallback(() => {
    try {
      sessionStorage.removeItem(key);
    } catch {
      // sessionStorage can be unavailable in private browsing modes.
    }
    setValue(typeof initialValue === 'function' ? (initialValue as () => T)() : initialValue);
  }, [initialValue, key]);

  return [value, setValue, clear];
};
