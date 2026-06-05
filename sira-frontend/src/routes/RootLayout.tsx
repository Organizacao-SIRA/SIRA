import { Suspense } from 'react';
import { Navigate, Outlet, ScrollRestoration, useSearchParams } from 'react-router';
import { Spinner } from '../components/ui/Spinner';

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-surface-muted">
    <Spinner size="lg" />
  </div>
);

/**
 * Raiz do roteador: restauração de scroll nativa e boundary de Suspense para o
 * lazy-loading das páginas. Também redireciona o formato legado de e-mail de
 * recuperação de senha (`/?screen=reset-password&token=`) para a rota dedicada.
 */
export const RootLayout = () => {
  const [params] = useSearchParams();
  const legacyToken = params.get('screen') === 'reset-password' ? params.get('token') : null;
  if (legacyToken) {
    return <Navigate to={`/reset-password?token=${encodeURIComponent(legacyToken)}`} replace />;
  }

  return (
    <>
      <ScrollRestoration />
      <Suspense fallback={<RouteFallback />}>
        <Outlet />
      </Suspense>
    </>
  );
};
