import { useState } from 'react';
import { Brain, LogIn, RefreshCw, Clock, BookOpen, ChevronDown, ChevronUp, Sparkles, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from '../toast';
import { useRecommendations, useRefreshRecommendations } from '../queries/useRecommendations';
import type { AuthUser, CatalogItem } from '../types';
import { RecommendationCardSkeleton } from '../components/RecommendationCardSkeleton';
import { RecommendationCard } from '../components/RecommendationCard';
import { Button } from '../components/ui/Button';
import { ViewModeToggle } from '../components/ui/ViewModeToggle';
import { ErrorState } from '../components/ui/ErrorState';
import { useViewMode } from '../hooks/useViewMode';
import { useIsMobile } from '../hooks/useIsMobile';

interface AiRecommendationsProps {
  user: AuthUser | null;
  viewDetails: (item: CatalogItem) => void;
  toggleFavorite: (item: CatalogItem) => void;
  isFavorite: (id: string) => boolean;
  setCurrentScreen: (screen: string) => void;
  isChatMode?: boolean;
}

export const AiRecommendations = ({
  user, viewDetails, toggleFavorite, isFavorite, setCurrentScreen, isChatMode
}: AiRecommendationsProps) => {
  const { t, i18n } = useTranslation(['recommendations', 'common']);
  const [chatExpanded, setChatExpanded] = useState(false);
  const CHAT_PREVIEW_COUNT = 2;

  const { mode: viewMode, setMode: setViewMode } = useViewMode('ai-recommendations', 'horizontal');
  const isMobile = useIsMobile();
  const userId = user?.id;

  const { data, isLoading, error, refetch } = useRecommendations(!!userId);
  const refresh = useRefreshRecommendations();
  const isRefreshing = refresh.isPending;

  const recommendations: CatalogItem[] = data?.recommendations ?? [];
  const basedOn = data?.basedOn ?? null;
  const generatedAt = data?.generatedAt ?? null;
  const coldStart = data?.coldStart ?? false;

  const effectiveVariant: 'horizontal' | 'vertical' = isChatMode
    ? 'horizontal'
    : isMobile
      ? 'vertical'
      : viewMode;

  const handleRefresh = () => {
    refresh.mutate(undefined, {
      // Refresh falhou: mantém a lista atual visível e notifica via toast.
      onError: (err) =>
        toast.error(err instanceof Error ? err.message : t('common:errors.recommendationsRefresh')),
    });
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString(i18n.language, {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const getBasedOnMessage = () => {
    if (!basedOn) return null;
    const parts: string[] = [];
    if (basedOn.favorites > 0) parts.push(t('ai.basedOnFavorites', { count: basedOn.favorites }));
    if (basedOn.searches > 0) parts.push(t('ai.basedOnSearches', { count: basedOn.searches }));
    if (basedOn.preferences) parts.push(t('ai.basedOnProfile'));
    if (parts.length === 0) return null;
    return `${t('ai.basedOn')}: ${parts.join(' + ')}`;
  };

  if (!user) {
    return (
      <div className="sira-card rounded-2xl p-10 text-center">
        <LogIn className="h-10 w-10 text-link opacity-60 mx-auto mb-4" />
        <p className="text-text-muted text-sm mb-6">{t('ai.loginPrompt')}</p>
        <Button onClick={() => setCurrentScreen('login')} size="sm">{t('common:actions.signIn')}</Button>
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
        <div className="sira-card-muted rounded-2xl border-dashed border-border-strong p-6 text-center space-y-3">
          <Sparkles className="h-6 w-6 text-link opacity-70 mx-auto" />
          <p className="text-text-subtle text-xs">{t('ai.coldStartChat')}</p>
          <button
            type="button"
            onClick={() => setCurrentScreen('onboarding')}
            className="text-[10px] font-bold text-link hover:text-link-hover transition-colors uppercase tracking-wider cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 rounded px-1 py-0.5"
          >
            {t('actions.configurePreferences')}
          </button>
        </div>
      );
    }
    return (
      <div className="sira-card rounded-2xl p-8 text-center space-y-4">
        <Sparkles className="h-10 w-10 text-link opacity-70 mx-auto" />
        <div>
          <p className="font-semibold text-text mb-1">{t('ai.coldStartTitle')}</p>
          <p className="text-text-muted text-sm">{t('ai.coldStartDescription')}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button onClick={() => setCurrentScreen('onboarding')} size="sm">
            <Sparkles className="w-4 h-4" /> {t('actions.configurePreferences')}
          </Button>
          <Button onClick={() => setCurrentScreen('home')} size="sm" variant="secondary">
            <Search className="w-4 h-4" /> {t('actions.exploreCatalog')}
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <ErrorState
        message={error.message || t('common:errors.recommendationsLoad')}
        onRetry={() => refetch()}
        className="rounded-2xl"
      />
    );
  }

  const basedOnMessage = getBasedOnMessage();

  if (isChatMode) {
    return (
      <div className="space-y-4 animate-fadeIn">
        {recommendations.length === 0 ? (
          <div className="sira-card-muted rounded-2xl border-dashed border-border-strong p-10 text-center">
            <BookOpen className="h-8 w-8 text-text-subtle mx-auto mb-3" />
            <p className="text-text-subtle text-xs">{t('ai.emptyChat')}</p>
          </div>
        ) : (
          <>
            {(chatExpanded ? recommendations : recommendations.slice(0, CHAT_PREVIEW_COUNT)).map((item) => (
              <RecommendationCard
                key={item.id}
                item={item}
                viewDetails={viewDetails}
                toggleFavorite={toggleFavorite}
                isFavorite={isFavorite(item.id)}
                variant="horizontal"
              />
            ))}
            {recommendations.length > CHAT_PREVIEW_COUNT && (
              <button
                type="button"
                onClick={() => setChatExpanded(v => !v)}
                aria-expanded={chatExpanded}
                className="w-full flex items-center justify-center gap-1.5 text-[10px] font-bold text-link hover:text-link-hover transition-colors uppercase tracking-wider py-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 rounded-md"
              >
                {chatExpanded ? (
                  <><ChevronUp className="w-3 h-3" /> {t('actions.showLess')}</>
                ) : (
                  <><ChevronDown className="w-3 h-3" /> {t('actions.showMore')} ({recommendations.length - CHAT_PREVIEW_COUNT})</>
                )}
              </button>
            )}
            <div className="flex items-center justify-between pt-2 px-1">
              <div className="flex items-center gap-3">
                {basedOnMessage && <span className="text-[9px] font-bold text-text-subtle uppercase tracking-tighter">{basedOnMessage}</span>}
                {generatedAt && <span className="text-[9px] font-medium text-text-subtle flex items-center gap-1"><Clock className="w-2.5 h-2.5" /> {formatDate(generatedAt)}</span>}
              </div>
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-[10px] font-bold text-link hover:text-link-hover transition-colors duration-150 flex items-center gap-1 uppercase tracking-wider cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 rounded px-1 py-0.5 disabled:opacity-50 disabled:pointer-events-none"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? t('actions.refreshing') : t('actions.regenerateShort')}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="flex justify-between items-center mb-8 gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-primary-dark dark:text-text flex items-center gap-2">
          <Brain className="w-6 h-6 text-link" /> {t('ai.title')}
        </h1>
        <div className="flex items-center gap-3">
          {!isMobile && (
            <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          )}
          <Button onClick={handleRefresh} isLoading={isRefreshing} size="sm">
            <RefreshCw className="w-4 h-4" /> {t('actions.update')}
          </Button>
        </div>
      </div>

      <div
        className={
          effectiveVariant === 'vertical'
            ? 'grid grid-cols-[repeat(auto-fit,minmax(min(100%,18rem),1fr))] gap-4 sm:gap-5'
            : 'space-y-4'
        }
      >
        {recommendations.map((item) => (
          <RecommendationCard
            key={item.id}
            item={item}
            viewDetails={viewDetails}
            toggleFavorite={toggleFavorite}
            isFavorite={isFavorite(item.id)}
            variant={effectiveVariant}
          />
        ))}
      </div>
    </div>
  );
};
