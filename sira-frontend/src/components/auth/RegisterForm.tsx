import React, { useState } from 'react';
import { User, Mail, UserPlus, Check, X } from 'lucide-react';
import { registerUser } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { Button } from '../ui/Button';

interface RegisterFormProps {
  onSuccess: () => void;
}

const PASSWORD_RULES = [
  { label: 'Mínimo 8 caracteres', test: (p: string) => p.length >= 8 },
  { label: 'Letra maiúscula', test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Letra minúscula', test: (p: string) => /[a-z]/.test(p) },
  { label: 'Número', test: (p: string) => /\d/.test(p) },
];

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);
  const { login } = useAuth();

  const passwordValid = PASSWORD_RULES.every(r => r.test(password));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordValid) {
      setPasswordTouched(true);
      return;
    }
    setIsLoading(true);
    setError('');

    try {
      const response = await registerUser({ name, email, password });
      login(response.user);
    } catch (err: any) {
      setError(err.message || 'Erro ao tentar realizar cadastro.');
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
        label="Nome Completo"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Seu nome completo"
        icon={<User className="w-4 h-4" />}
        autoComplete="name"
        required
      />

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

      <div className="space-y-2">
        <PasswordInput
          label="Senha"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (!passwordTouched) setPasswordTouched(true);
          }}
          placeholder="Crie uma senha forte"
          autoComplete="new-password"
          required
        />
        {passwordTouched && (
          <ul className="space-y-1 pt-1">
            {PASSWORD_RULES.map(rule => {
              const ok = rule.test(password);
              return (
                <li key={rule.label} className={`flex items-center gap-1.5 text-xs font-medium ${ok ? 'text-success-strong' : 'text-text-muted'}`}>
                  {ok
                    ? <Check className="w-3.5 h-3.5 text-success-strong flex-shrink-0" />
                    : <X className="w-3.5 h-3.5 text-danger-strong flex-shrink-0" />
                  }
                  {rule.label}
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Button
        type="submit"
        isLoading={isLoading}
        className="w-full mt-1"
      >
        Finalizar cadastro
        {!isLoading && <UserPlus className="w-4 h-4" />}
      </Button>
    </form>
  );
};
