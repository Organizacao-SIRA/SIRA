import { useState } from 'react';
import { ExternalLink, Lock, Star, Unlock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { CatalogItem } from '../../types';
import { MaterialPlaceholder } from '../ui/MaterialPlaceholder';
import { CitationActionButton } from './CitationActionButton';
import { CopyLinkButton } from './CopyLinkButton';

interface ContentActionPanelProps {
  item: CatalogItem;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const ContentCoverPreview = ({ item }: { item: CatalogItem }) => {
  const { t } = useTranslation('details');
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(item.image) && !imageError;

  return (
    <div className="flex h-52 items-center justify-center pb-1">
      {showImage ? (
        <img
          src={item.image!}
          alt={t('actions.coverAlt', { title: item.title })}
          loading="lazy"
          onError={() => setImageError(true)}
          className="h-48 w-32 object-contain rounded-lg shadow-md border border-border bg-surface-subtle"
        />
      ) : (
        <MaterialPlaceholder
          type={item.type}
          className="h-48 w-32 shadow-md"
          iconClassName="w-12 h-12"
        />
      )}
    </div>
  );
};

const AccessMaterialAction = ({ item }: { item: CatalogItem }) => {
  const { t } = useTranslation('details');

  if (!item.url) {
    return (
      <div
        role="status"
        aria-label={t('actions.unavailableLinkLabel')}
        className="w-full min-h-[52px] px-4 py-3 rounded-xl border border-dashed border-border-strong bg-surface-subtle text-text-muted text-sm font-medium flex items-center justify-center gap-2 text-center"
      >
        <Lock className="w-4 h-4" aria-hidden="true" />
        <span>{t('actions.unavailableLink')}</span>
      </div>
    );
  }

  if (item.isOpenAccess) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t('actions.accessFreeLabel', { title: item.title })}
        className="w-full min-h-[52px] px-4 py-3 rounded-xl bg-primary hover:bg-primary-dark dark:hover:bg-primary text-white font-bold transition-all flex items-center justify-center gap-2 text-center shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
      >
        <Unlock className="w-5 h-5" aria-hidden="true" />
        <span>{t('actions.accessFree')}</span>
      </a>
    );
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t('actions.viewRestrictedLabel', { title: item.title })}
      className="w-full min-h-[52px] px-4 py-3 rounded-xl bg-warning-soft border border-warning-border text-warning-strong font-bold transition-all flex items-center justify-center gap-2 text-center shadow-sm hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-border focus-visible:ring-offset-2 active:scale-[0.98]"
    >
      <ExternalLink className="w-5 h-5 shrink-0" aria-hidden="true" />
      <span>{t('actions.viewRestricted')}</span>
    </a>
  );
};

const FavoriteDetailsButton = ({
  isFavorite,
  onToggleFavorite,
}: {
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) => {
  const { t } = useTranslation('details');

  return (
    <button
      type="button"
      onClick={onToggleFavorite}
      aria-pressed={isFavorite}
      aria-label={isFavorite ? t('actions.removeFavoriteLabel') : t('actions.saveFavoriteLabel')}
      className={`w-full min-h-[52px] px-4 py-3 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 text-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] ${
        isFavorite
          ? 'bg-primary border-primary text-white shadow-sm hover:bg-primary-dark hover:border-primary-dark dark:hover:bg-primary dark:hover:border-primary focus-visible:ring-primary'
          : 'bg-surface border-border-strong text-text hover:border-primary hover:text-primary focus-visible:ring-border-strong'
      }`}
    >
      <Star className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
      <span>{isFavorite ? t('actions.savedFavorite') : t('actions.saveFavorite')}</span>
    </button>
  );
};

const ShareActionsDivider = () => {
  const { t } = useTranslation('details');

  return (
    <div className="relative py-1">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-surface px-3 text-[10px] uppercase tracking-widest font-bold text-text-subtle">
          {t('actions.share')}
        </span>
      </div>
    </div>
  );
};

export const ContentActionPanel = ({ item, isFavorite, onToggleFavorite }: ContentActionPanelProps) => {
  const { t } = useTranslation('details');

  return (
    <aside
      aria-label={t('actions.panelLabel')}
      className="bg-surface rounded-2xl border border-border shadow-sm p-5 space-y-4 lg:min-h-[496px]"
    >
      <ContentCoverPreview item={item} />

      <div className="space-y-3">
        <AccessMaterialAction item={item} />
        <FavoriteDetailsButton isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
      </div>

      <ShareActionsDivider />

      <div className="space-y-3">
        <div className="min-h-[52px]">
          <CitationActionButton item={item} />
        </div>
        <div className="min-h-[52px]">
          <CopyLinkButton url={item.url} doi={item.doi} />
        </div>
      </div>
    </aside>
  );
};
