import { Navigate, Outlet } from 'react-router';
import { useAuth } from '../contexts/AuthContext';

/**
 * Rotas públicas de autenticação (login, cadastro, recuperação de senha).
 * Usuário já autenticado é mandado para a home (o gate de onboarding decide o resto).
 */
export const AuthGate = () => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <Navigate to="/" replace /> : <Outlet />;
};
