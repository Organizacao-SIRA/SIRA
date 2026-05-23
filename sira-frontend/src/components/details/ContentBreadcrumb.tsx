import { ArrowLeft, ChevronRight } from 'lucide-react';

interface ContentBreadcrumbProps {
  previousScreen: string;
  title: string;
  onBack: () => void;
}

const BACK_LABELS: Record<string, string> = {
  catalog: 'Voltar ao Catálogo',
  favorites: 'Voltar aos Favoritos',
  results: 'Voltar aos Resultados',
  home: 'Voltar ao Início',
};

export const ContentBreadcrumb = ({ previousScreen, title, onBack }: ContentBreadcrumbProps) => {
  const label = BACK_LABELS[previousScreen] || 'Voltar';

  return (
    <nav
      aria-label="Navegação de retorno"
      className="flex items-center text-sm text-text-muted mb-6 font-medium"
    >
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-primary hover:text-primary-dark dark:hover:text-primary hover:underline font-bold flex-shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md px-1 py-0.5 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>{label}</span>
      </button>
      <ChevronRight className="w-4 h-4 mx-2 text-text-subtle flex-shrink-0" aria-hidden="true" />
      <span
        className="truncate min-w-0 max-w-[140px] sm:max-w-[240px] md:max-w-[400px] text-text-subtle"
        title={title}
      >
        {title}
      </span>
    </nav>
  );
};
