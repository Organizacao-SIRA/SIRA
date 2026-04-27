import React, { useState } from 'react';
import { User, Lock, Mail, UserPlus } from 'lucide-react';

interface RegisterProps {
  setCurrentScreen: (screen: string) => void;
  onRegister: (name: string, email: string, password: string) => Promise<void>;
}

export const Register = ({ setCurrentScreen, onRegister }: RegisterProps) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      await onRegister(name, email, password);
    } catch (err: any) {
      setError(err.message || 'Erro ao criar conta');
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
                <UserPlus className="w-6 h-6 text-[#1351B4]" />
              </div>
              <h2 className="text-2xl font-bold text-[#003157]">Criar Conta</h2>
              <p className="text-gray-500 mt-1 text-xs font-medium">Junte-se ao SIRA+</p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-600 font-medium text-center">
                {error}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Nome Completo</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Seu nome"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#1351B4] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#1351B4] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Senha</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    minLength={6}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#1351B4] transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1351B4] hover:bg-[#003157] disabled:opacity-60 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? 'Criando conta...' : 'Finalizar cadastro'}
                <UserPlus className="w-4 h-4" />
              </button>
            </form>
          </div>

          <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
            <p className="text-xs text-gray-600">
              Já possui uma conta?{' '}
              <button onClick={() => setCurrentScreen('login')} className="text-[#1351B4] font-bold hover:underline">
                Faça login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
