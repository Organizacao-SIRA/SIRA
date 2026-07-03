import React, { useRef, useState } from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { loginUser } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../toast';
import { isValidEmail } from '../../utils/validation';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { Button } from '../ui/Button';

interface LoginFormProps {
  onForgotPassword: () => void;
}

type FieldErrors = { email?: boolean; password?: boolean };

export const LoginForm = ({ onForgotPassword }: LoginFormProps) => {
  const { t } = useTranslation(['auth', 'common']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [invalid, setInvalid] = useState<FieldErrors>({});
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const { login } = useAuth();

  const clearField = (field: keyof FieldErrors) =>
    setInvalid((prev) => (prev[field] ? { ...prev, [field]: false } : prev));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: { field: keyof FieldErrors; message: string; ref: React.RefObject<HTMLInputElement | null> }[] = [];
    if (!email.trim()) {
      errors.push({ field: 'email', message: t('common:validation.emailRequired'), ref: emailRef });
    } else if (!isValidEmail(email)) {
      errors.push({ field: 'email', message: t('common:validation.emailInvalid'), ref: emailRef });
    }
    if (!password) {
      errors.push({ field: 'password', message: t('common:validation.passwordRequired'), ref: passwordRef });
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
      const response = await loginUser({ email, password });
      login(response.user);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('login.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleLogin} noValidate>
      <Input
        ref={emailRef}
        label={t('login.emailLabel')}
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); clearField('email'); }}
        placeholder={t('login.emailPlaceholder')}
        icon={<Mail className="w-4 h-4" />}
        invalid={invalid.email}
        autoComplete="email"
        required
        data-testid="login-email"
      />

      <div className="space-y-2">
        <PasswordInput
          ref={passwordRef}
          label={t('common:password.label')}
          value={password}
          onChange={(e) => { setPassword(e.target.value); clearField('password'); }}
          placeholder={t('login.passwordPlaceholder')}
          invalid={invalid.password}
          autoComplete="current-password"
          required
          data-testid="login-password"
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-xs font-semibold text-link hover:text-link-hover hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 rounded px-1"
          >
            {t('login.forgotPassword')}
          </button>
        </div>
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full mt-1"
        data-testid="login-submit"
      >
        {t('login.submit')}
        {!isLoading && <ArrowRight className="w-4 h-4" />}
      </Button>
    </form>
  );
};
