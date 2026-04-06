const GOOGLE_BOOKS_URL = 'https://www.googleapis.com/books/v1/volumes';
const SEMANTIC_SCHOLAR_URL = 'https://api.semanticscholar.org/graph/v1/paper/search';

/**
 * Função Auxiliar para formatar os dados e evitar erros de 'undefined'
 */
const formatData = (item: any, type: 'book' | 'article') => {
  if (type === 'book') {
    return {
      id: `gb-${item.id}`,
      type: 'book',
      title: item.volumeInfo?.title || 'Título Indisponível',
      authors: item.volumeInfo?.authors?.join(', ') || 'Autor desconhecido',
      year: item.volumeInfo?.publishedDate?.split('-')[0] || 'N/A',
      source: 'Google Books',
      relevance: Math.floor(Math.random() * (99 - 85 + 1)) + 85,
      abstract: item.volumeInfo?.description || 'Sem resumo disponível.',
      image: item.volumeInfo?.imageLinks?.thumbnail || null
    };
  }
  return {
    id: `ss-${item.paperId}`,
    type: 'article',
    title: item.title || 'Título Indisponível',
    authors: item.authors?.map((a: any) => a.name).join(', ') || 'Vários autores',
    year: item.year || 'N/A',
    source: item.venue || 'Semantic Scholar',
    relevance: Math.floor(Math.random() * (99 - 85 + 1)) + 85,
    abstract: item.abstract || 'Resumo acadêmico indisponível.'
  };
};

/**
 * Busca Principal (Recommendations / Home)
 */
export const searchAcademicContent = async (query: string) => {
  if (!query || query.length < 2) return [];
  try {
    const google = fetch(`${GOOGLE_BOOKS_URL}?q=${encodeURIComponent(query)}&maxResults=8`)
      .then(res => res.status === 429 ? { items: [] } : res.json())
      .catch(() => ({ items: [] }));

    const semantic = fetch(`${SEMANTIC_SCHOLAR_URL}?query=${encodeURIComponent(query)}&limit=8&fields=title,authors,year,abstract,venue`)
      .then(res => res.status === 429 ? { data: [] } : res.json())
      .catch(() => ({ data: [] }));

    const [gData, sData] = await Promise.all([google, semantic]);
    
    const books = (gData.items || []).map((item: any) => formatData(item, 'book'));
    const articles = (sData.data || []).map((item: any) => formatData(item, 'article'));

    return [...books, ...articles].sort((a, b) => b.relevance - a.relevance);
  } catch { return []; }
};

/**
 * Busca para o Catálogo
 */
export const fetchCatalogBooks = async (category: string) => {
  const terms: any = { 'Todas': 'science', 'Ciências da Computação': 'computer science', 'Administração Pública': 'public administration', 'Direito': 'law' };
  const queryTerm = terms[category] || category;

  try {
    const google = fetch(`${GOOGLE_BOOKS_URL}?q=${encodeURIComponent(queryTerm)}&maxResults=10`)
      .then(res => res.json()).catch(() => ({ items: [] }));
    const semantic = fetch(`${SEMANTIC_SCHOLAR_URL}?query=${encodeURIComponent(queryTerm)}&limit=10&fields=title,authors,year,abstract,venue`)
      .then(res => res.json()).catch(() => ({ data: [] }));

    const [gData, sData] = await Promise.all([google, semantic]);

    const books = (gData.items || []).map((item: any) => formatData(item, 'book'));
    const articles = (sData.data || []).map((item: any) => formatData(item, 'article'));

    return [...books, ...articles];
  } catch { return []; }
};