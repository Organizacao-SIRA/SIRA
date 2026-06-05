import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthFormCard } from '../components/auth/AuthFormCard';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { SiraLogo } from '../components/ui/SiraLogo';

export const ForgotPassword = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

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
              onClick={() => navigate('/login')}
              className="text-link hover:text-link-hover font-bold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 rounded px-1"
            >
              {t('forgotPassword.signIn')}
            </button>
          </p>
        }
      >
        <ForgotPasswordForm onBackToLogin={() => navigate('/login')} />
      </AuthFormCard>
    </AuthLayout>
  );
};
