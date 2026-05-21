import { ExternalLink, Lock } from 'lucide-react';

interface AccessMaterialButtonProps {
  url?: string;
  title: string;
}

export const AccessMaterialButton = ({ url, title }: AccessMaterialButtonProps) => {
  if (!url) {
    return (
      <div
        role="status"
        className="w-full py-3 px-4 rounded-xl border border-dashed border-border-strong bg-surface-subtle text-text-muted text-sm font-medium flex items-center justify-center gap-2"
      >
        <Lock className="w-4 h-4" aria-hidden="true" />
        <span>Link de acesso indisponível</span>
      </div>
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Acessar material: ${title} (abre em nova aba)`}
      className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-all flex items-center justify-center gap-2 shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.98]"
    >
      <ExternalLink className="w-5 h-5" aria-hidden="true" />
      <span>Acessar Material</span>
    </a>
  );
};
