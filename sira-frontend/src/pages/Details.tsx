import {
  FileText, BookOpen, Star, ChevronRight, Sparkles,
  Globe, Calendar, UserCircle, ArrowLeft, Tag, Link as LinkIcon, Library, ExternalLink
} from 'lucide-react';
import { StatusBadge } from '../components/ui/StatusBadge';

interface DetailsProps {
  item: any;
  setCurrentScreen: (screen: string) => void;
  previousScreen: string;
  toggleFavorite: (item: any) => void;
  isFavorite: (id: any) => boolean;
}

export const Details = ({ item, setCurrentScreen, previousScreen, toggleFavorite, isFavorite }: DetailsProps) => {

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-68px)] p-8 sm:p-20 text-center">
        <BookOpen className="w-16 h-16 text-text-subtle mb-4" />
        <h2 className="text-lg sm:text-xl font-bold text-text-subtle">Nenhum detalhe disponível</h2>
        <button
          onClick={() => setCurrentScreen('home')}
          className="mt-4 text-primary font-bold hover:underline flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Voltar para o início
        </button>
      </div>
    );
  }

  const backLabels: any = {
    catalog: 'Voltar ao Catálogo',
    favorites: 'Voltar aos Favoritos',
    results: 'Voltar aos Resultados'
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 min-h-[calc(100vh-68px)] animate-fadeIn">
      <nav className="flex items-center text-sm text-text-muted mb-6 font-medium">
        <button
          onClick={() => setCurrentScreen(previousScreen || 'home')}
          className="flex items-center gap-2 text-primary hover:underline font-bold flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" /> {backLabels[previousScreen] || 'Voltar'}
        </button>
        <ChevronRight className="w-4 h-4 mx-2 text-text-subtle flex-shrink-0" />
        <span className="truncate min-w-0 max-w-[140px] sm:max-w-[240px] md:max-w-[300px] text-text-subtle">{item.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">

        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
          <section>
            <div className="flex gap-2 mb-4">
              {item.type === 'article' ? (
                <StatusBadge variant="info" icon={<FileText className="w-3 h-3" />} className="text-xs px-3 py-1">Artigo Científico</StatusBadge>
              ) : (
                <StatusBadge variant="warning" icon={<BookOpen className="w-3 h-3" />} className="text-xs px-3 py-1">Livro Acadêmico</StatusBadge>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-primary-dark dark:text-text leading-tight mb-5 sm:mb-6 italic break-words">
              {item.title}
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-text bg-surface p-4 sm:p-6 rounded-2xl border border-border shadow-sm">
              <div className="flex items-start gap-3 min-w-0">
                <UserCircle className="w-5 h-5 text-text-subtle mt-0.5 flex-shrink-0" />
                <div className="min-w-0"><span className="font-bold text-text block mb-0.5">Autores</span> <span className="break-words">{item.authors}</span></div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-text-subtle mt-0.5 flex-shrink-0" />
                <div><span className="font-bold text-text block mb-0.5">Ano</span> {item.year}</div>
              </div>
              <div className="flex items-start gap-3 min-w-0">
                <Globe className="w-5 h-5 text-text-subtle mt-0.5 flex-shrink-0" />
                <div className="min-w-0"><span className="font-bold text-text block mb-0.5">Fonte</span> <span className="break-words">{item.source}</span></div>
              </div>
              {item.doi && (
                <div className="flex items-start gap-3 min-w-0">
                  <LinkIcon className="w-5 h-5 text-text-subtle mt-0.5 flex-shrink-0" />
                  <div className="min-w-0"><span className="font-bold text-text block mb-0.5">DOI</span> <span className="text-primary break-all">{item.doi}</span></div>
                </div>
              )}
              {item.isbn && (
                <div className="flex items-start gap-3 min-w-0">
                  <Tag className="w-5 h-5 text-text-subtle mt-0.5 flex-shrink-0" />
                  <div className="min-w-0"><span className="font-bold text-text block mb-0.5">ISBN</span> <span className="break-all">{item.isbn}</span></div>
                </div>
              )}
              <div className="md:col-span-2 flex items-start gap-3 pt-3 border-t border-border mt-1">
                <Library className="w-5 h-5 text-text-subtle mt-0.5 flex-shrink-0" />
                <div><span className="font-bold text-text block mb-1">Área Temática</span>
                  <span className="px-2 py-1 bg-surface-subtle text-text rounded text-xs font-semibold">{item.thematicArea || 'Geral'}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-surface p-5 sm:p-8 rounded-2xl border border-border shadow-sm">
            <h2 className="text-lg sm:text-xl font-bold text-primary-dark dark:text-text mb-5 sm:mb-6 flex items-center gap-2 border-b border-border pb-3 sm:pb-4">
              Resumo Acadêmico
            </h2>
            <p className="text-text leading-relaxed text-justify text-base sm:text-lg">
              {item.abstract}
            </p>

            {item.keywords && item.keywords.length > 0 && (
              <div className="mt-8 sm:mt-10">
                <h3 className="text-xs font-bold text-text-subtle uppercase tracking-widest mb-4">Palavras-chave</h3>
                <div className="flex flex-wrap gap-2">
                  {item.keywords.map((kw: string, idx: number) => (
                    <span key={idx} className="bg-info-soft text-info-strong px-3 py-1.5 rounded-lg text-sm font-medium border border-info-border">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-accent-light border-l-4 border-accent p-5 sm:p-6 rounded-r-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-accent-dark w-6 h-6" />
              <h3 className="font-bold text-accent-dark text-base sm:text-lg">Análise do SIRA+</h3>
            </div>
            <p className="text-sm text-accent-dark leading-relaxed font-medium italic">
              "{item.aiExplanation || "Recomendado com base na aderência técnica ao seu perfil."}"
            </p>
            <div className="mt-6 pt-4 border-t border-accent/30">
              <div className="flex items-center justify-between text-xs font-bold text-accent-dark uppercase mb-2">
                <span>Relevância Semântica</span>
                <span>{item.relevance || 90}%</span>
              </div>
              <div className="w-full bg-white/50 rounded-full h-2">
                <div
                  className="bg-success h-2 rounded-full transition-all"
                  style={{ width: `${item.relevance || 90}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-surface p-4 rounded-2xl border border-border shadow-sm space-y-3">
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Acessar Material
              </a>
            )}
            <button
              onClick={() => toggleFavorite(item)}
              className={`w-full py-3 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                isFavorite(item.id)
                  ? 'bg-primary-soft border-primary text-primary'
                  : 'bg-surface border-border-strong text-text hover:border-primary'
              }`}
            >
              <Star className="w-5 h-5" fill={isFavorite(item.id) ? 'currentColor' : 'none'} />
              {isFavorite(item.id) ? 'Salvo' : 'Salvar nos Favoritos'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
