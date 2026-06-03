import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import { BookOpenCheck, Lock, Unlock } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { StatusBadge } from './ui/StatusBadge';
import { MaterialTypeBadge } from './ui/MaterialTypeBadge';
import { FavoriteButton } from './ui/FavoriteButton';
import { MaterialPlaceholder } from './ui/MaterialPlaceholder';
import { SiraAnalysisCard } from './ui/SiraAnalysisCard';
import { trackRecommendationEvent } from '../services/api';

// -------------------------------------------------------------------------
// Access indicator — derives all visual config from a single source of truth
// -------------------------------------------------------------------------

type AccessConfig = {
  Icon: LucideIcon;
  label: string;
  classes: string;
  short: string;
  full: string;
};

const ACCESS_STYLES = {
  open:       'bg-success-soft text-success-strong border-success-border',
  restricted: 'bg-warning-soft text-warning-strong border-warning-border',
} as const;

const getAccessConfig = (isOpenAccess: boolean | undefined, translate: (key: string) => string): AccessConfig | null => {
  if (isOpenAccess === undefined) return null;
  return {
    Icon:    isOpenAccess ? Unlock : Lock,
    label:   isOpenAccess ? translate('access.open') : translate('access.restricted'),
    classes: isOpenAccess ? ACCESS_STYLES.open : ACCESS_STYLES.restricted,
    short:   isOpenAccess ? translate('access.openShort') : translate('access.restrictedShort'),
    full:    isOpenAccess ? translate('access.openFull') : translate('access.restrictedFull'),
  };
};

/**
 * Full-width strip — structural row that lives at the bottom of a thumbnail
 * frame. Never absolutely positioned, so its background sits on the parent's
 * surface (no image bleeding through, no "floating" feel).
 *
 * - `position`: 'middle' adds a bottom border (separator before sibling content);
 *               'bottom' sits at the frame edge where the parent's border closes
 *               the visual.
 * - `compact`:  short label + tighter spacing, for narrow thumbnails (~64-96px).
 */
const AccessStrip = ({
  isOpenAccess,
  position,
  compact = false,
}: {
  isOpenAccess?: boolean;
  position: 'middle' | 'bottom';
  compact?: boolean;
}) => {
  const { t } = useTranslation('common');
  const cfg = getAccessConfig(isOpenAccess, t);
  if (!cfg) return null;

  const sizing = compact
    ? 'gap-1 py-0.5 px-1 text-[9px]'
    : 'gap-1.5 py-1.5 px-2 text-[10px]';
  const iconSize  = compact ? 'w-2.5 h-2.5' : 'w-3 h-3';
  const borderCls = position === 'middle' ? 'border-b' : '';

  return (
    <div
      role="status"
      aria-label={cfg.label}
      className={`flex items-center justify-center font-bold uppercase ${sizing} ${borderCls} ${cfg.classes}`}
    >
      <cfg.Icon className={`${iconSize} shrink-0`} aria-hidden="true" />
      <span className="whitespace-nowrap">{compact ? cfg.short : cfg.full}</span>
    </div>
  );
};

// -------------------------------------------------------------------------
// Card
// -------------------------------------------------------------------------

type Variant = 'horizontal' | 'vertical';
type AnalysisSlot = 'auto' | 'reserved';

interface RecommendationCardProps {
  item: any;
  viewDetails: (item: any) => void;
  toggleFavorite: (item: any) => void;
  isFavorite: boolean;
  variant?: Variant;
  trackEvents?: boolean;
  stretch?: boolean;
  analysisSlot?: AnalysisSlot;
}

