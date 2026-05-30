interface PageFooterProps {
  text: string;
  variant?: 'static' | 'sticky';
}

export const PageFooter = ({ text, variant = 'static' }: PageFooterProps) => {
  if (variant === 'sticky') {
    return (
      <div className="sticky bottom-0 left-0 right-0 -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 bg-gradient-to-t from-surface-muted from-55% via-surface-muted/80 via-78% to-transparent pt-3 pb-[calc(0.625rem+env(safe-area-inset-bottom))] sm:pt-5 sm:pb-3 z-30 pointer-events-none">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-[10px] text-text-subtle font-medium tracking-wide uppercase">{text}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] sm:py-4 text-center bg-surface-muted/80 backdrop-blur-sm">
      <p className="text-[10px] text-text-subtle font-medium tracking-wide uppercase">{text}</p>
    </div>
  );
};
