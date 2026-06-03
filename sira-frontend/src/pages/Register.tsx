import { useTranslation } from 'react-i18next';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthFormCard } from '../components/auth/AuthFormCard';
import { RegisterForm } from '../components/auth/RegisterForm';
import { SiraLogo } from '../components/ui/SiraLogo';

interface RegisterProps {
  setCurrentScreen: (screen: string) => void;
}

export const Register = ({ setCurrentScreen }: RegisterProps) => {
  const { t } = useTranslation('auth');

  return (
    <AuthLayout>
      <AuthFormCard
        title={t('register.title')}
        subtitle={t('register.subtitle')}
        mobileLogo={
          <SiraLogo size="lg" />
        }
        footer={
          <p className="text-sm text-text-muted">
            {t('register.hasAccount')}{' '}
            <button
              onClick={() => setCurrentScreen('login')}
              className="text-link hover:text-link-hover font-bold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 rounded px-1"
            >
              {t('register.signIn')}
            </button>
          </p>
        }
      >
        <RegisterForm />
      </AuthFormCard>
    </AuthLayout>
  );
};
