import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthFormCard } from '../components/auth/AuthFormCard';
import { RegisterForm } from '../components/auth/RegisterForm';
import { SiraLogo } from '../components/ui/SiraLogo';

interface RegisterProps {
  setCurrentScreen: (screen: string) => void;
}

export const Register = ({ setCurrentScreen }: RegisterProps) => (
  <AuthLayout>
    <AuthFormCard
      title="Criar conta"
      subtitle="Junte-se ao SIRA+ e descubra sua próxima leitura"
      mobileLogo={
        <SiraLogo size="lg" />
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
