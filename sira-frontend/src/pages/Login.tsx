import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthFormCard } from '../components/auth/AuthFormCard';
import { LoginForm } from '../components/auth/LoginForm';
import logoSiraPlus from '../assets/logo sira+.png';

interface LoginProps {
  setCurrentScreen: (screen: string) => void;
}

export const Login = ({ setCurrentScreen }: LoginProps) => (
  <AuthLayout>
    <AuthFormCard
      title="Acesse o SIRA+"
      subtitle="Entre com a sua conta para continuar"
      mobileLogo={
        <img
          src={logoSiraPlus}
          alt="SIRA+"
          className="max-w-[150px] w-full object-contain"
        />
      }
      footer={
        <p className="text-sm text-text-muted">
          Novo por aqui?{' '}
          <button
            onClick={() => setCurrentScreen('register')}
            className="text-primary font-bold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded px-1"
          >
            Crie sua conta
          </button>
        </p>
      }
    >
      <LoginForm onForgotPassword={() => setCurrentScreen('forgot-password')} />
    </AuthFormCard>
  </AuthLayout>
);
