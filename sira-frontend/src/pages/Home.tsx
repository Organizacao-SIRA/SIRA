import React from 'react';
import { Search, FileText, BookOpen, Sparkles } from 'lucide-react';

interface HomeProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  handleSearch: (e: React.FormEvent) => void;
}

export const Home = ({ searchQuery, setSearchQuery, handleSearch }: HomeProps) => (
  <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-50 min-h-[calc(100vh-68px)] animate-fadeIn">
    <div className="max-w-4xl w-full text-center space-y-6">
      
      {/* Título e Subtítulo Compactos */}
      <div className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#003157] tracking-tight">
          O que você está investigando hoje?
        </h1>
        <p className="text-base text-gray-600 max-w-xl mx-auto leading-relaxed">
          Nossa IA encontra os livros e artigos científicos mais relevantes para o seu contexto acadêmico.
        </p>
      </div>

      {/* Barra de Pesquisa */}
      <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
        <div className="relative flex items-center shadow-lg rounded-full bg-white border border-gray-200 focus-within:border-[#1351B4] transition-all">
          <Search className="absolute left-5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Ex: IA na gestão pública..."
            className="w-full py-4 pl-14 pr-32 rounded-full text-base text-gray-800 outline-none placeholder-gray-400"
            required
          />
          <button 
            type="submit" 
            className="absolute right-1.5 bg-[#1351B4] hover:bg-[#003157] text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-sm"
          >
            Pesquisar
          </button>
        </div>
      </form>

      {/* Grid de Recursos (Cores Fixas e Tamanho Menor) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10 text-left">
        
        {/* Card: Artigos */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all">
          <div className="w-10 h-10 bg-[#1351B4] rounded-lg flex items-center justify-center mb-4 shadow-sm">
            <FileText className="text-white w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2 text-base">Artigos Científicos</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Acesso direto ao arXiv e Semantic Scholar para publicações recentes.
          </p>
        </div>

        {/* Card: Livros */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all">
          <div className="w-10 h-10 bg-[#FFCD07] rounded-lg flex items-center justify-center mb-4 shadow-sm">
            <BookOpen className="text-[#8A6D00] w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2 text-base">Livros Acadêmicos</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Busca no Google Books para garantir fundamentação teórica sólida.
          </p>
        </div>

        {/* Card: IA Semântica */}
        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 transition-all">
          <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center mb-4 shadow-sm">
            <Sparkles className="text-white w-5 h-5" />
          </div>
          <h3 className="font-bold text-gray-900 mb-2 text-base">IA Semântica</h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Tecnologia que compreende o contexto além de palavras-chave.
          </p>
        </div>

      </div>

      {/* Rodapé Curto */}
      <div className="pt-6">
        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
          SIRA+ | Sistema Inteligente de Recomendação Acadêmica
        </p>
      </div>
    </div>
  </div>
);