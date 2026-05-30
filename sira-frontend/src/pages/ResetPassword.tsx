import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthFormCard } from '../components/auth/AuthFormCard';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';
import { SiraLogo } from '../components/ui/SiraLogo';

interface ResetPasswordProps {
  token: string;
  setCurrentScreen: (screen: string) => void;
}

export const ResetPassword = ({ token, setCurrentScreen }: ResetPasswordProps) => (
  <AuthLayout>
    <AuthFormCard
      title="Criar nova senha"
      subtitle="Defina uma senha segura para sua conta"
      mobileLogo={
        <SiraLogo size="lg" />
      }
      footer={
        <p className="text-sm text-text-muted">
          Precisa de um novo link?{' '}
          <button
            onClick={() => setCurrentScreen('forgot-password')}
            className="text-primary font-bold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded px-1"
          >
            Solicitar novamente
          </button>
        </p>
      }
    >
      <ResetPasswordForm token={token} onBackToLogin={() => setCurrentScreen('login')} />
    </AuthFormCard>
  </AuthLayout>
);
