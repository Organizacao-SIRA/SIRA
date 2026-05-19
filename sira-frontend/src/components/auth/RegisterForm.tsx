import React, { useState } from 'react';
import { User, Mail, UserPlus } from 'lucide-react';
import { registerUser } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Input } from '../ui/Input';
import { PasswordInput } from '../ui/PasswordInput';
import { Button } from '../ui/Button';

interface RegisterFormProps {
  onSuccess: () => void;
}

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
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

      <PasswordInput
        label="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Crie uma senha"
        autoComplete="new-password"
        required
      />

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
