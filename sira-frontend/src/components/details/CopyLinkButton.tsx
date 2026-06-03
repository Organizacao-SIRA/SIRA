import { Check, Link as LinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useClipboard } from '../../hooks/useClipboard';
import { toast } from '../../toast';

interface CopyLinkButtonProps {
  url?: string;
  doi?: string;
}

export const CopyLinkButton = ({ url, doi }: CopyLinkButtonProps) => {
  const { t } = useTranslation('details');
  const { t: tCommon } = useTranslation('common');
  const { copied, copy } = useClipboard();

  const link = url || (doi ? `https://doi.org/${doi.replace(/^https?:\/\/doi\.org\//, '')}` : null);
  if (!link) return null;

  const handleClick = async () => {
    if (await copy(link)) {
      toast.success(tCommon('toast.linkCopied'));
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={copied ? t('link.copiedLabel') : t('link.copyLabel')}
      aria-live="polite"
      className="w-full min-h-[52px] px-4 py-3 rounded-xl border-2 border-border-strong bg-surface hover:border-link hover:bg-primary-soft text-text hover:text-link font-semibold transition-all flex items-center justify-center gap-2 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface active:scale-[0.98] cursor-pointer"
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 text-success" aria-hidden="true" />
          <span className="text-success">{t('link.copied')}</span>
        </>
      ) : (
        <>
          <LinkIcon className="w-4 h-4" aria-hidden="true" />
          <span>{t('link.copy')}</span>
        </>
      )}
    </button>
  );
};
