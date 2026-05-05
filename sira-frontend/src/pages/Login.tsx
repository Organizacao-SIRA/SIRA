import React, { useState } from 'react';
import { User, Lock, ArrowRight, Loader2 } from 'lucide-react';
import { loginUser } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

interface LoginProps {
  setCurrentScreen: (screen: string) => void;
}

export const Login = ({ setCurrentScreen }: LoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await loginUser({ email, password });
      login(response.user, response.access_token);
      // App.tsx decidirá a tela com base em hasCompletedOnboarding
    } catch (err: any) {
      setError(err.message || 'Erro ao tentar fazer login.');
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
                <User className="w-6 h-6 text-[#1351B4]" />
              </div>
              <h2 className="text-2xl font-bold text-[#003157]">Acesse o SIRA+</h2>
              <p className="text-gray-500 mt-1 text-xs font-medium">Entre com a sua conta para continuar</p>
            </div>

            <form className="space-y-4" onSubmit={handleLogin}>
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-xs rounded-xl border border-red-100 font-medium text-center">
                  {error}
                </div>
              )}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">E-mail</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Digite seu e-mail"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#1351B4] transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Senha</label>
                  <button
                    type="button"
                    onClick={() => setCurrentScreen('forgot-password')}
                    className="text-[10px] font-bold text-[#1351B4] hover:underline cursor-pointer"
                  >
                    Esqueceu?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#1351B4] transition-all"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#1351B4] hover:bg-[#003157] disabled:bg-gray-400 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 mt-2"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Entrar no sistema'}
                {!isLoading && <ArrowRight className="w-4 h-4" />}
              </button>
            </form>
          </div>

          <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
            <p className="text-xs text-gray-600">
              Novo por aqui? <button onClick={() => setCurrentScreen('register')} className="text-[#1351B4] font-bold hover:underline">Crie sua conta</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
