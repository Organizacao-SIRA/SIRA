import type { CatalogItem } from '../types';
import { ContentBreadcrumb } from '../components/details/ContentBreadcrumb';
import { ContentHero } from '../components/details/ContentHero';
import { ContentMetadataGrid } from '../components/details/ContentMetadataGrid';
import { AcademicSummarySection } from '../components/details/AcademicSummarySection';
import { SiraAnalysisCard } from '../components/details/SiraAnalysisCard';
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
    <main
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-[calc(100vh-68px)] animate-fadeIn"
      aria-labelledby="content-title"
    >
      <ContentBreadcrumb
        previousScreen={previousScreen}
        title={item.title}
        onBack={handleBack}
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        <article className="lg:col-span-8 space-y-6 sm:space-y-8 min-w-0">
          <div id="content-title">
            <ContentHero
              type={item.type}
              title={item.title}
              authors={item.authors}
              year={item.year}
              source={item.source}
            />
          </div>

          <ContentMetadataGrid
            doi={item.doi}
            isbn={item.isbn}
            thematicArea={item.thematicArea}
          />

          <AcademicSummarySection
            abstract={item.abstract}
            keywords={item.keywords}
          />
        </article>

        <aside className="lg:col-span-4 space-y-6 lg:sticky lg:top-6 lg:self-start">
          <SiraAnalysisCard
            explanation={item.aiExplanation}
            relevance={item.relevance}
          />
          <ContentActionPanel
            item={item}
            isFavorite={favorited}
            onToggleFavorite={handleToggleFavorite}
          />
        </aside>
      </div>
    </main>
  );
};
