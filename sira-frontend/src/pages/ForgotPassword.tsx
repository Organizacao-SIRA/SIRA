import { useTranslation } from 'react-i18next';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthFormCard } from '../components/auth/AuthFormCard';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { SiraLogo } from '../components/ui/SiraLogo';

interface ForgotPasswordProps {
  setCurrentScreen: (screen: string) => void;
}

export const ForgotPassword = ({ setCurrentScreen }: ForgotPasswordProps) => {
  const { t } = useTranslation('auth');

  return (
    <AuthLayout>
      <AuthFormCard
        title={t('forgotPassword.title')}
        subtitle={t('forgotPassword.subtitle')}
        mobileLogo={
          <SiraLogo size="lg" />
        }
        footer={
          <p className="text-sm text-text-muted">
            {t('forgotPassword.rememberPassword')}{' '}
            <button
              onClick={() => setCurrentScreen('login')}
              className="text-primary font-bold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded px-1"
            >
              {t('forgotPassword.signIn')}
            </button>
          </p>
        }
      >
        <ForgotPasswordForm onBackToLogin={() => setCurrentScreen('login')} />
      </AuthFormCard>
    </AuthLayout>
  );
};
