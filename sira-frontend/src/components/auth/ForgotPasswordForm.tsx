import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { Trans, useTranslation } from 'react-i18next';
import { forgotPassword } from '../../services/api';
import { toast } from '../../toast';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordForm = ({ onBackToLogin }: ForgotPasswordFormProps) => {
  const { t } = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await forgotPassword(email);
      setIsSent(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : t('forgotPassword.error'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isSent) {
    return (
      <div className="text-center space-y-5 animate-fadeIn">
        <div className="mx-auto w-14 h-14 rounded-full bg-success-soft border border-success-border flex items-center justify-center">
          <CheckCircle className="w-7 h-7 text-success-strong" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-primary-dark dark:text-text">{t('forgotPassword.sentTitle')}</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            <Trans
              i18nKey="forgotPassword.sentDescription"
              ns="auth"
              values={{ email }}
              components={{ strong: <strong className="text-text" /> }}
            />
          </p>
          <p className="text-xs text-text-subtle">
            {t('forgotPassword.sentHint')}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onBackToLogin}
          className="w-full mt-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('common:actions.backToLogin')}
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <p className="text-sm text-text-muted leading-relaxed">
        {t('forgotPassword.instructions')}
      </p>

      <Input
        label={t('forgotPassword.emailLabel')}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('forgotPassword.emailPlaceholder')}
        icon={<Mail className="w-4 h-4" />}
        autoComplete="email"
        required
      />

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full mt-1"
      >
        {t('forgotPassword.submit')}
        {!isLoading && <Send className="w-4 h-4" />}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-xs font-semibold text-link hover:text-link-hover hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 rounded px-1 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          {t('common:actions.backToLogin')}
        </button>
      </div>
    </form>
  );
};
