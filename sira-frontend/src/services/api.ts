const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/v1`;

const getAuthHeaders = (): Record<string, string> => {
  const token = localStorage.getItem('@sira:token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

// --- Auth ---

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

// --- Materials ---

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

export const fetchCatalogBooks = async (category: string) => {
  const terms: Record<string, string> = {
    'Todas': 'science',
    'Ciências da Computação': 'computer science',
    'Administração Pública': 'public administration',
    'Direito': 'law',
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

// --- Favorites ---

export const fetchFavorites = async () => {
  const response = await fetch(`${API_BASE_URL}/favorites`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Erro ao buscar favoritos');
  return response.json();
};

export const addFavorite = async (material: any) => {
  const response = await fetch(`${API_BASE_URL}/favorites`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
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
  if (!response.ok) throw new Error('Erro ao adicionar aos favoritos');
  return response.json();
};

export const removeFavoriteApi = async (materialId: string) => {
  const response = await fetch(`${API_BASE_URL}/favorites/${encodeURIComponent(materialId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Erro ao remover dos favoritos');
  return response.json();
};

// --- User Profile ---

export const getProfile = async () => {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Erro ao carregar perfil');
  return response.json();
};

export const updateProfile = async (data: Record<string, any>) => {
  const response = await fetch(`${API_BASE_URL}/users/profile`, {
    method: 'PATCH',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erro ao salvar perfil');
  return response.json();
};

// --- AI Recommendations ---

type RecommendationsResponse = {
  recommendations: Array<any & { aiExplanation: string | null }>;
  basedOn: { favorites: number; searches: number };
  generatedAt: string;
};

export const getAiRecommendations = async (): Promise<RecommendationsResponse> => {
  const response = await fetch(`${API_BASE_URL}/recommendations`, {
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro ao buscar recomendações');
  return data;
};

export const refreshAiRecommendations = async (): Promise<RecommendationsResponse> => {
  const response = await fetch(`${API_BASE_URL}/recommendations/refresh`, {
    method: 'POST',
    headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro ao atualizar recomendações');
  return data;
};
