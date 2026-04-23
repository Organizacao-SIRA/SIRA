const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1`;

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('@sira:token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const loginUser = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao realizar login');
  }
  return response.json();
};

export const registerUser = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao realizar cadastro');
  }
  return response.json();
};

/**
 * Busca Principal (Recommendations / Home) via Backend SIRA
 */
export const searchAcademicContent = async (query: string) => {
  if (!query || query.length < 2) return [];
  try {
    const response = await fetch(`${API_BASE_URL}/materials/search?q=${encodeURIComponent(query)}`, {
      headers: getAuthHeaders(),
    });
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
    const response = await fetch(`${API_BASE_URL}/materials/search?q=${encodeURIComponent(queryTerm)}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro na resposta do servidor');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar catálogo:', error);
    return [];
  }
};
