import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getInitialUiLocale, htmlLangForLocale, normalizeLocale, setStoredUiLocale } from './locales';
import { resources } from './resources';

const initialLocale = getInitialUiLocale();

document.documentElement.lang = htmlLangForLocale(initialLocale);

void i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLocale,
    fallbackLng: 'pt-BR',
    defaultNS: 'common',
    supportedLngs: ['pt-BR', 'en-US'],
    interpolation: {
      escapeValue: false,
    },
  });

i18n.on('languageChanged', language => {
  const locale = normalizeLocale(language);
  document.documentElement.lang = htmlLangForLocale(locale);
  setStoredUiLocale(locale);
});

export { i18n };
