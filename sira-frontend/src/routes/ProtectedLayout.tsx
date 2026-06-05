import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { ProfileProvider } from '../contexts/ProfileProvider';

/**
 * Área autenticada. Substitui o `useEffect` de redirecionamento imperativo do
 * antigo `App.tsx` por guards declarativos:
 *  - sem autenticação → /login;
 *  - onboarding incompleto → /onboarding;
 *  - onboarding completo tentando acessar /onboarding → home.
 */
export const ProtectedLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const onboardingDone = user?.hasCompletedOnboarding ?? false;
  const onOnboarding = location.pathname === '/onboarding';

  if (!onboardingDone && !onOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }
  if (onboardingDone && onOnboarding) {
    return <Navigate to="/" replace />;
  }

  return (
    <ProfileProvider>
      <Outlet />
    </ProfileProvider>
  );
};
