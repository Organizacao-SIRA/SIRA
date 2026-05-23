import React, { useState, useEffect } from 'react';
import { ArrowRight, ArrowLeft, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
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
      setError('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);

    try {
      await resetPassword(token, newPassword);
      setFormState('success');
    } catch (err: any) {
      // Se o backend retorna array de mensagens (validação), junta
      const msg = err.message || 'Erro ao redefinir a senha. Tente novamente.';
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
        <p className="text-sm text-text-muted font-medium">Validando link de recuperação...</p>
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
          <h3 className="text-lg font-bold text-primary-dark dark:text-text">Link inválido ou expirado</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Este link de recuperação não é mais válido. Links expiram após 30 minutos
            e só podem ser usados uma vez.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={onBackToLogin}
          className="w-full mt-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Solicitar novo link
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
          <h3 className="text-lg font-bold text-primary-dark dark:text-text">Senha redefinida!</h3>
          <p className="text-sm text-text-muted leading-relaxed">
            Sua senha foi atualizada com sucesso. Use a nova senha para acessar sua conta.
          </p>
        </div>
        <Button
          type="button"
          onClick={onBackToLogin}
          className="w-full mt-2"
        >
          Ir para o login
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  // Estado: formulário de redefinição
  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <p className="text-sm text-text-muted leading-relaxed">
        Crie uma nova senha segura para a sua conta.
      </p>

      {error && (
        <div role="alert" className="p-3 bg-danger-soft text-danger-strong text-sm rounded-xl border border-danger-border font-medium">
          {error}
        </div>
      )}

      <div className="space-y-3">
        <PasswordInput
          label="Nova senha"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          placeholder="Crie uma nova senha"
          autoComplete="new-password"
          required
        />
        <PasswordStrengthMeter password={newPassword} />
      </div>

      <PasswordInput
        label="Confirmar nova senha"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="Repita a nova senha"
        autoComplete="new-password"
        error={
          confirmPassword && confirmPassword !== newPassword
            ? 'As senhas não coincidem'
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
        Redefinir senha
        {!isLoading && <ArrowRight className="w-4 h-4" />}
      </Button>
    </form>
  );
};
