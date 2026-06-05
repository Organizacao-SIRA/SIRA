import { createContext, useContext } from 'react';
import type { AuthUser } from '../types';

interface AuthContextData {
  user: AuthUser | null;
  login: (userData: AuthUser) => void;
  logout: () => void;
  updateUser: (userData: Partial<AuthUser>) => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextData | null>(null);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth precisa estar dentro de <AuthProvider>');
  return ctx;
};
