const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1`;

const getToken = () => localStorage.getItem('sira_token');

const authHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

// --- Auth ---

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Credenciais inválidas');
  return data as { token: string; user: { id: string; email: string; name: string | null } };
};

export const registerUser = async (name: string, email: string, password: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro ao criar conta');
  return data as { token: string; user: { id: string; email: string; name: string | null } };
};

// --- Materials ---

export const searchAcademicContent = async (query: string) => {
  if (!query || query.length < 2) return [];
  try {
    const response = await fetch(
      `${API_BASE_URL}/materials/search?q=${encodeURIComponent(query)}`,
      { headers: authHeaders() },
    );
    if (!response.ok) throw new Error('Erro na resposta do servidor');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar conteúdos acadêmicos:', error);
    return [];
  }
};

export const fetchCatalogBooks = async (category: string) => {
  const terms: Record<string, string> = {
    'Todas': 'science',
    'Ciências da Computação': 'computer science',
    'Administração Pública': 'public administration',
    'Direito': 'law',
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

// --- Favorites ---

export const getFavorites = async () => {
  const response = await fetch(`${API_BASE_URL}/favorites`, { headers: authHeaders() });
  if (!response.ok) throw new Error('Erro ao carregar favoritos');
  return response.json();
};

export const addFavorite = async (material: any) => {
  const response = await fetch(`${API_BASE_URL}/favorites`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({
      id: material.id,
      type: material.type,
      title: material.title,
      authors: material.authors,
      year: String(material.year),
      source: material.source,
      abstract: material.abstract || null,
      url: material.url || null,
      image: material.image || null,
      relevance: material.relevance || 0,
    }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro ao adicionar favorito');
  return data;
};

export const removeFavorite = async (materialId: string) => {
  const response = await fetch(`${API_BASE_URL}/favorites/${encodeURIComponent(materialId)}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro ao remover favorito');
  return data;
};

// --- Recommendations ---

type RecommendationsResponse = {
  recommendations: Array<any & { aiExplanation: string | null }>;
  basedOn: { favorites: number; searches: number };
  generatedAt: string;
};

export const getAiRecommendations = async (): Promise<RecommendationsResponse> => {
  const response = await fetch(`${API_BASE_URL}/recommendations`, { headers: authHeaders() });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro ao buscar recomendações');
  return data;
};

export const refreshAiRecommendations = async (): Promise<RecommendationsResponse> => {
  const response = await fetch(`${API_BASE_URL}/recommendations/refresh`, {
    method: 'POST',
    headers: authHeaders(),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro ao atualizar recomendações');
  return data;
};
