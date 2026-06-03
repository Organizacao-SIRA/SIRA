import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile } from '../services/api';
import { normalizeLocale, type UiLocale } from '../i18n/locales';

/**
 * Centraliza a troca de idioma da UI.
 *
 * - Anônimo: aplica via i18next (o listener em src/i18n/index.ts persiste no localStorage).
 * - Autenticado: além disso, sincroniza o AuthContext e salva uiLocale no perfil em background.
 *
 * A persistência no backend é deliberadamente "fire-and-forget" e não bloqueia
 * a UI: se falhar, o idioma local permanece e a falha é reportada via onError.
 */
export const useUiLocaleSync = (options?: { onError?: (error: Error) => void }) => {
  const { i18n } = useTranslation();
  const { user, updateUser } = useAuth();
  const userId = user?.id;

  const setUiLocale = useCallback(
    (next: UiLocale) => {
      const locale = normalizeLocale(next);
      if (locale === normalizeLocale(i18n.language)) return;

      void i18n.changeLanguage(locale);

      if (!userId) return;

      updateUser({ uiLocale: locale });
      updateProfile({ uiLocale: locale }).catch((err: unknown) => {
        const error = err instanceof Error ? err : new Error(String(err));
        if (options?.onError) options.onError(error);
        else console.warn('[i18n] Falha ao persistir uiLocale no perfil:', error);
      });
    },
    [i18n, userId, updateUser, options],
  );

  return { setUiLocale };
};
