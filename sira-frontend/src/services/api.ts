const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1`;

/**
 * Busca Principal (Recommendations / Home) via Backend SIRA
 */
export const searchAcademicContent = async (query: string) => {
  if (!query || query.length < 2) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/materials/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Erro na resposta do servidor');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar conteúdos acadêmicos:', error);
    return [];
  }
};

/**
 * Busca para o Catálogo via Backend SIRA
 */
export const fetchCatalogBooks = async (category: string) => {
  const terms: any = { 
    'Todas': 'science', 
    'Ciências da Computação': 'computer science', 
    'Administração Pública': 'public administration', 
    'Direito': 'law' 
  };
  const queryTerm = terms[category] || category;

  try {
    const response = await fetch(`${API_BASE_URL}/materials/search?q=${encodeURIComponent(queryTerm)}`);
    if (!response.ok) throw new Error('Erro na resposta do servidor');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar catálogo:', error);
    return [];
  }
};
