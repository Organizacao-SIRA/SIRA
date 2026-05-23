import React, { useState, useEffect } from 'react';
import { Brain, LogIn, AlertCircle, RefreshCw, Clock, BookOpen, ChevronDown, ChevronUp, Sparkles, Search } from 'lucide-react';
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
  const [coldStart, setColdStart] = useState(false);
  const [chatExpanded, setChatExpanded] = useState(false);
  const CHAT_PREVIEW_COUNT = 2;

  useEffect(() => {
    if (user) loadRecommendations();
  }, [user]);

  const loadRecommendations = async () => {
    setIsLoading(true);
    setError('');
    setColdStart(false);
    try {
      const data = await getAiRecommendations();
      if (data.coldStart) { setColdStart(true); return; }
      setRecommendations(data.recommendations);
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
    setColdStart(false);
    try {
      const data = await refreshAiRecommendations();
      if (data.coldStart) { setColdStart(true); setIsRefreshing(false); return; }
      setRecommendations(data.recommendations);
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

  if (coldStart) {
    if (isChatMode) {
      return (
        <div className="bg-surface-muted rounded-2xl border border-dashed border-border-strong p-6 text-center space-y-3">
          <Sparkles className="h-6 w-6 text-primary opacity-40 mx-auto" />
          <p className="text-text-subtle text-xs">Configure suas preferências ou explore o catálogo para receber sugestões personalizadas.</p>
          <button
            type="button"
            onClick={() => setCurrentScreen('onboarding')}
            className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-wider"
          >
            Configurar preferências
          </button>
        </div>
      );
    }
    return (
      <div className="bg-surface rounded-2xl border border-border p-8 text-center space-y-4">
        <Sparkles className="h-10 w-10 text-primary opacity-40 mx-auto" />
        <div>
          <p className="font-semibold text-text mb-1">Suas recomendações estão esperando</p>
          <p className="text-text-muted text-sm">Configure seu perfil ou explore o catálogo para que a IA possa personalizar sugestões para você.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button onClick={() => setCurrentScreen('onboarding')} size="sm">
            <Sparkles className="w-4 h-4" /> Configurar preferências
          </Button>
          <Button onClick={() => setCurrentScreen('home')} size="sm" variant="secondary">
            <Search className="w-4 h-4" /> Explorar catálogo
          </Button>
        </div>
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
            {(chatExpanded ? recommendations : recommendations.slice(0, CHAT_PREVIEW_COUNT)).map((item: any) => (
              <RecommendationCard
                key={item.id}
                item={item}
                viewDetails={viewDetails}
                toggleFavorite={toggleFavorite}
                isFavorite={isFavorite(item.id)}
              />
            ))}
            {recommendations.length > CHAT_PREVIEW_COUNT && (
              <button
                type="button"
                onClick={() => setChatExpanded(v => !v)}
                className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold text-primary hover:text-primary-dark transition-colors uppercase tracking-wider py-1"
              >
                {chatExpanded ? (
                  <><ChevronUp className="w-3 h-3" /> Ver menos</>
                ) : (
                  <><ChevronDown className="w-3 h-3" /> Ver mais ({recommendations.length - CHAT_PREVIEW_COUNT})</>
                )}
              </button>
            )}
            <div className="flex items-center justify-between pt-2 px-1">
              <div className="flex items-center gap-3">
                {basedOnMessage && <span className="text-[9px] font-bold text-text-subtle uppercase tracking-tighter">{basedOnMessage}</span>}
                {generatedAt && <span className="text-[9px] font-medium text-text-subtle flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {formatDate(generatedAt)}</span>}
              </div>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-[10px] font-bold text-primary hover:text-primary-dark transition-colors duration-150 flex items-center gap-1 uppercase tracking-wider cursor-pointer focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none"
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
        <Button onClick={handleRefresh} isLoading={isRefreshing} size="sm">
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
