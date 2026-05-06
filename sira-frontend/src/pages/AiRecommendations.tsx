import React, { useState, useEffect } from 'react';
import { Sparkles, Brain, LogIn, AlertCircle, RefreshCw, Clock, Settings, BookOpen } from 'lucide-react';
import { getAiRecommendations, refreshAiRecommendations } from '../services/api';
import type { AuthUser } from '../types';
import { RecommendationCardSkeleton } from '../components/RecommendationCardSkeleton';
import { RecommendationCard } from '../components/RecommendationCard';
import { Button } from '../components/ui/Button';

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
          <Brain className="h-14 w-14 text-primary opacity-30 mx-auto mb-5" />
          <h2 className="text-2xl font-bold text-primary-dark mb-3">Recomendações Personalizadas</h2>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">
            Faça login para receber recomendações baseadas nos seus favoritos e histórico de buscas.
          </p>
          <Button
            onClick={() => setCurrentScreen('login')}
            className="mx-auto"
          >
            Fazer Login
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-8 w-64 bg-gray-200 rounded animate-pulse"></div>
            </div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mt-2"></div>
          </div>
        </div>
        <div className="space-y-4">
          <RecommendationCardSkeleton />
          <RecommendationCardSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center animate-fadeIn">
        <div className="bg-white rounded-3xl border border-gray-100 p-12 shadow-sm">
          <AlertCircle className="h-12 w-12 text-amber-400 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-primary-dark mb-2">Não foi possível gerar recomendações</h3>
          <p className="text-gray-500 mb-8 max-w-sm mx-auto">{error}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              onClick={loadRecommendations}
            >
              Tentar novamente
            </Button>
            {isOnboardingError ? (
              <Button
                onClick={() => setCurrentScreen('onboarding')}
                variant="secondary"
                className="flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Configurar preferências
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentScreen('home')}
                variant="secondary"
              >
                Fazer buscas primeiro
              </Button>
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
              <Brain className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-primary-dark">Recomendações para você</h1>
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
          <Button
            onClick={handleRefresh}
            isLoading={isRefreshing}
            variant="primary"
            size="sm"
            className="flex items-center gap-2"
            title="Gerar novas recomendações com IA"
          >
            {!isRefreshing && <RefreshCw className="w-4 h-4" />}
            {isRefreshing ? 'Atualizando...' : 'Atualizar'}
          </Button>
        </div>
      </div>

      {recommendations.length === 0 ? (
        <div className="bg-white rounded-3xl border-2 border-dashed border-gray-100 p-12 text-center">
          <BookOpen className="h-12 w-12 text-gray-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-primary-dark mb-2">Nenhuma recomendação ainda</h3>
          <p className="text-gray-500 mb-8 max-w-xs mx-auto">Salve favoritos e faça buscas para receber recomendações personalizadas.</p>
          <Button
            onClick={() => setCurrentScreen('home')}
            className="mx-auto px-8"
          >
            Explorar conteúdos
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((item: any) => (
            <RecommendationCard 
              key={item.id} 
              item={item} 
              viewDetails={viewDetails} 
              toggleFavorite={toggleFavorite} 
              isFavorite={isFavorite(item.id)} 
            />
          ))}
        </div>
      )}
    </div>
  );
};
