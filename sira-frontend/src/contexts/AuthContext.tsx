import { createContext, useContext } from 'react';
import type { AuthUser } from '../types';

interface AuthContextData {
  user: AuthUser | null;
  login: (userData: AuthUser) => void;
  logout: () => void;
  updateUser: (userData: Partial<AuthUser>) => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const useAuth = () => useContext(AuthContext);
