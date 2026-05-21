import { Check, Link as LinkIcon } from 'lucide-react';
import { useClipboard } from '../../hooks/useClipboard';

interface CopyLinkButtonProps {
  url?: string;
  doi?: string;
}

export const CopyLinkButton = ({ url, doi }: CopyLinkButtonProps) => {
  const { copied, copy } = useClipboard();

  const link = url || (doi ? `https://doi.org/${doi.replace(/^https?:\/\/doi\.org\//, '')}` : null);
  if (!link) return null;

  const handleClick = () => {
    void copy(link);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={copied ? 'Link copiado' : 'Copiar link do material'}
      aria-live="polite"
      className="w-full py-3 px-4 rounded-xl border-2 border-border-strong bg-surface hover:border-primary hover:bg-primary-soft text-text hover:text-primary font-semibold transition-all flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98] cursor-pointer"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-success" aria-hidden="true" />
          <span className="text-success">Link copiado</span>
        </>
      ) : (
        <>
          <LinkIcon className="w-4 h-4" aria-hidden="true" />
          <span>Copiar Link</span>
        </>
      )}
    </button>
  );
};
