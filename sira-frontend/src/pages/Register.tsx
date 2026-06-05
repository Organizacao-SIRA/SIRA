import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthFormCard } from '../components/auth/AuthFormCard';
import { RegisterForm } from '../components/auth/RegisterForm';
import { SiraLogo } from '../components/ui/SiraLogo';

export const Register = () => {
  const { t } = useTranslation('auth');
  const navigate = useNavigate();

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
              onClick={() => navigate('/login')}
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
