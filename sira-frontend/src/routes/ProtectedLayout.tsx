import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { ProfileProvider } from '../contexts/ProfileProvider';
import { isOnboardingDeferred } from '../app/onboardingDeferral';

/**
 * Área autenticada. Substitui o `useEffect` de redirecionamento imperativo do
 * antigo `App.tsx` por guards declarativos:
 *  - sem autenticação → /login;
 *  - onboarding incompleto E não adiado → /onboarding;
 *  - onboarding completo tentando acessar /onboarding → home.
 *
 * Quem adia ("fazer depois") entra no app normalmente e é reconvidado pelo
 * banner em `AppShell`; o `/onboarding` segue acessível para retomar.
 */
export const ProtectedLayout = () => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const onboardingDone = user?.hasCompletedOnboarding ?? false;
  const onboardingDeferred = user ? isOnboardingDeferred(user.id) : false;
  const onOnboarding = location.pathname === '/onboarding';

  if (!onboardingDone && !onboardingDeferred && !onOnboarding) {
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
