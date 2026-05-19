import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  hasCompletedOnboarding?: boolean;
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

  const login = (userData: User) => {
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
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...userData };
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
