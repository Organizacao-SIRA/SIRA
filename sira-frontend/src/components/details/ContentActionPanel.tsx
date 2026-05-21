import type { CatalogItem } from '../../types';
import { AccessMaterialButton } from './AccessMaterialButton';
import { CitationActionButton } from './CitationActionButton';
import { CopyLinkButton } from './CopyLinkButton';
import { FavoriteActionButton } from './FavoriteActionButton';

interface ContentActionPanelProps {
  item: CatalogItem;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export const ContentActionPanel = ({ item, isFavorite, onToggleFavorite }: ContentActionPanelProps) => (
  <section
    aria-label="Ações do material"
    className="bg-surface rounded-2xl border border-border shadow-sm p-4 sm:p-5 space-y-3"
  >
    <AccessMaterialButton url={item.url} title={item.title} />
    <FavoriteActionButton isFavorite={isFavorite} onToggle={onToggleFavorite} />
    <div className="pt-3 border-t border-border space-y-3">
      <CitationActionButton item={item} />
      <CopyLinkButton url={item.url} doi={item.doi} />
    </div>
  </section>
);
