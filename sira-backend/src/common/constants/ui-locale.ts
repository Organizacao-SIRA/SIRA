export const UI_LOCALES = ['pt-BR', 'en-US'] as const;
export type UiLocale = (typeof UI_LOCALES)[number];

export const DEFAULT_UI_LOCALE: UiLocale = 'pt-BR';

export const isUiLocale = (value: unknown): value is UiLocale =>
  typeof value === 'string' && (UI_LOCALES as readonly string[]).includes(value);

export const normalizeUiLocale = (value?: string | null): UiLocale => {
  if (!value) return DEFAULT_UI_LOCALE;
  if (isUiLocale(value)) return value;
  return value.toLowerCase().startsWith('en') ? 'en-US' : DEFAULT_UI_LOCALE;
};
