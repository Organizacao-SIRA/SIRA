import { useEffect, useState, type RefObject } from 'react';
import { RefreshCw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/Button';

interface RegenerateResultsButtonProps {
  anchorRef: RefObject<HTMLDivElement | null>;
  isLoading?: boolean;
  isSidebarOpen?: boolean;
  onClick: () => void;
}

export const RegenerateResultsButton = ({
  anchorRef,
  isLoading = false,
  isSidebarOpen,
  onClick,
}: RegenerateResultsButtonProps) => {
  const { t } = useTranslation('recommendations');
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const buttonWidth = 52;
      const gap = window.innerWidth >= 640 ? 16 : 0;
      const viewportPadding = window.innerWidth >= 640 ? 16 : 12;
      const desiredLeft = rect.right + gap;
      const maxLeft = window.innerWidth - buttonWidth - viewportPadding;
      const nextLeft = Math.min(desiredLeft, maxLeft);

      setLeft(current => current === nextLeft ? current : nextLeft);
    };

    let frame = 0;
    const trackLayoutTransition = (stopAt: number) => {
      updatePosition();

      if (performance.now() < stopAt) {
        frame = requestAnimationFrame(() => trackLayoutTransition(stopAt));
      }
    };

    updatePosition();
    frame = requestAnimationFrame(() => trackLayoutTransition(performance.now() + 360));
    window.addEventListener('resize', updatePosition);

    const observer = new ResizeObserver(updatePosition);
    const anchor = anchorRef.current;
    if (anchor) observer.observe(anchor);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', updatePosition);
      observer.disconnect();
    };
  }, [anchorRef, isSidebarOpen]);

  if (left === null) {
    return null;
  }

  return (
    <div
      className="fixed bottom-20 z-40 group h-[52px] w-[52px] pointer-events-auto sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2"
      style={{ left }}
    >
      <span className="pointer-events-none absolute right-0 top-0 hidden h-[52px] w-[52px] items-center overflow-hidden rounded-full border border-primary/30 bg-primary pl-5 pr-[68px] text-sm font-semibold text-white opacity-0 shadow-lg shadow-primary/20 transition-all duration-150 sm:flex sm:group-hover:w-[224px] sm:group-hover:bg-primary-dark sm:group-hover:opacity-100 sm:group-focus-within:w-[224px] sm:group-focus-within:bg-primary-dark sm:group-focus-within:opacity-100">
        <span className="whitespace-nowrap leading-none">{t('actions.regenerate')}</span>
      </span>
      <Button
        type="button"
        variant="primary"
        size="icon"
        disabled={isLoading}
        aria-busy={isLoading}
        onClick={onClick}
        aria-label={t('actions.regenerate')}
        className="relative z-10 h-[52px] w-[52px] border-primary/30 bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dark focus-visible:bg-primary-dark"
      >
        <RefreshCw className={`h-5 w-5 flex-shrink-0 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
};
