import React, { useState } from 'react';
import { User, Lock, Mail, UserPlus } from 'lucide-react';
import { registerUser } from '../services/api';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';

interface RegisterProps {
  setCurrentScreen: (screen: string) => void;
}

export const Register = ({ setCurrentScreen }: RegisterProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      await registerUser({ name, email, password });
      setSuccess(true);
      setTimeout(() => {
        setCurrentScreen('login');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Erro ao tentar realizar cadastro.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-68px)] flex items-center justify-center p-4 bg-gray-50 animate-fadeIn">
      <div className="w-full max-w-sm">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 rounded-xl mb-3">
                <UserPlus className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-primary-dark">Criar Conta</h2>
              <p className="text-gray-500 mt-1 text-xs font-medium">Junte-se ao SIRA+ </p>
            </div>

            <form className="space-y-4" onSubmit={handleRegister}>
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 font-medium text-center">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 bg-green-50 text-green-600 text-xs rounded-xl border border-green-100 font-medium text-center">
                  Cadastro realizado com sucesso! Redirecionando...
                </div>
              )}
              
              <Input
                label="Nome Completo"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Seu nome"
                icon={<User className="w-4 h-4" />}
                required
              />

              <Input
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                icon={<Mail className="w-4 h-4" />}
                required
              />

              <Input
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Crie uma senha"
                icon={<Lock className="w-4 h-4" />}
                required
              />

              <Button
                type="submit"
                isLoading={isLoading}
                disabled={success}
                className="w-full mt-2"
              >
                Finalizar cadastro {!isLoading && <UserPlus className="w-4 h-4 ml-2" />}
              </Button>
            </form>
          </div>

          <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
            <p className="text-xs text-gray-600">
              Já possui uma conta? <button onClick={() => setCurrentScreen('login')} className="text-primary font-bold hover:underline">Faça login</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
