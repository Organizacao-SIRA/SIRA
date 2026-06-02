import React, { useState } from 'react';
import { User, Mail, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { registerUser } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { Button } from '../ui/Button';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

interface RegisterFormProps {
  onSuccess: () => void;
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const { t } = useTranslation('auth');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError(t('register.passwordMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      const response = await registerUser({ name, email, password, confirmPassword });
      login(response.user);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : t('register.error');
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-3.5" onSubmit={handleRegister} noValidate>
      {error && (
        <div role="alert" className="p-3 bg-danger-soft text-danger-strong text-sm rounded-xl border border-danger-border font-medium">
          {error}
        </div>
      )}

      <Input
        label={t('register.nameLabel')}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('register.namePlaceholder')}
        icon={<User className="w-4 h-4" />}
        autoComplete="name"
        required
      />

      <Input
        label={t('register.emailLabel')}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('register.emailPlaceholder')}
        icon={<Mail className="w-4 h-4" />}
        autoComplete="email"
        required
      />

      <div className="space-y-3">
        <PasswordInput
          label={t('register.passwordLabel')}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('register.passwordPlaceholder')}
          autoComplete="new-password"
          required
        />
        <PasswordStrengthMeter password={password} />
      </div>

      <PasswordInput
        label={t('register.confirmPasswordLabel')}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder={t('register.confirmPasswordPlaceholder')}
        autoComplete="new-password"
        error={
          confirmPassword && confirmPassword !== password
            ? t('register.passwordMismatchInline')
            : undefined
        }
        required
      />

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full mt-1"
        disabled={!password || !confirmPassword || password !== confirmPassword}
      >
        {t('register.submit')}
        {!isLoading && <UserPlus className="w-4 h-4" />}
      </Button>
    </form>
  );
};