export const RecommendationCard = ({
  item,
  viewDetails,
  toggleFavorite,
  isFavorite,
  variant = 'horizontal',
  trackEvents = true,
  stretch = true,
  analysisSlot = 'auto',
}: RecommendationCardProps) => {
  const { t } = useTranslation('common');
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const impressionFired = useRef(false);
  const showImage = Boolean(item.image) && !imageError;
  const isVertical = variant === 'vertical';
  const hasAccessInfo = item.isOpenAccess !== undefined;
  const shouldShowAnalysisSlot = Boolean(item.aiExplanation) || analysisSlot === 'reserved';

  useEffect(() => {
    if (!trackEvents) return;
    const el = cardRef.current;
    if (!el || impressionFired.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !impressionFired.current) {
          impressionFired.current = true;
          trackRecommendationEvent(item.id, 'impression');
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [item.id, trackEvents]);

  const handleCardClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    if ((e.target as HTMLElement).closest('button, a, input, select, textarea')) return;
    if (trackEvents) trackRecommendationEvent(item.id, 'click');
    viewDetails(item);
  };

  const handleFavoriteToggle = () => {
    if (trackEvents && !isFavorite) trackRecommendationEvent(item.id, 'favorite');
    toggleFavorite(item);
  };

  // Cover keeps no visual chrome of its own — the parent thumbnail wrapper
  // (vertical: the fixed-height frame; horizontal: the rounded container)
  // owns rounded corners, border and shadow so the access strip can sit flush.
  const cover = showImage ? (
    <img
      src={item.image}
      alt={t('materialCard.coverAlt', { title: item.title })}
      loading="lazy"
      onError={() => setImageError(true)}
      className={
        isVertical
          ? 'w-full h-full object-contain bg-surface-subtle'
          : 'w-full aspect-[2/3] object-contain bg-surface-subtle'
      }
    />
  ) : (
    <MaterialPlaceholder
      type={item.type}
      className={
        isVertical
          ? 'w-full h-full rounded-none border-0'
          : 'w-full aspect-[2/3] rounded-none border-0'
      }
      iconClassName="w-14 h-14 sm:w-16 sm:h-16"
    />
  );

  const content = (
    <div className="flex-1 min-w-0 flex flex-col gap-1.5 sm:gap-2">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap min-w-0">
          <MaterialTypeBadge type={item.type} />
          {item.provider && (
            <span className="hidden sm:inline-flex">
              <StatusBadge variant="neutral">{item.provider}</StatusBadge>
            </span>
          )}
        </div>
        <FavoriteButton isFavorite={isFavorite} onToggle={handleFavoriteToggle} size="sm" />
      </div>

      <h3 className={`font-bold text-primary-dark dark:text-text leading-snug line-clamp-2 break-words ${
        isVertical
          ? 'text-[15px] sm:text-lg min-h-[2.6rem] sm:min-h-[3.1rem]'
          : 'text-base sm:text-xl min-h-[2.75rem] sm:min-h-[3.5rem]'
      }`}>
        {item.title}
      </h3>

      {item.aiExplanation && (
        <SiraAnalysisCard explanation={item.aiExplanation} size="compact" />
      )}

      {!item.aiExplanation && shouldShowAnalysisSlot && (
        <aside
          aria-label={t('materialCard.sourceLabel')}
          className="bg-surface-subtle border-l-4 border-border-strong rounded-r-md px-2.5 py-1.5 sm:px-3 sm:py-2 min-h-[4.75rem] min-w-0"
        >
          <div className="flex items-center gap-1.5 mb-1">
            <BookOpenCheck className="w-3.5 h-3.5 shrink-0 text-text-subtle" aria-hidden="true" />
            <span className="font-bold uppercase tracking-wider text-text-subtle text-[10px]">
              {t('materialCard.catalogSource')}
            </span>
          </div>
          <p className="text-xs leading-snug text-text-muted line-clamp-2 break-words min-w-0">
            {t('materialCard.savedWithoutAi')}
          </p>
        </aside>
      )}

      {item.abstract && (
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed line-clamp-2 italic break-words">
          {item.abstract}
        </p>
      )}

      <div className="flex items-baseline gap-1.5 mt-auto pt-1 text-xs text-text-subtle min-w-0">
        <span className="font-medium text-text-muted truncate min-w-0">{item.authors}</span>
        <span aria-hidden="true" className="shrink-0">·</span>
        <span className="shrink-0">{item.year}</span>
      </div>
    </div>
  );

  // Vertical: cover -> [optional access strip] -> content
  // The strip is a STRUCTURAL row (not absolute), so its background sits on
  // bg-surface — translucent dark-mode tokens stay readable, no image bleeding
  // through, no "floating" feel. Cover only carries its own border when the
  // strip is absent (otherwise the strip provides the separator).
  const verticalLayout = (
    <>
      <div
        className={`h-40 sm:h-44 overflow-hidden bg-surface-subtle flex items-center justify-center ${
          hasAccessInfo ? '' : 'border-b border-border'
        }`}
      >
        {cover}
      </div>
      <AccessStrip isOpenAccess={item.isOpenAccess} position="middle" />
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col min-w-0">{content}</div>
    </>
  );

  // Horizontal: thumbnail + content row. The thumbnail is a self-contained
  // rounded frame that owns its border/shadow and clips the strip flush to
  // its bottom edge — the strip belongs to the thumbnail, not to the card.
  const horizontalLayout = (
    <div className="flex gap-3 sm:gap-4 min-w-0">
      <div className="shrink-0 self-start w-28 sm:w-40 rounded-lg overflow-hidden border border-border shadow-sm bg-surface-subtle">
        {cover}
        <AccessStrip isOpenAccess={item.isOpenAccess} position="bottom" />
      </div>
      {content}
    </div>
  );

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      aria-label={t('materialCard.viewDetails', { title: item.title })}
      onClick={handleCardClick}
      onKeyDown={e => {
        if (e.key !== 'Enter' && e.key !== ' ') return;
        if (e.target !== e.currentTarget) return;
        e.preventDefault();
        handleCardClick(e);
      }}
      className={`sira-card sira-card-hover rounded-2xl hover:scale-[1.015] animate-fadeIn cursor-pointer group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus overflow-hidden min-w-0 ${
        isVertical ? `flex flex-col ${stretch ? 'h-full' : ''}` : 'p-3.5 sm:p-5'
      }`}
    >
      {isVertical ? verticalLayout : horizontalLayout}
    </div>
  );
};
