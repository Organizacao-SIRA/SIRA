import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthFormCard } from '../components/auth/AuthFormCard';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { SiraLogo } from '../components/ui/SiraLogo';

interface ForgotPasswordProps {
  setCurrentScreen: (screen: string) => void;
}

export const ForgotPassword = ({ setCurrentScreen }: ForgotPasswordProps) => (
  <AuthLayout>
    <AuthFormCard
      title="Recuperar senha"
      subtitle="Enviaremos um link para redefinir sua senha"
      mobileLogo={
        <SiraLogo size="lg" />
      }
      footer={
        <p className="text-sm text-text-muted">
          Lembrou a senha?{' '}
          <button
            onClick={() => setCurrentScreen('login')}
            className="text-primary font-bold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded px-1"
          >
            Faça login
          </button>
        </p>
      }
    >
      <ForgotPasswordForm onBackToLogin={() => setCurrentScreen('login')} />
    </AuthFormCard>
  </AuthLayout>
);
