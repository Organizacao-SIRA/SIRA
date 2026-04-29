import React from 'react';
import {
  FileText, BookOpen, Star, ChevronRight, Sparkles,
  Globe, Calendar, UserCircle, ArrowLeft, Tag, Link as LinkIcon, Library, ExternalLink
} from 'lucide-react';

interface DetailsProps {
  item: any;
  setCurrentScreen: (screen: string) => void;
  previousScreen: string;
  toggleFavorite: (item: any) => void;
  isFavorite: (id: any) => boolean;
}

export const Details = ({ item, setCurrentScreen, previousScreen, toggleFavorite, isFavorite }: DetailsProps) => {
  
  // SEGURANÇA: Impede a tela branca se o item for nulo
  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-20 text-center">
        <BookOpen className="w-16 h-16 text-gray-200 mb-4" />
        <h2 className="text-xl font-bold text-gray-400">Nenhum detalhe disponível</h2>
        <button 
          onClick={() => setCurrentScreen('home')}
          className="mt-4 text-[#1351B4] font-bold hover:underline flex items-center gap-2"
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
    <div className="max-w-6xl mx-auto px-4 py-8 min-h-screen animate-fadeIn">
      {/* Navegação Superior */}
      <nav className="flex items-center text-sm text-gray-500 mb-6 font-medium">
        <button 
          onClick={() => setCurrentScreen(previousScreen || 'home')} 
          className="flex items-center gap-2 text-[#1351B4] hover:underline font-bold"
        >
          <ArrowLeft className="w-4 h-4" /> {backLabels[previousScreen] || 'Voltar'}
        </button>
        <ChevronRight className="w-4 h-4 mx-2 text-gray-300" />
        <span className="truncate max-w-[300px] text-gray-400">{item.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* COLUNA PRINCIPAL */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex gap-2 mb-4">
              {item.type === 'article' ? (
                <span className="inline-flex items-center gap-1 bg-blue-50 text-[#1351B4] text-xs font-bold px-3 py-1 rounded border border-blue-200 uppercase">
                  <FileText className="w-3 h-3" /> Artigo Científico
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-800 text-xs font-bold px-3 py-1 rounded border border-yellow-200 uppercase">
                  <BookOpen className="w-3 h-3" /> Livro Acadêmico
                </span>
              )}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold text-[#003157] leading-tight mb-6 italic">
              {item.title}
            </h1>
            
            {/* Grid de Informações Técnicas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-start gap-3">
                <UserCircle className="w-5 h-5 text-gray-400 mt-0.5" />
                <div><span className="font-bold text-gray-900 block mb-0.5">Autores</span> {item.authors}</div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                <div><span className="font-bold text-gray-900 block mb-0.5">Ano</span> {item.year}</div>
              </div>
              <div className="flex items-start gap-3">
                <Globe className="w-5 h-5 text-gray-400 mt-0.5" />
                <div><span className="font-bold text-gray-900 block mb-0.5">Fonte</span> {item.source}</div>
              </div>
              {item.doi && (
                <div className="flex items-start gap-3">
                  <LinkIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div><span className="font-bold text-gray-900 block mb-0.5">DOI</span> <span className="text-[#1351B4]">{item.doi}</span></div>
                </div>
              )}
              {item.isbn && (
                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div><span className="font-bold text-gray-900 block mb-0.5">ISBN</span> {item.isbn}</div>
                </div>
              )}
              <div className="md:col-span-2 flex items-start gap-3 pt-3 border-t border-gray-50 mt-1">
                <Library className="w-5 h-5 text-gray-400 mt-0.5" />
                <div><span className="font-bold text-gray-900 block mb-1">Área Temática</span> 
                  <span className="px-2 py-1 bg-gray-100 rounded text-xs font-semibold">{item.thematicArea || 'Geral'}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Resumo */}
          <section className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-xl font-bold text-[#003157] mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
               Resumo Acadêmico
            </h2>
            <p className="text-gray-700 leading-relaxed text-justify text-lg">
              {item.abstract}
            </p>

            {item.keywords && item.keywords.length > 0 && (
              <div className="mt-10">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Palavras-chave</h3>
                <div className="flex flex-wrap gap-2">
                  {item.keywords.map((kw: string, idx: number) => (
                    <span key={idx} className="bg-blue-50 text-[#1351B4] px-3 py-1.5 rounded-lg text-sm font-medium border border-blue-100">
                      {kw}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* COLUNA LATERAL (SIDEBAR) */}
        <div className="space-y-6">
          <div className="bg-[#FFF4CC] border-l-4 border-[#FFCD07] p-6 rounded-r-2xl shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="text-[#8A6D00] w-6 h-6" />
              <h3 className="font-bold text-[#8A6D00] text-lg">Análise do SIRA+</h3>
            </div>
            <p className="text-sm text-[#8A6D00] leading-relaxed font-medium italic">
              "{item.aiJustification || "Recomendado com base na aderência técnica ao seu perfil."}"
            </p>
            <div className="mt-6 pt-4 border-t border-[#FFCD07]/30">
              <div className="flex items-center justify-between text-xs font-bold text-[#8A6D00] uppercase mb-2">
                <span>Relevância Semântica</span>
                <span>{item.relevance || 90}%</span>
              </div>
              <div className="w-full bg-white/50 rounded-full h-2">
                <div 
                  className="bg-[#00A859] h-2 rounded-full transition-all" 
                  style={{ width: `${item.relevance || 90}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-xl bg-[#1351B4] hover:bg-[#003157] text-white font-bold transition-all flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-5 h-5" />
                Acessar Material
              </a>
            )}
            <button
              onClick={() => toggleFavorite(item)}
              className={`w-full py-3 rounded-xl border-2 font-bold transition-all flex items-center justify-center gap-2 ${
                isFavorite(item.id)
                  ? 'bg-blue-50 border-[#1351B4] text-[#1351B4]'
                  : 'bg-white border-gray-200 text-gray-700 hover:border-[#1351B4]'
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