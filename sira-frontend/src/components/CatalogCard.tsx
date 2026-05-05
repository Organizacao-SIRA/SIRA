import React from 'react';
import { BookOpen, FileText, ChevronRight, ExternalLink, Star } from 'lucide-react';

interface CatalogCardProps {
  book: any;
  viewDetails: (item: any) => void;
  toggleFavorite: (item: any) => void;
  isFavorite: boolean;
}

export const CatalogCard = ({ book, viewDetails, toggleFavorite, isFavorite }: CatalogCardProps) => {
  const isArticle = book.type === 'article';

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-all group relative">
      
      {/* Botão de Favoritar (Posicionado no Canto Superior Esquerdo) */}
      <button 
        onClick={(e) => {
          e.stopPropagation();
          toggleFavorite(book);
        }}
        className={`absolute top-2 left-2 z-20 p-2 rounded-full backdrop-blur-md border transition-all shadow-lg cursor-pointer ${
          isFavorite 
            ? 'bg-primary border-primary text-white' 
            : 'bg-white/40 border-white/20 text-white hover:bg-white hover:text-primary'
        }`}
      >
        <Star className="w-4 h-4" fill={isFavorite ? 'currentColor' : 'none'} />
      </button>

      {/* Capa do Material Acadêmico */}
      <div className={`h-40 flex flex-col items-center justify-center p-4 text-center relative overflow-hidden ${
        isArticle 
          ? 'bg-gradient-to-br from-primary-dark to-[#0a4a86]' 
          : 'bg-gradient-to-br from-primary to-[#1e67e3]'
      }`}>
        
        {/* Badge de Ano (Canto Superior Direito) */}
        <div className="absolute top-2 right-2 z-10">
          <span className="bg-white/20 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded font-bold border border-white/10">
            {book.year || 'S/D'}
          </span>
        </div>

        {book.image ? (
          <img 
            src={book.image} 
            alt={book.title} 
            className="h-full object-contain shadow-2xl transform group-hover:scale-105 transition-transform duration-300" 
          />
        ) : (
          <div className="flex flex-col items-center">
            {isArticle ? (
              <FileText className="w-12 h-12 text-white/20 mb-2" />
            ) : (
              <BookOpen className="w-12 h-12 text-white/20 mb-2" />
            )}
            <span className="text-white/90 font-bold text-[11px] line-clamp-3 px-4 leading-tight uppercase tracking-tight">
              {book.title}
            </span>
          </div>
        )}
      </div>
      
      {/* Informações e Ações */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex gap-2 mb-3">
          {/* TAG ÚNICA: Categoria do Livro (Substituiu Tipo e Acadêmico) */}
          <span className="text-[10px] font-bold text-accent-dark bg-accent-light px-2.5 py-1 rounded border border-accent/20 truncate max-w-full uppercase tracking-wider">
            {book.thematicArea ? book.thematicArea.split(' / ')[0] : 'Geral'}
          </span>
        </div>

        <h3 className="font-bold text-primary-dark text-base mb-1 line-clamp-2 min-h-[44px] leading-tight group-hover:text-primary transition-colors">
          {book.title}
        </h3>
        
        <p className="text-[12px] text-gray-500 mb-4 line-clamp-1 italic font-medium">
          {book.authors || 'Autor desconhecido'}
        </p>
        
        {/* Rodapé do Card */}
        <div className="mt-auto pt-4 border-t border-gray-50 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
              {book.source || 'SIRA+'}
            </span>
            <button
              onClick={() => viewDetails(book)}
              className="text-primary hover:text-primary-dark text-sm font-bold flex items-center gap-1 transition-colors"
            >
              Ver Detalhes <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {book.url && (
            <a
              href={book.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-primary border border-primary hover:bg-blue-50 py-1.5 rounded-lg transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Acessar Material
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
