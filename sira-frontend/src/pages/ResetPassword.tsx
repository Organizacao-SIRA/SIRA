import { useTranslation } from 'react-i18next';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthFormCard } from '../components/auth/AuthFormCard';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';
import { SiraLogo } from '../components/ui/SiraLogo';

interface ResetPasswordProps {
  token: string;
  setCurrentScreen: (screen: string) => void;
}

export const ResetPassword = ({ token, setCurrentScreen }: ResetPasswordProps) => {
  const { t } = useTranslation('auth');

  return (
    <AuthLayout>
      <AuthFormCard
        title={t('resetPassword.title')}
        subtitle={t('resetPassword.subtitle')}
        mobileLogo={
          <SiraLogo size="lg" />
        }
        footer={
          <p className="text-sm text-text-muted">
            {t('resetPassword.requestNewLink')}{' '}
            <button
              onClick={() => setCurrentScreen('forgot-password')}
              className="text-link hover:text-link-hover font-bold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 rounded px-1"
            >
              {t('resetPassword.requestAgain')}
            </button>
          </p>
        }
      >
        <ResetPasswordForm token={token} onBackToLogin={() => setCurrentScreen('login')} />
      </AuthFormCard>
    </AuthLayout>
  );
};
