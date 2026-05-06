import React from 'react';
import {
  Filter as FilterIcon, Search, Sparkles, ChevronLeft, ChevronRight, X
} from 'lucide-react';
import { RecommendationCard } from '../components/RecommendationCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const PAGE_SIZE = 4;

interface RecommendationsProps {
  results: any[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
  setCurrentScreen: (screen: string) => void;
  viewDetails: (item: any) => void;
  toggleFavorite: (item: any) => void;
  isFavorite: (id: any) => boolean;
  isLoading?: boolean;
}

export const Recommendations = ({
  results, total, page, onPageChange, searchQuery, setSearchQuery, handleSearch, setCurrentScreen,
  viewDetails, toggleFavorite, isFavorite, isLoading,
}: RecommendationsProps) => {
  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleClearSearch = () => {
    setSearchQuery('');
    setCurrentScreen('home'); // Volta para a tela da IA
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">
      {/* BARRA DE PESQUISA SUPERIOR */}
      <div className="mb-8 max-w-4xl">
        <form onSubmit={handleSearch} className="relative flex items-center shadow-sm rounded-full bg-white border border-gray-200 focus-within:border-primary transition-all">
          <Search className="absolute left-5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar artigos e livros..."
            className="w-full py-3.5 pl-14 pr-32 rounded-full text-base text-gray-800 outline-none placeholder-gray-400"
            required
          />
          <div className="absolute right-1.5 flex items-center gap-1">
            <button
              type="button"
              onClick={handleClearSearch}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Limpar pesquisa e voltar para IA"
            >
              <X className="w-5 h-5" />
            </button>
            <Button
              type="submit"
              variant="primary"
              className="px-6 py-2"
              isLoading={isLoading}
            >
              {!isLoading && 'Pesquisar'}
            </Button>
          </div>
        </form>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 border-t border-gray-100 pt-6">
        <div>
          <h2 className="text-2xl font-bold text-primary-dark">
            Resultados para: <span className="text-primary">"{searchQuery || 'Sua Pesquisa'}"</span>
          </h2>
        </div>
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm text-sm font-bold text-green-700">
          <Sparkles className="w-4 h-4" />
          <span>{total} recomendações precisas</span>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">

        {/* BARRA LATERAL DE FILTROS */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
            <div className="flex items-center gap-2 mb-6 text-primary-dark font-bold border-b pb-4 border-gray-50">
              <FilterIcon className="w-5 h-5 text-primary" />
              <span>Filtros</span>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-gray-400 mb-3">Tipo de Material</h4>
                <div className="space-y-2">
                  {['Artigos Científicos', 'Livros'].map(item => (
                    <label key={item} className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer hover:text-primary font-medium group">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary" />
                      <span className="group-hover:translate-x-0.5 transition-transform">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-gray-400 mb-3">Base de Origem</h4>
                <div className="space-y-2">
                  {['Semantic Scholar', 'arXiv', 'Google Books'].map(item => (
                    <label key={item} className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer hover:text-primary font-medium group">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-primary" />
                      <span className="group-hover:translate-x-0.5 transition-transform">{item}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-[10px] uppercase tracking-wider text-gray-400 mb-3">Idioma</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer hover:text-primary font-medium group">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-primary" /> 
                    <span className="group-hover:translate-x-0.5 transition-transform">Português</span>
                  </label>
                  <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer hover:text-primary font-medium group">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-primary" /> 
                    <span className="group-hover:translate-x-0.5 transition-transform">Inglês</span>
                  </label>
                </div>
              </div>

              <Button 
                variant="primary"
                className="w-full mt-4 flex items-center justify-center gap-2 group"
              >
                <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </aside>

        {/* LISTA DE RESULTADOS */}
        <div className="flex-1 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
              <p className="text-xs font-bold text-primary-dark uppercase tracking-widest">Analisando com IA...</p>
            </div>
          ) : (
            <>
              {results.map((item: any) => (
                <RecommendationCard
                  key={item.id}
                  item={item}
                  viewDetails={viewDetails}
                  toggleFavorite={toggleFavorite}
                  isFavorite={isFavorite(item.id)}
                />
              ))}

              {results.length === 0 && (
                <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center animate-fadeIn">
                  <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-400 font-bold uppercase text-sm">Nenhum resultado encontrado</p>
                  <p className="text-gray-400 text-xs mt-1">Tente ajustar sua busca para encontrar mais materiais.</p>
                </div>
              )}

              {/* PAGINAÇÃO: Correção visual final usando o átomo Button ajustado */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-6 pt-8 pb-4">
                  <Button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 0}
                    variant="secondary"
                    className="w-10 h-10 p-0 flex items-center justify-center shadow-sm"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </Button>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-bold text-primary-dark uppercase tracking-widest">
                      Página {page + 1}
                    </span>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">
                      de {totalPages} páginas
                    </span>
                  </div>

                  <Button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages - 1}
                    variant="secondary"
                    className="w-10 h-10 p-0 flex items-center justify-center shadow-sm"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
