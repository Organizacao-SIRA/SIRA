export const SUPPORTED_LOCALES = ['pt-BR', 'en-US'] as const;
export type UiLocale = typeof SUPPORTED_LOCALES[number];

export const DEFAULT_LOCALE: UiLocale = 'pt-BR';
export const UI_LOCALE_STORAGE_KEY = '@sira:uiLocale';

export const isUiLocale = (value: unknown): value is UiLocale =>
  typeof value === 'string' && SUPPORTED_LOCALES.includes(value as UiLocale);

export const normalizeLocale = (value: unknown): UiLocale => {
  if (isUiLocale(value)) return value;
  if (typeof value !== 'string') return DEFAULT_LOCALE;

  const lower = value.toLowerCase();
  if (lower.startsWith('en')) return 'en-US';
  if (lower.startsWith('pt')) return 'pt-BR';
  return DEFAULT_LOCALE;
};

export const getStoredUiLocale = (): UiLocale => {
  try {
    return normalizeLocale(localStorage.getItem(UI_LOCALE_STORAGE_KEY));
  } catch {
    return DEFAULT_LOCALE;
  }
};

export const setStoredUiLocale = (locale: UiLocale) => {
  try {
    localStorage.setItem(UI_LOCALE_STORAGE_KEY, locale);
  } catch {
    // localStorage can be unavailable in private browsing modes.
  }
};

export const getInitialUiLocale = (): UiLocale => {
  try {
    const stored = localStorage.getItem(UI_LOCALE_STORAGE_KEY);
    if (stored) return normalizeLocale(stored);
  } catch {
    // Ignore storage failures and fall back to browser language.
  }

  return normalizeLocale(navigator.language);
};

export const htmlLangForLocale = (locale: UiLocale) => locale === 'en-US' ? 'en' : 'pt-BR';
