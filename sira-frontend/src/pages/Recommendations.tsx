import React from 'react';
import { 
  FileText, BookOpen, Star, Sparkles, 
  ChevronRight, Filter as FilterIcon, Search
} from 'lucide-react';

export const Recommendations = ({ results, searchQuery, viewDetails, toggleFavorite, isFavorite }: any) => {
  
  const displayResults = results || [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn">
      {/* Cabeçalho com Contador de Resultados */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#003157]">
            Resultados para: <span className="text-[#1351B4]">"{searchQuery || 'Sua Pesquisa'}"</span>
          </h2>
        </div>
        {/* TAG DE QUANTIDADE DE RESULTADOS (Restaurada) */}
        <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm text-sm font-bold text-green-700">
          <Sparkles className="w-4 h-4" />
          <span>{displayResults.length} recomendações precisas</span>
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
              {/* Tipo de Material */}
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

              {/* Base de Origem */}
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

              {/* Idioma */}
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

              {/* Nível */}
              <div>
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-400 mb-3">Nível do Material</h4>
                <div className="space-y-2">
                  {['Introdutório', 'Intermediário', 'Avançado'].map(item => (
                    <label key={item} className="flex items-center gap-3 text-sm text-gray-600 cursor-pointer">
                      <input type="checkbox" defaultChecked={item === 'Intermediário'} className="w-4 h-4 rounded border-gray-300 text-[#1351B4]" />
                      {item}
                    </label>
                  ))}
                </div>
              </div>

              {/* BOTÃO APLICAR FILTROS (Adicionado) */}
              <button className="w-full mt-4 bg-[#1351B4] hover:bg-[#003157] text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 group">
                <Search className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Aplicar Filtros
              </button>
            </div>
          </div>
        </aside>

        {/* LISTA DE RESULTADOS */}
        <div className="flex-1 space-y-4">
          {displayResults.map((item: any) => (
            <div key={item.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider ${
                    item.type === 'article' ? 'bg-blue-50 text-[#1351B4] border border-blue-100' : 'bg-yellow-50 text-yellow-800 border border-yellow-100'
                  }`}>
                    {item.type === 'article' ? 'Artigo' : 'Livro'}
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-md uppercase bg-gray-100 text-gray-400 border border-gray-200">
                    {item.source}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-green-700 font-bold text-xs bg-green-50 px-2 py-1 rounded-md border border-green-100">
                  <Sparkles className="w-3 h-3" /> {item.relevance}% Relevância
                </div>
              </div>

              <h3 className="text-xl font-bold text-[#003157] mb-2">{item.title}</h3>
              <p className="text-sm text-gray-500 mb-4">{item.authors} ({item.year})</p>
              <p className="text-gray-600 text-sm line-clamp-2 mb-6 leading-relaxed italic">
                {item.abstract}
              </p>

              <div className="flex gap-3 pt-4 border-t border-gray-50">
                <button 
                  onClick={() => viewDetails(item)}
                  className="bg-[#1351B4] hover:bg-[#003157] text-white px-5 py-2 rounded-xl text-sm font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  Ver Detalhes <ChevronRight className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => toggleFavorite(item)}
                  className={`p-2.5 rounded-xl border transition-all ${
                    isFavorite(item.id) ? 'bg-blue-50 border-[#1351B4] text-[#1351B4]' : 'bg-white border-gray-200 text-gray-400 hover:text-[#1351B4]'
                  }`}
                >
                  <Star className="w-5 h-5" fill={isFavorite(item.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};