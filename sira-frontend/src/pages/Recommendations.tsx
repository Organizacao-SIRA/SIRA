import React, { useRef } from 'react';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useOutletContext } from 'react-router';
import { UserMessageBubble } from '../components/UserMessageBubble';
import { AiMessageBubble } from '../components/AiMessageBubble';
import { ChatLoadingSkeleton } from '../components/ChatLoadingSkeleton';
import { MaterialsSection } from '../components/MaterialsSection';
import { RegenerateResultsButton } from '../components/RegenerateResultsButton';
import { PageFooter } from '../components/ui/PageFooter';
import { useAuth } from '../contexts/AuthContext';
import { useSearch } from '../contexts/SearchContext';
import { useFavorites } from '../queries/useFavorites';
import type { AppShellOutletContext } from '../routes/AppShell';
import type { CatalogItem } from '../types';

export const Recommendations = () => {
  const { t } = useTranslation('recommendations');
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { isSidebarOpen } = useOutletContext<AppShellOutletContext>();
  const {
    results, aiMessage, searchQuery, setSearchQuery, handleSearch,
    isLoading, isRegenerating, regenerateSearchResults: onRegenerate,
  } = useSearch();
  const containerRef = useRef<HTMLDivElement>(null);

  const viewDetails = (item: CatalogItem) =>
    navigate(`/material/${encodeURIComponent(item.id)}`, { state: { item, from: 'results' } });

  const handleClearSearch = () => {
    setSearchQuery('');
    navigate('/');
  };

  return (
    <div ref={containerRef} className="max-w-[1080px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-0 animate-fadeIn flex flex-col min-h-[calc(100vh-68px)] relative">

      <div className="mb-4 sm:mb-5 flex items-center justify-between gap-3 border-b border-border pb-3">
        <button
          type="button"
          onClick={handleClearSearch}
          className="flex items-center gap-2 text-text hover:text-link transition-colors font-semibold group cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus/40 rounded-md px-1 py-1"
        >
          <ArrowLeft className="w-5 h-5 transition-transform group-hover:-translate-x-0.5" />
          <span className="text-sm">{t('header.newSearch')}</span>
        </button>
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 bg-primary-soft rounded-lg flex-shrink-0">
            <Sparkles className="w-5 h-5 text-link" />
          </div>
          <h1 className="text-base sm:text-xl font-bold text-primary-dark dark:text-text hidden sm:block truncate">{t('header.intelligentSearch')}</h1>
        </div>
      </div>

      <div className="flex-1 space-y-4 sm:space-y-5 pb-32 sm:pb-40">
        <UserMessageBubble message={searchQuery} user={user} />

        {isLoading ? (
          <ChatLoadingSkeleton />
        ) : (
          <AiMessageBubble message={aiMessage}>
            <MaterialsSection
              results={results}
              onRetry={() => handleSearch({ preventDefault: () => {} } as React.FormEvent)}
              isRegenerating={isRegenerating}
              viewDetails={viewDetails}
              toggleFavorite={toggleFavorite}
              isFavorite={isFavorite}
            />
          </AiMessageBubble>
        )}
      </div>

      <PageFooter
        text={t('footer')}
        variant="sticky"
      />

      {results.length > 0 && onRegenerate && (
        <RegenerateResultsButton
          anchorRef={containerRef}
          isLoading={isLoading || isRegenerating}
          isSidebarOpen={isSidebarOpen}
          onClick={onRegenerate}
        />
      )}
    </div>
  );
};
