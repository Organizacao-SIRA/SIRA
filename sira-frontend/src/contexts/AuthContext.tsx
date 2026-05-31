import React, { createContext, useContext, useState, useEffect } from 'react';
import { i18n } from '../i18n';
import { normalizeLocale, setStoredUiLocale, type UiLocale } from '../i18n/locales';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  hasCompletedOnboarding?: boolean;
  uiLocale?: UiLocale;
}

interface AuthContextData {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AUTH_API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

const applyUiLocale = (locale: UiLocale) => {
  const normalized = normalizeLocale(locale);
  setStoredUiLocale(normalized);
  void i18n.changeLanguage(normalized);
  return normalized;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('@sira:user');
    return stored ? JSON.parse(stored) : null;
  });

  useEffect(() => {
    // Remove token legado do localStorage (substituído por httpOnly cookie)
    localStorage.removeItem('@sira:token');

    const handleAuthExpired = () => void logout();
    window.addEventListener('sira:auth:expired', handleAuthExpired);
    return () => window.removeEventListener('sira:auth:expired', handleAuthExpired);
  }, []);

  useEffect(() => {
    if (!user?.uiLocale) return;
    applyUiLocale(user.uiLocale);
  }, [user?.uiLocale]);

  const login = (userData: User) => {
    if (userData.uiLocale) {
      userData = { ...userData, uiLocale: applyUiLocale(userData.uiLocale) };
    }

    localStorage.setItem('@sira:user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = async () => {
    try {
      await fetch(`${AUTH_API}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch { /* erro de rede no logout é ignorado */ }
    localStorage.removeItem('@sira:user');
    Object.keys(sessionStorage)
      .filter(k => k.startsWith('@sira:'))
      .forEach(k => sessionStorage.removeItem(k));
    setUser(null);
  };

  const updateUser = (userData: Partial<User>) => {
    const normalizedData = userData.uiLocale
      ? { ...userData, uiLocale: normalizeLocale(userData.uiLocale) }
      : userData;

    if (normalizedData.uiLocale) {
      setStoredUiLocale(normalizedData.uiLocale);
    }

    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...normalizedData };
      localStorage.setItem('@sira:user', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
