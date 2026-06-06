import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { i18n } from '../i18n';
import { normalizeLocale, setStoredUiLocale, type UiLocale } from '../i18n/locales';
import type { AuthUser } from '../types';
import { AuthContext } from './AuthContext';
import { queryClient } from '../queries/queryClient';
import { clearTokens } from '../services/api';

const AUTH_API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

const applyUiLocale = (locale: UiLocale) => {
  const normalized = normalizeLocale(locale);
  setStoredUiLocale(normalized);
  void i18n.changeLanguage(normalized);
  return normalized;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem('@sira:user');
    return stored ? JSON.parse(stored) as AuthUser : null;
  });

  const logout = useCallback(async () => {
    try {
      await fetch(`${AUTH_API}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch {
      // Logout local continua mesmo se a chamada de rede falhar.
    } finally {
      clearTokens(); // remove sira_access_token e sira_refresh_token do localStorage
      localStorage.removeItem('@sira:user');
      Object.keys(sessionStorage)
        .filter(k => k.startsWith('@sira:'))
        .forEach(k => sessionStorage.removeItem(k));
      queryClient.clear(); // descarta cache de servidor (perfil, favoritos, recomendações)
      setUser(null);
    }
  }, []);

  useEffect(() => {
    // Remove token legado do localStorage (substituído por httpOnly cookie)
    localStorage.removeItem('@sira:token');

    const handleAuthExpired = () => void logout();
    window.addEventListener('sira:auth:expired', handleAuthExpired);
    return () => window.removeEventListener('sira:auth:expired', handleAuthExpired);
  }, [logout]);

  useEffect(() => {
    if (!user?.uiLocale) return;
    applyUiLocale(user.uiLocale);
  }, [user?.uiLocale]);

  const login = useCallback((userData: AuthUser) => {
    const normalizedUser = userData.uiLocale
      ? { ...userData, uiLocale: applyUiLocale(userData.uiLocale) }
      : userData;

    localStorage.setItem('@sira:user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  }, []);

  const updateUser = useCallback((userData: Partial<AuthUser>) => {
    const normalizedData = userData.uiLocale
      ? { ...userData, uiLocale: normalizeLocale(userData.uiLocale) }
      : userData;

    if (normalizedData.uiLocale) {
      setStoredUiLocale(normalizedData.uiLocale);
    }

    setUser(prev => {
      if (!prev) return null;
      const hasChanges = Object.entries(normalizedData).some(
        ([key, value]) => prev[key as keyof AuthUser] !== value,
      );
      if (!hasChanges) return prev;

      const updated = { ...prev, ...normalizedData };
      localStorage.setItem('@sira:user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const value = useMemo(
    () => ({ user, login, logout, updateUser, isAuthenticated: !!user }),
    [login, logout, updateUser, user],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
