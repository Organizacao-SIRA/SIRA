import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES, normalizeLocale, type UiLocale } from '../../i18n/locales';

interface LanguageToggleProps {
  variant?: 'default' | 'navbar';
  onChange?: (locale: UiLocale) => void;
}

export const LanguageToggle = ({ variant = 'default', onChange }: LanguageToggleProps) => {
  const { i18n, t } = useTranslation('common');
  const activeLocale = normalizeLocale(i18n.language);
  const isNavbar = variant === 'navbar';

  const handleChange = (locale: UiLocale) => {
    if (locale === activeLocale) return;
    void i18n.changeLanguage(locale);
    onChange?.(locale);
  };

  return (
    <div
      role="group"
      aria-label={t('language.label')}
      className={`inline-flex h-9 rounded-lg border p-0.5 ${
        isNavbar
          ? 'border-white/25 bg-white/10 text-white'
          : 'border-border-strong bg-surface text-text'
      }`}
    >
      {SUPPORTED_LOCALES.map(locale => {
        const selected = locale === activeLocale;
        const label = locale === 'pt-BR' ? t('language.portuguese') : t('language.english');

        return (
          <button
            key={locale}
            type="button"
            aria-label={label}
            aria-pressed={selected}
            onClick={() => handleChange(locale)}
            className={`min-w-9 rounded-md px-2 text-xs font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 ${
              isNavbar
                ? 'focus-visible:ring-white/60'
                : 'focus-visible:ring-focus/40'
            } ${
              selected
                ? isNavbar
                  ? 'bg-white text-primary shadow-sm'
                  : 'bg-selected text-link shadow-sm'
                : isNavbar
                  ? 'text-white/80 hover:bg-white/10 hover:text-white'
                  : 'text-text-muted hover:bg-surface-subtle hover:text-text'
            }`}
          >
            {locale === 'pt-BR' ? t('language.pt') : t('language.en')}
          </button>
        );
      })}
    </div>
  );
};
