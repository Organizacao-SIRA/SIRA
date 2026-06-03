import { useTranslation } from 'react-i18next';
import type { CatalogItem } from '../types';
import { ContentBreadcrumb } from '../components/details/ContentBreadcrumb';
import { ContentHero } from '../components/details/ContentHero';
import { AcademicSummarySection } from '../components/details/AcademicSummarySection';
import { SiraAnalysisCard } from '../components/ui/SiraAnalysisCard';
import {
  ContentActionPanel,
  ContentCoverPreview,
  ContentPrimaryActions,
  ContentSecondaryActions,
} from '../components/details/ContentActionPanel';
import { ContentNotFoundState } from '../components/details/ContentNotFoundState';

interface DetailsProps {
  item: CatalogItem | null;
  onBack: () => void;
  previousScreen: string;
  toggleFavorite: (item: CatalogItem) => void;
  isFavorite: (id: string) => boolean;
}

export const Details = ({
  item,
  onBack,
  previousScreen,
  toggleFavorite,
  isFavorite,
}: DetailsProps) => {
  const { t } = useTranslation('details');

  if (!item) {
    return <ContentNotFoundState onBack={onBack} />;
  }

  const handleToggleFavorite = () => toggleFavorite(item);
  const favorited = isFavorite(item.id);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-[calc(100vh-68px)] animate-fadeIn">
      <ContentBreadcrumb
        previousScreen={previousScreen}
        title={item.title}
        onBack={onBack}
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

          <section
            aria-label={t('actions.panelLabel')}
            className="lg:hidden sira-card rounded-2xl p-4"
          >
            <div className="flex items-start gap-4">
              <ContentCoverPreview item={item} variant="compact" />
              <div className="min-w-0 flex-1">
                <ContentPrimaryActions
                  item={item}
                  isFavorite={favorited}
                  onToggleFavorite={handleToggleFavorite}
                />
              </div>
            </div>
          </section>

          {item.aiExplanation && (
            <SiraAnalysisCard explanation={item.aiExplanation} />
          )}

          <AcademicSummarySection
            abstract={item.abstract}
            keywords={item.keywords}
          />

          <section
            aria-label={t('actions.share')}
            className="lg:hidden sira-card rounded-2xl p-4 space-y-4"
          >
            <ContentSecondaryActions item={item} />
          </section>
        </article>

        <aside className="hidden lg:block lg:col-span-4 lg:sticky lg:top-6 lg:self-start">
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
