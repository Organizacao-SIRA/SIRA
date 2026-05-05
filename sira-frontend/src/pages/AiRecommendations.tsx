import React, { useState, useEffect } from 'react';
import { Sparkles, Star, ChevronRight, Brain, BookOpen, LogIn, AlertCircle, RefreshCw, Clock, ExternalLink, Settings } from 'lucide-react';
import { getAiRecommendations, refreshAiRecommendations } from '../services/api';
import type { AuthUser } from '../types';

interface AiRecommendationsProps {
  user: AuthUser | null;
  viewDetails: (item: any) => void;
  toggleFavorite: (item: any) => void;
  isFavorite: (id: string) => boolean;
  setCurrentScreen: (screen: string) => void;
}

export const AiRecommendations = ({ user, viewDetails, toggleFavorite, isFavorite, setCurrentScreen }: AiRecommendationsProps) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [basedOn, setBasedOn] = useState<{ favorites: number; searches: number; preferences: boolean } | null>(null);
  const [generatedAt, setGeneratedAt] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) loadRecommendations();
  }, [user]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await getAiRecommendations();
      setRecommendations(data.recommendations.slice(0, 2));
      setBasedOn(data.basedOn);
      setGeneratedAt(data.generatedAt);
    } catch (err: any) {
      setError(err.message || 'Erro ao buscar recomendações');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setError('');
    try {
      const data = await refreshAiRecommendations();
      setRecommendations(data.recommendations.slice(0, 2));
      setBasedOn(data.basedOn);
      setGeneratedAt(data.generatedAt);
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar recomendações');
    } finally {
      setIsRefreshing(false);
    }
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  /** Gera a mensagem contextual do basedOn */
  const getBasedOnMessage = () => {
    if (!basedOn) return null;
    const parts: string[] = [];
    if (basedOn.favorites > 0) {
      parts.push(`${basedOn.favorites} favorito${basedOn.favorites !== 1 ? 's' : ''}`);
    }
    if (basedOn.searches > 0) {
      parts.push(`${basedOn.searches} busca${basedOn.searches !== 1 ? 's' : ''} recente${basedOn.searches !== 1 ? 's' : ''}`);
    }
    if (basedOn.preferences) {
      parts.push('suas preferências acadêmicas');
    }
    if (parts.length === 0) return null;
    return `Baseado em ${parts.join(', ')}`;
  };

  /** Verifica se o erro indica necessidade de onboarding */
  const isOnboardingError = error.toLowerCase().includes('preferência') || error.toLowerCase().includes('onboarding') || error.toLowerCase().includes('preferencia');

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fadeIn">
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-12">
          <Brain className="h-14 w-14 text-[#1351B4] opacity-30 mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-[#003157] mb-3">Recomendações Personalizadas</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Faça login para receber recomendações baseadas nos seus favoritos e histórico de buscas.
          </p>
          <button
            onClick={() => setCurrentScreen('login')}
            className="bg-[#1351B4] text-white px-8 py-3 rounded-full font-bold flex items-center mx-auto hover:bg-[#003157] transition-all shadow-md gap-2"
          >
            <LogIn className="w-4 h-4" /> Fazer Login
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center animate-fadeIn">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#1351B4] mx-auto mb-5"></div>
        <p className="text-[#003157] font-bold text-sm uppercase tracking-widest">Carregando recomendações...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fadeIn">
        <div className="bg-white rounded-3xl border border-gray-100 p-12 shadow-sm">
          <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#003157] mb-2">Não foi possível gerar recomendações</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={loadRecommendations}
              className="bg-[#1351B4] text-white px-6 py-3 rounded-full font-bold hover:bg-[#003157] transition-all shadow-md"
            >
              Tentar novamente
            </button>
            {isOnboardingError ? (
              <button
                onClick={() => setCurrentScreen('onboarding')}
                className="border border-[#1351B4] text-[#1351B4] px-6 py-3 rounded-full font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configurar preferências
              </button>
            ) : (
              <button
                onClick={() => setCurrentScreen('home')}
                className="border border-gray-200 text-gray-600 px-6 py-3 rounded-full font-bold hover:bg-gray-50 transition-all"
              >
                Fazer buscas primeiro
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const basedOnMessage = getBasedOnMessage();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Brain className="w-6 h-6 text-[#1351B4]" />
            </div>
            <h1 className="text-2xl font-bold text-[#003157]">Recomendações para você</h1>
          </div>
          <div className="flex flex-col gap-0.5 ml-1">
            {basedOnMessage && (
              <p className="text-gray-400 text-sm">{basedOnMessage}</p>
            )}
            {generatedAt && (
              <p className="text-gray-300 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" /> Gerado em {formatDate(generatedAt)}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm text-sm font-bold text-green-700">
            <Sparkles className="w-4 h-4" />
            <span>{recommendations.length} recomendações</span>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 bg-[#1351B4] hover:bg-[#003157] text-white px-4 py-2 rounded-full text-sm font-bold transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
            title="Gerar novas recomendações com IA"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </button>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#003157] mb-2">Nenhuma recomendação ainda</h3>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">Salve favoritos e faça buscas para receber recomendações personalizadas.</p>
          <button
            onClick={() => setCurrentScreen('home')}
            className="bg-[#1351B4] text-white px-8 py-3 rounded-full font-bold hover:bg-[#003157] transition-all shadow-md"
          >
            Explorar conteúdos
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((item: any) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                    item.type === 'article' ? 'bg-blue-50 text-[#1351B4] border border-blue-100' : 'bg-yellow-50 text-yellow-800 border border-yellow-100'
                  }`}>
                    {item.type === 'article' ? 'Artigo' : 'Livro'}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase bg-gray-100 text-gray-400 border border-gray-200">
                    {item.source}
                  </span>
                </div>
                {item.relevance > 0 && (
                  <div className="flex items-center gap-1 text-green-700 font-bold text-xs bg-green-50 px-2 py-1 rounded-md border border-green-100">
                    <Sparkles className="w-3 h-3" /> {item.relevance}% Relevância
                  </div>
                )}
              </div>

              <h3 className="text-xl font-bold text-[#003157] mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-3">{item.authors} ({item.year})</p>

              {item.aiExplanation && (
                <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-4">
                  <Brain className="w-4 h-4 text-[#1351B4] mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-[#1351B4] font-medium italic">{item.aiExplanation}</p>
                </div>
              )}

              <p className="text-gray-600 text-sm line-clamp-2 mb-5 leading-relaxed italic">{item.abstract}</p>

              <div className="flex gap-3 pt-4 border-t border-gray-50 flex-wrap">
                <button
                  onClick={() => viewDetails(item)}
                  className="bg-[#1351B4] hover:bg-[#003157] text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  Ver Detalhes <ChevronRight className="w-4 h-4" />
                </button>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border border-[#1351B4] text-[#1351B4] hover:bg-blue-50 px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2"
                  >
                    Acessar <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                <button
                  onClick={() => toggleFavorite(item)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isFavorite(item.id) ? 'bg-blue-50 border-[#1351B4] text-[#1351B4]' : 'bg-white border-gray-200 text-gray-400 hover:text-[#1351B4]'
                  }`}
                >
                  <Star className="w-5 h-5" fill={isFavorite(item.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
