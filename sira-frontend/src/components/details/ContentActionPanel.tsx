import { useState } from 'react';
import { ExternalLink, Lock, Star, Unlock } from 'lucide-react';
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
  const [imageError, setImageError] = useState(false);
  const showImage = Boolean(item.image) && !imageError;

  return (
    <div className="flex justify-center pb-1">
      {showImage ? (
        <img
          src={item.image!}
          alt={`Capa de ${item.title}`}
          loading="lazy"
          onError={() => setImageError(true)}
          className="w-32 aspect-[2/3] object-contain rounded-lg shadow-md border border-border bg-surface-subtle"
        />
      ) : (
        <MaterialPlaceholder
          type={item.type}
          className="w-32 aspect-[2/3] shadow-md"
          iconClassName="w-12 h-12"
        />
      )}
    </div>
  );
};

const AccessMaterialAction = ({ item }: { item: CatalogItem }) => {
  if (!item.url) {
    return (
      <div
        role="status"
        aria-label="Link de acesso indisponível"
        className="w-full py-3.5 px-4 rounded-xl border border-dashed border-border-strong bg-surface-subtle text-text-muted text-sm font-medium flex items-center justify-center gap-2"
      >
        <Lock className="w-4 h-4" aria-hidden="true" />
        <span>Link de acesso indisponível</span>
      </div>
    );
  }

  if (item.isOpenAccess) {
    return (
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Acessar material gratuitamente: ${item.title} (abre em nova aba)`}
        className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-dark dark:hover:bg-primary text-white font-bold transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
      >
        <Unlock className="w-5 h-5" aria-hidden="true" />
        <span>Acessar Material</span>
      </a>
    );
  }

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Ver material: ${item.title} — pode exigir assinatura (abre em nova aba)`}
      className="w-full py-3.5 px-4 rounded-xl bg-warning-soft border border-warning-border text-warning-strong font-bold transition-all flex items-center justify-center gap-2 shadow-sm hover:brightness-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-warning-border focus-visible:ring-offset-2 active:scale-[0.98]"
    >
      <ExternalLink className="w-5 h-5 shrink-0" aria-hidden="true" />
      <span>Ver Material</span>
    </a>
  );
};

const FavoriteDetailsButton = ({
  isFavorite,
  onToggleFavorite,
}: {
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) => (
  <button
    type="button"
    onClick={onToggleFavorite}
    aria-pressed={isFavorite}
    aria-label={isFavorite ? 'Remover dos favoritos' : 'Salvar nos favoritos'}
    className={`w-full py-3 px-4 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.98] ${
      isFavorite
        ? 'bg-primary border-primary text-white shadow-sm hover:bg-primary-dark hover:border-primary-dark dark:hover:bg-primary dark:hover:border-primary focus-visible:ring-primary'
        : 'bg-surface border-border-strong text-text hover:border-primary hover:text-primary focus-visible:ring-border-strong'
    }`}
  >
    <Star className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} aria-hidden="true" />
    <span>{isFavorite ? 'Salvo nos Favoritos' : 'Salvar nos Favoritos'}</span>
  </button>
);

const ShareActionsDivider = () => (
  <div className="relative py-1">
    <div className="absolute inset-0 flex items-center" aria-hidden="true">
      <div className="w-full border-t border-border" />
    </div>
    <div className="relative flex justify-center">
      <span className="bg-surface px-3 text-[10px] uppercase tracking-widest font-bold text-text-subtle">
        Compartilhar
      </span>
    </div>
  </div>
);

export const ContentActionPanel = ({ item, isFavorite, onToggleFavorite }: ContentActionPanelProps) => {
  return (
    <aside
      aria-label="Ações do material"
      className="bg-surface rounded-2xl border border-border shadow-sm p-5 space-y-4"
    >
      <ContentCoverPreview item={item} />

<div className="space-y-3">
        <AccessMaterialAction item={item} />
        <FavoriteDetailsButton isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} />
      </div>

      <ShareActionsDivider />

      <div className="space-y-3">
        <CitationActionButton item={item} />
        <CopyLinkButton url={item.url} doi={item.doi} />
      </div>
    </aside>
  );
};
