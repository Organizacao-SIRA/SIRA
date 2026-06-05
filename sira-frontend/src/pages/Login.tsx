import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthFormCard } from '../components/auth/AuthFormCard';
import { LoginForm } from '../components/auth/LoginForm';
import { SiraLogo } from '../components/ui/SiraLogo';

export const Login = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

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
              onClick={() => navigate('/register')}
              className="text-link hover:text-link-hover font-bold hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 rounded px-1"
            >
              {t('login.createAccount')}
            </button>
          </p>
        }
      >
        <LoginForm onForgotPassword={() => navigate('/forgot-password')} />
      </AuthFormCard>
    </AuthLayout>
  );
};
