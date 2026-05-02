import React from 'react';
import { Star, FileText, BookOpen, ChevronRight } from 'lucide-react';

export const FavoriteCard = ({ item, toggleFavorite, viewDetails }: any) => (
  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full hover:shadow-md transition-all">
    <div className="flex justify-between items-start mb-4">
      {item.type === 'article' ? (
        <span className="text-[#1351B4] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 bg-blue-50 px-2 py-1 rounded">
          <FileText className="w-3 h-3" /> Artigo
        </span>
      ) : (
        <span className="text-yellow-700 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded">
          <BookOpen className="w-3 h-3" /> Livro
        </span>
      )}
      <button onClick={() => toggleFavorite(item)} className="text-[#1351B4] hover:text-red-500 transition-colors cursor-pointer">
        <Star className="w-5 h-5" fill="currentColor" />
      </button>
    </div>
    <h3 className="font-bold text-[#003157] text-lg mb-2 line-clamp-2 leading-tight">{item.title}</h3>
    <p className="text-sm text-gray-500 mb-6 flex-grow">{item.authors} • {item.year}</p>
    <button 
      onClick={() => viewDetails(item)}
      className="w-full bg-gray-50 hover:bg-gray-100 text-[#1351B4] font-bold py-2.5 rounded-xl transition-colors text-sm flex items-center justify-center gap-1"
    >
      Ver Detalhes <ChevronRight className="w-4 h-4" />
    </button>
  </div>
);