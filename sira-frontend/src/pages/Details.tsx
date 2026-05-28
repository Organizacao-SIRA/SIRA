import type { CatalogItem } from '../types';
import { ContentBreadcrumb } from '../components/details/ContentBreadcrumb';
import { ContentHero } from '../components/details/ContentHero';
import { AcademicSummarySection } from '../components/details/AcademicSummarySection';
import { SiraAnalysisCard } from '../components/ui/SiraAnalysisCard';
import { ContentActionPanel } from '../components/details/ContentActionPanel';
import { ContentNotFoundState } from '../components/details/ContentNotFoundState';

interface DetailsProps {
  item: CatalogItem | null;
  setCurrentScreen: (screen: string) => void;
  previousScreen: string;
  toggleFavorite: (item: CatalogItem) => void;
  isFavorite: (id: string) => boolean;
}

export const Details = ({
  item,
  setCurrentScreen,
  previousScreen,
  toggleFavorite,
  isFavorite,
}: DetailsProps) => {
  if (!item) {
    return <ContentNotFoundState onBack={() => setCurrentScreen('home')} />;
  }

  const handleBack = () => setCurrentScreen(previousScreen || 'home');
  const handleToggleFavorite = () => toggleFavorite(item);
  const favorited = isFavorite(item.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-[calc(100vh-68px)] animate-fadeIn">
      <ContentBreadcrumb
        previousScreen={previousScreen}
        title={item.title}
        onBack={handleBack}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10">
        <article className="lg:col-span-8 space-y-8 sm:space-y-10 min-w-0">
          <ContentHero
            type={item.type}
            title={item.title}
            authors={item.authors}
            year={item.year}
            source={item.source}
            provider={item.provider}
            isOpenAccess={item.isOpenAccess}
          />

          {item.aiExplanation && (
            <SiraAnalysisCard explanation={item.aiExplanation} />
          )}

          <AcademicSummarySection
            abstract={item.abstract}
            keywords={item.keywords}
          />
        </article>

        <aside className="lg:col-span-4 lg:sticky lg:top-6 lg:self-start">
          <ContentActionPanel
            item={item}
            isFavorite={favorited}
            onToggleFavorite={handleToggleFavorite}
          />
        </aside>
      </div>
    </div>
  );
};
