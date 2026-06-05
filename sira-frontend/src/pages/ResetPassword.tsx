import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthFormCard } from '../components/auth/AuthFormCard';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';
import { SiraLogo } from '../components/ui/SiraLogo';

export const ResetPassword = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';

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
              onClick={() => navigate('/forgot-password')}
              className="text-link hover:text-link-hover font-bold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 rounded px-1"
            >
              {t('resetPassword.requestAgain')}
            </button>
          </p>
        }
      >
        <ResetPasswordForm token={token} onBackToLogin={() => navigate('/login')} />
      </AuthFormCard>
    </AuthLayout>
  );
};
