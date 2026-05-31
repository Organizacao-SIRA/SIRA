import { useTranslation } from 'react-i18next';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthFormCard } from '../components/auth/AuthFormCard';
import { LoginForm } from '../components/auth/LoginForm';
import { SiraLogo } from '../components/ui/SiraLogo';

interface LoginProps {
  setCurrentScreen: (screen: string) => void;
}

export const Login = ({ setCurrentScreen }: LoginProps) => {
  const { t } = useTranslation('auth');

  return (
    <AuthLayout>
      <AuthFormCard
        title={t('login.title')}
        subtitle={t('login.subtitle')}
        mobileLogo={
          <SiraLogo size="lg" />
        }
        footer={
          <p className="text-sm text-text-muted">
            {t('login.noAccount')}{' '}
            <button
              onClick={() => setCurrentScreen('register')}
              className="text-primary font-bold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded px-1"
            >
              {t('login.createAccount')}
            </button>
          </p>
        }
      >
        <LoginForm onForgotPassword={() => setCurrentScreen('forgot-password')} />
      </AuthFormCard>
    </AuthLayout>
  );
};
