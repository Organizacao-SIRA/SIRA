import React, { useState, useEffect } from 'react';
import { Brain, LogIn, AlertCircle, RefreshCw, Clock, BookOpen } from 'lucide-react';
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
  isChatMode?: boolean;
}

export const AiRecommendations = ({
  user, viewDetails, toggleFavorite, isFavorite, setCurrentScreen, isChatMode
}: AiRecommendationsProps) => {
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

  const getBasedOnMessage = () => {
    if (!basedOn) return null;
    const parts: string[] = [];
    if (basedOn.favorites > 0) parts.push(`${basedOn.favorites} favs`);
    if (basedOn.searches > 0) parts.push(`${basedOn.searches} buscas`);
    if (basedOn.preferences) parts.push('perfil');
    if (parts.length === 0) return null;
    return `Baseado em: ${parts.join(' + ')}`;
  };

  if (!user) {
    return (
      <div className="bg-surface rounded-3xl border border-border p-10 text-center shadow-sm">
        <LogIn className="h-10 w-10 text-primary opacity-20 mx-auto mb-4" />
        <p className="text-text-muted text-sm mb-6">Faça login para ver suas recomendações.</p>
        <Button onClick={() => setCurrentScreen('login')} size="sm">Entrar</Button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <RecommendationCardSkeleton />
        <RecommendationCardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-surface rounded-2xl border border-danger-border p-8 text-center">
        <AlertCircle className="h-8 w-8 text-danger-strong mx-auto mb-3" />
        <p className="text-text-muted text-xs mb-4">{error}</p>
        <Button onClick={loadRecommendations} size="sm" variant="secondary">Tentar novamente</Button>
      </div>
    );
  }

  const basedOnMessage = getBasedOnMessage();

  if (isChatMode) {
    return (
      <div className="space-y-4 animate-fadeIn">
        {recommendations.length === 0 ? (
          <div className="bg-surface-muted rounded-2xl border border-dashed border-border-strong p-10 text-center">
            <BookOpen className="h-8 w-8 text-text-subtle mx-auto mb-3" />
            <p className="text-text-subtle text-xs">Explore o catálogo ou faça buscas para gerar sugestões.</p>
          </div>
        ) : (
          <>
            {recommendations.map((item: any) => (
              <RecommendationCard
                key={item.id}
                item={item}
                viewDetails={viewDetails}
                toggleFavorite={toggleFavorite}
                isFavorite={isFavorite(item.id)}
              />
            ))}
            <div className="flex items-center justify-between pt-2 px-1">
              <div className="flex items-center gap-3">
                {basedOnMessage && <span className="text-[9px] font-bold text-text-subtle uppercase tracking-tighter">{basedOnMessage}</span>}
                {generatedAt && <span className="text-[9px] font-medium text-text-subtle flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {formatDate(generatedAt)}</span>}
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors flex items-center gap-1 uppercase tracking-wider"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Atualizando...' : 'Novas Sugestões'}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-8 gap-4">
        <h1 className="text-2xl font-bold text-primary-dark dark:text-text flex items-center gap-2">
          <Brain className="w-6 h-6 text-primary" /> Recomendações
        </h1>
        <Button onClick={handleRefresh} isLoading={isRefreshing} size="sm" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" /> Atualizar
        </Button>
      </div>

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
    </div>
  );
};
