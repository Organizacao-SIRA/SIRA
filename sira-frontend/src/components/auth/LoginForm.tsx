import React, { useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { loginUser } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { Button } from '../ui/Button';

interface LoginFormProps {
  onForgotPassword: () => void;
}

export const LoginForm = ({ onForgotPassword }: LoginFormProps) => {
  const { t } = useTranslation(['auth', 'common']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await loginUser({ email, password });
      login(response.user);
    } catch (err: any) {
      setError(err.message || t('login.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleLogin} noValidate>
      {error && (
        <div role="alert" className="p-3 bg-danger-soft text-danger-strong text-sm rounded-xl border border-danger-border font-medium">
          {error}
        </div>
      )}

      <Input
        label={t('login.emailLabel')}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('login.emailPlaceholder')}
        icon={<Mail className="w-4 h-4" />}
        autoComplete="email"
        required
      />

      <div className="space-y-2">
        <PasswordInput
          label={t('common:password.label')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('login.passwordPlaceholder')}
          autoComplete="current-password"
          required
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs font-semibold text-primary hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded px-1"
          >
            {t('login.forgotPassword')}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full mt-1"
      >
        {t('login.submit')}
        {!isLoading && <ArrowRight className="w-4 h-4" />}
      </Button>
    </form>
  );
};
