import React, { useState, useEffect } from 'react';
import { Search, AlertTriangle, BookOpen } from 'lucide-react';
import { fetchCatalogBooks } from '../services/api';
import { CatalogCard } from '../components/CatalogCard';
import { CatalogCardSkeleton } from '../components/CatalogCardSkeleton';

export const Catalog = ({ viewDetails, toggleFavorite, isFavorite }: {
  viewDetails: (item: any) => void;
  toggleFavorite: (item: any) => void;
  isFavorite: (id: string) => boolean;
}) => {
  const [catalogSearch, setCatalogSearch] = useState(() => sessionStorage.getItem('@sira:catalogSearch') || '');
  const [selectedCategory, setSelectedCategory] = useState(() => sessionStorage.getItem('@sira:catalogCategory') || 'Todas');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isBlocked, setIsBlocked] = useState(false);

  const categories = ['Todas', 'Ciências da Computação', 'Administração Pública', 'Direito'];

  useEffect(() => { sessionStorage.setItem('@sira:catalogSearch', catalogSearch); }, [catalogSearch]);
  useEffect(() => { sessionStorage.setItem('@sira:catalogCategory', selectedCategory); }, [selectedCategory]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      const cacheKey = `@sira:catalogItems:${selectedCategory}`;
      const cachedData = sessionStorage.getItem(cacheKey);

      if (cachedData) {
        setItems(JSON.parse(cachedData));
        setLoading(false);
        setIsBlocked(false);
        return;
      }

      setLoading(true);
      setIsBlocked(false);

      try {
        const data = await fetchCatalogBooks(selectedCategory);

        if (isMounted) {
          if (data.length === 0 && selectedCategory !== 'Todas') {
            setIsBlocked(true);
          } else if (data.length > 0) {
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
          }
          setItems(data);
        }
      } catch (error) {
        if (isMounted) setItems([]);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => { isMounted = false; };
  }, [selectedCategory]);

  const filteredItems = items.filter(item =>
    item.title?.toLowerCase().includes(catalogSearch.toLowerCase()) ||
    item.authors?.toLowerCase().includes(catalogSearch.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-fadeIn min-h-[calc(100vh-68px)]">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary-dark dark:text-text">Catálogo Acadêmico</h1>
        <p className="text-text-muted mt-1 font-medium">
          Navegue pelo nosso acervo integrado de livros acadêmicos e artigos científicos.
        </p>
      </div>

      <div className="bg-surface p-4 rounded-xl border border-border-strong shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-subtle w-5 h-5" />
          <input
            type="text"
            placeholder="Pesquisar por título ou autor..."
            value={catalogSearch}
            onChange={(e) => setCatalogSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-muted text-text border border-border-strong rounded-lg outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors text-sm"
          />
        </div>

        <div className="w-full md:w-auto flex items-center gap-3">
          <span className="text-sm font-bold text-text whitespace-nowrap">Categoria:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="border border-border-strong rounded-lg px-3 py-2 bg-surface-muted text-text outline-none focus:border-primary text-sm font-medium w-full md:w-56 cursor-pointer"
          >
            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <CatalogCardSkeleton key={index} />
          ))}
        </div>
      ) : isBlocked && items.length === 0 ? (
        <div className="bg-warning-soft border-l-4 border-warning-border p-8 rounded-r-xl shadow-sm max-w-2xl mx-auto text-center">
          <AlertTriangle className="w-12 h-12 text-warning-strong mx-auto mb-4" />
          <h3 className="text-xl font-bold text-warning-strong">Limite de Acesso Temporário</h3>
          <p className="text-warning-strong mt-2">
            As APIs externas (Google/Semantic) atingiram o limite de requisições.
            Aguarde um minuto e tente carregar outra categoria.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.length > 0 ? (
            filteredItems.map(item => (
              <CatalogCard
                key={item.id}
                book={item}
                viewDetails={viewDetails}
                toggleFavorite={toggleFavorite}
                isFavorite={isFavorite(item.id)}
              />
            ))
          ) : (
            <div className="col-span-full py-24 text-center bg-surface rounded-2xl border-2 border-dashed border-border-strong">
              <BookOpen className="w-16 h-16 mx-auto text-text-subtle mb-4" />
              <h3 className="text-lg font-bold text-text-subtle uppercase">Nenhum material encontrado</h3>
              <p className="text-sm text-text-subtle mt-1">
                Tente ajustar os termos da pesquisa ou mudar a categoria.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
