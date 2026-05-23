import React, { useState } from 'react';
import { Mail, ArrowLeft, Send, CheckCircle } from 'lucide-react';
import { forgotPassword } from '../../services/api';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordForm = ({ onBackToLogin }: ForgotPasswordFormProps) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await forgotPassword(email);
      setIsSent(true);
    } catch (err: any) {
      setError(err.message || 'Erro ao processar a solicitação. Tente novamente.');
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
          <h3 className="text-lg font-bold text-primary-dark dark:text-text">E-mail enviado!</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Se o e-mail <strong className="text-text">{email}</strong> estiver cadastrado,
            você receberá um link para redefinir sua senha.
          </p>
          <p className="text-xs text-text-subtle">
            Verifique também a pasta de spam. O link expira em 30 minutos.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onBackToLogin}
          className="w-full mt-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar para o login
        </Button>
      </div>
    );
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <p className="text-sm text-text-muted leading-relaxed">
        Informe o e-mail associado à sua conta. Enviaremos um link para você criar uma nova senha.
      </p>

      {error && (
        <div role="alert" className="p-3 bg-danger-soft text-danger-strong text-sm rounded-xl border border-danger-border font-medium">
          {error}
        </div>
      )}

      <Input
        label="E-mail"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="seu@email.com"
        icon={<Mail className="w-4 h-4" />}
        autoComplete="email"
        required
      />

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full mt-1"
      >
        Enviar link de recuperação
        {!isLoading && <Send className="w-4 h-4" />}
      </Button>

      <div className="text-center">
        <button
          type="button"
          onClick={onBackToLogin}
          className="text-xs font-semibold text-primary hover:underline cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded px-1 inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-3 h-3" />
          Voltar para o login
        </button>
      </div>
    </form>
  );
};
