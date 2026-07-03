import React, { useRef, useState } from 'react';
import { User, Mail, UserPlus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { registerUser } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../toast';
import { isValidEmail, isStrongPassword } from '../../utils/validation';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { Button } from '../ui/Button';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

type FieldErrors = { email?: boolean; password?: boolean; confirmPassword?: boolean };

export const RegisterForm = () => {
  const { t } = useTranslation(['auth', 'common']);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [invalid, setInvalid] = useState<FieldErrors>({});
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmRef = useRef<HTMLInputElement>(null);
  const { login } = useAuth();

  const clearField = (field: keyof FieldErrors) =>
    setInvalid((prev) => (prev[field] ? { ...prev, [field]: false } : prev));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: { field: keyof FieldErrors; message: string; ref: React.RefObject<HTMLInputElement | null> }[] = [];
    if (!email.trim()) {
      errors.push({ field: 'email', message: t('common:validation.emailRequired'), ref: emailRef });
    } else if (!isValidEmail(email)) {
      errors.push({ field: 'email', message: t('common:validation.emailInvalid'), ref: emailRef });
    }
    if (!isStrongPassword(password)) {
      errors.push({ field: 'password', message: t('common:validation.passwordWeak'), ref: passwordRef });
    }
    if (!confirmPassword) {
      errors.push({ field: 'confirmPassword', message: t('common:validation.confirmRequired'), ref: confirmRef });
    } else if (password !== confirmPassword) {
      errors.push({ field: 'confirmPassword', message: t('common:validation.passwordMismatch'), ref: confirmRef });
    }

    if (errors.length > 0) {
      setInvalid(Object.fromEntries(errors.map((err) => [err.field, true])));
      toast.error(errors[0].message);
      errors[0].ref.current?.focus();
      return;
    }

    setInvalid({});
    setIsLoading(true);
    try {
      const response = await registerUser({ name, email, password, confirmPassword });
      login(response.user);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('register.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-3.5" onSubmit={handleRegister} noValidate>
      <Input
        label={t('register.nameLabel')}
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder={t('register.namePlaceholder')}
        icon={<User className="w-4 h-4" />}
        autoComplete="name"
        required
        data-testid="register-name"
      />

      <Input
        ref={emailRef}
        label={t('register.emailLabel')}
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); clearField('email'); }}
        placeholder={t('register.emailPlaceholder')}
        icon={<Mail className="w-4 h-4" />}
        invalid={invalid.email}
        autoComplete="email"
        required
        data-testid="register-email"
      />

      <div className="space-y-3">
        <PasswordInput
          ref={passwordRef}
          label={t('register.passwordLabel')}
          value={password}
          onChange={(e) => { setPassword(e.target.value); clearField('password'); }}
          placeholder={t('register.passwordPlaceholder')}
          invalid={invalid.password}
          autoComplete="new-password"
          required
          data-testid="register-password"
        />
        <PasswordStrengthMeter password={password} />
      </div>

      <PasswordInput
        ref={confirmRef}
        label={t('register.confirmPasswordLabel')}
        value={confirmPassword}
        onChange={(e) => { setConfirmPassword(e.target.value); clearField('confirmPassword'); }}
        placeholder={t('register.confirmPasswordPlaceholder')}
        invalid={invalid.confirmPassword}
        autoComplete="new-password"
        required
        data-testid="register-confirm-password"
      />

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full mt-1"
        disabled={isLoading}
        data-testid="register-submit"
      >
        {t('register.submit')}
        {!isLoading && <UserPlus className="w-4 h-4" />}
      </Button>
    </form>
  );
};
