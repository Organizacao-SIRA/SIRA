import React, { useState } from 'react';
import { User, Mail, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { registerUser } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { Button } from '../ui/Button';

interface RegisterFormProps {
  onSuccess: () => void;
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const { t } = useTranslation('auth');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await registerUser({ name, email, password });
      login(response.user);
    } catch (err: any) {
      setError(err.message || t('register.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleRegister} noValidate>
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

      <PasswordInput
        label={t('register.passwordLabel')}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t('register.passwordPlaceholder')}
        autoComplete="new-password"
        required
      />

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full mt-1"
      >
        {t('register.submit')}
        {!isLoading && <UserPlus className="w-4 h-4" />}
      </Button>
    </form>
  );
};
