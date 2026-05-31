import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { resetPassword, validateResetToken } from '../../services/api';
import { PasswordInput } from '../ui/PasswordInput';
import { Button } from '../ui/Button';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';

interface ResetPasswordFormProps {
  token: string;
  onBackToLogin: () => void;
}

type FormState = 'validating' | 'ready' | 'invalid' | 'success';

export const ResetPasswordForm = ({ token, onBackToLogin }: ResetPasswordFormProps) => {
  const { t } = useTranslation('auth');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formState, setFormState] = useState<FormState>('validating');

  // Validação antecipada do token ao carregar
  useEffect(() => {
    if (!token) {
      setFormState('invalid');
      return;
    }

    validateResetToken(token)
      .then(({ valid }) => setFormState(valid ? 'ready' : 'invalid'))
      .catch(() => setFormState('invalid'));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError(t('resetPassword.passwordMismatch'));
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(token, newPassword);
      setFormState('success');
    } catch (err: any) {
      // Se o backend retorna array de mensagens (validação), junta
      const msg = err.message || t('resetPassword.error');
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Estado: validando token
  if (formState === 'validating') {
    return (
      <div className="text-center space-y-4 py-4 animate-fadeIn">
        <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
        <p className="text-sm text-text-muted font-medium">{t('resetPassword.validating')}</p>
      </div>
    );
  }

  // Estado: token inválido/expirado
  if (formState === 'invalid') {
    return (
      <div className="text-center space-y-5 animate-fadeIn">
        <div className="mx-auto w-14 h-14 rounded-full bg-warning-soft border border-warning-border flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-warning-strong" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-primary-dark dark:text-text">{t('resetPassword.invalidTitle')}</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            {t('resetPassword.invalidDescription')}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onBackToLogin}
          className="w-full mt-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('resetPassword.requestNew')}
        </Button>
      </div>
    );
  }

  // Estado: senha redefinida com sucesso
  if (formState === 'success') {
    return (
      <div className="text-center space-y-5 animate-fadeIn">
        <div className="mx-auto w-14 h-14 rounded-full bg-success-soft border border-success-border flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-success-strong" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-primary-dark dark:text-text">{t('resetPassword.successTitle')}</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            {t('resetPassword.successDescription')}
          </p>
        </div>
        <Button
          type="button"
          onClick={onBackToLogin}
          className="w-full mt-2"
        >
          {t('resetPassword.goToLogin')}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Estado: formulário de redefinição
  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <p className="text-sm text-text-muted leading-relaxed">
        {t('resetPassword.instructions')}
      </p>

      {error && (
        <div role="alert" className="p-3 bg-danger-soft text-danger-strong text-sm rounded-xl border border-danger-border font-medium">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <PasswordInput
          label={t('resetPassword.newPasswordLabel')}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder={t('resetPassword.newPasswordPlaceholder')}
          autoComplete="new-password"
          required
        />
        <PasswordStrengthMeter password={newPassword} />
      </div>

      <PasswordInput
        label={t('resetPassword.confirmPasswordLabel')}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder={t('resetPassword.confirmPasswordPlaceholder')}
        autoComplete="new-password"
        error={
          confirmPassword && confirmPassword !== newPassword
            ? t('resetPassword.passwordMismatchInline')
            : undefined
        }
        required
      />

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full mt-1"
        disabled={!newPassword || !confirmPassword || newPassword !== confirmPassword}
      >
        {t('resetPassword.submit')}
        {!isLoading && <ArrowRight className="w-4 h-4" />}
      </Button>
    </form>
  );
};
