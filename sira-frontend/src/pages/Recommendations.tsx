import React from 'react';
import {
  Filter as FilterIcon, Search, Sparkles, ChevronLeft, ChevronRight
} from 'lucide-react';
import { RecommendationCard } from '../components/RecommendationCard';

const PAGE_SIZE = 4;

interface RecommendationsProps {
  results: any[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  searchQuery: string;
  viewDetails: (item: any) => void;
  toggleFavorite: (item: any) => void;
  isFavorite: (id: any) => boolean;
  isLoading?: boolean;
}

export const Recommendations = ({
  results, total, page, onPageChange, searchQuery,
  viewDetails, toggleFavorite, isFavorite, isLoading,
}: RecommendationsProps) => {
  const totalPages = Math.ceil(total / PAGE_SIZE);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#003157]">
            Resultados para: <span className="text-[#1351B4]">"{searchQuery || 'Sua Pesquisa'}"</span>
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
            <div className="flex items-center gap-2 mb-6 text-[#003157] font-bold border-b pb-4">
              <FilterIcon className="w-5 h-5 text-[#1351B4]" />
              <span>Filtros</span>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">Tipo de Material</h4>
                <div className="space-y-2">
                  {['Artigos Científicos', 'Livros'].map(item => (
                    <label key={item} className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer hover:text-[#1351B4]">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-[#1351B4] focus:ring-[#1351B4]" />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">Base de Origem</h4>
                <div className="space-y-2">
                  {['Semantic Scholar', 'arXiv', 'Google Books'].map(item => (
                    <label key={item} className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-[#1351B4]" />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">Idioma</h4>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-gray-300 text-[#1351B4]" /> Português
                  </label>
                  <label className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-gray-300 text-[#1351B4]" /> Inglês
                  </label>
                </div>
              </div>

              <button className="w-full mt-4 bg-[#1351B4] hover:bg-[#003157] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 group">
                <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Aplicar Filtros
              </button>
            </div>
          </div>
        </aside>

        {/* LISTA DE RESULTADOS */}
        <div className="flex-1 space-y-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#1351B4] mb-4"></div>
              <p className="text-sm font-bold text-[#003157] uppercase tracking-widest">Analisando com IA...</p>
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
                <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-200 text-center">
                  <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 font-medium">Nenhum resultado encontrado para sua busca.</p>
                </div>
              )}

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3 pt-4">
                  <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 0}
                    className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-[#1351B4] hover:text-[#1351B4] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <span className="text-sm font-bold text-gray-500">
                    Página {page + 1} de {totalPages}
                  </span>
                  <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages - 1}
                    className="p-2 rounded-xl border border-gray-200 text-gray-500 hover:border-[#1351B4] hover:text-[#1351B4] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
