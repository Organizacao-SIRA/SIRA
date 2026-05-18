import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthFormCard } from '../components/auth/AuthFormCard';
import { RegisterForm } from '../components/auth/RegisterForm';
import logoSiraPlus from '../assets/logo sira+.png';

interface RegisterProps {
  setCurrentScreen: (screen: string) => void;
}

export const Register = ({ setCurrentScreen }: RegisterProps) => (
  <AuthLayout>
    <AuthFormCard
      title="Criar conta"
      subtitle="Junte-se ao SIRA+ e descubra sua próxima leitura"
      mobileLogo={
        <img
          src={logoSiraPlus}
          alt="SIRA+"
          className="max-w-[150px] w-full object-contain"
        />
      }
      footer={
        <p className="text-sm text-text-muted">
          Já possui uma conta?{' '}
          <button
            onClick={() => setCurrentScreen('login')}
            className="text-primary font-bold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded px-1"
          >
            Faça login
          </button>
        </p>
      }
    >
      <RegisterForm onSuccess={() => setCurrentScreen('login')} />
    </AuthFormCard>
  </AuthLayout>
);
