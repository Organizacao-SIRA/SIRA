import type { PreferenceOptions, UserProfile, CompleteOnboardingPayload } from '../types';

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

/**
 * Busca Principal (Recommendations / Home) via Backend SIRA
 */
export const searchAcademicContent = async (query: string, page = 0): Promise<{ items: any[]; total: number }> => {
  if (!query || query.length < 2) return { items: [], total: 0 };
  try {
    const response = await fetch(`${API_BASE_URL}/materials/search?q=${encodeURIComponent(query)}&page=${page}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro na resposta do servidor');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar conteúdos acadêmicos:', error);
    return { items: [], total: 0 };
  }
};

/**
 * Busca Conversacional (Chat IA)
 */
export const chatSearchMaterials = async (prompt: string): Promise<{ aiMessage: string; results: any[] }> => {
  if (!prompt || prompt.trim().length < 2) return { aiMessage: '', results: [] };
  try {
    const response = await fetch(`${API_BASE_URL}/materials/chat?prompt=${encodeURIComponent(prompt)}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Erro na resposta do servidor');
    return await response.json();
  } catch (error) {
    console.error('Erro no chat de busca acadêmica:', error);
    throw error;
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
    const data = await response.json();
    return data.items ?? data;
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
      abstract: material.abstract ?? undefined,
      url: material.url ?? undefined,
      image: material.image ?? undefined,
      relevance: material.relevance || 0,
    }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`[${response.status}] ${Array.isArray(body.message) ? body.message.join('; ') : body.message || 'Erro ao adicionar aos favoritos'}`);
  }
  return response.json();
};

export const removeFavoriteApi = async (materialId: string) => {
  const response = await fetch(`${API_BASE_URL}/favorites/${encodeURIComponent(materialId)}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`[${response.status}] ${body.message || 'Erro ao remover dos favoritos'}`);
  }
  return response.json();
};

// --- User Profile ---

export const getProfile = async (): Promise<UserProfile> => {
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

// --- Preference Options & Onboarding ---

export const getPreferenceOptions = async (): Promise<PreferenceOptions> => {
  const response = await fetch(`${API_BASE_URL}/users/preference-options`, {
    headers: getAuthHeaders(),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || 'Erro ao carregar opções de preferências');
  }

  return body;
};

export const completeOnboarding = async (
  data: CompleteOnboardingPayload,
): Promise<UserProfile> => {
  const response = await fetch(`${API_BASE_URL}/users/onboarding`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || 'Erro ao salvar preferências');
  }

  return body;
};

// --- AI Recommendations ---

type RecommendationsResponse = {
  recommendations: Array<any & { aiExplanation: string | null }>;
  basedOn: { favorites: number; searches: number; preferences: boolean };
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
