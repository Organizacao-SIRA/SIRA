import type { PreferenceOptions, UserProfile, CompleteOnboardingPayload, CatalogItem } from '../types';

// Em desenvolvimento, usa o proxy do Vite (/api → localhost:3000).
// Em produção, VITE_API_URL aponta para o backend real.
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

const BACKEND_BASE_URL = import.meta.env.VITE_API_URL ?? '';

let isRefreshing = false;

const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const response = await fetch(url, { ...options, credentials: 'include' });

  if (response.status === 401 && !isRefreshing) {
    isRefreshing = true;
    try {
      const refreshed = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshed.ok) {
        isRefreshing = false;
        return fetch(url, { ...options, credentials: 'include' });
      }
    } catch { /* ignore */ }

    isRefreshing = false;
    window.dispatchEvent(new CustomEvent('sira:auth:expired'));
    throw new Error('Sessão expirada. Faça login novamente.');
  }

  return response;
};

// --- Auth ---

export const loginUser = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
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
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao realizar cadastro');
  }
  return response.json();
};

// --- Materials ---

export const searchAcademicContent = async (query: string, page = 0): Promise<{ items: any[]; total: number }> => {
  if (!query || query.length < 2) return { items: [], total: 0 };
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/materials/search?q=${encodeURIComponent(query)}&page=${page}`,
    );
    if (!response.ok) throw new Error('Erro na resposta do servidor');
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar conteúdos acadêmicos:', error);
    return { items: [], total: 0 };
  }
};

export const chatSearchMaterials = async (prompt: string): Promise<{ aiMessage: string; results: any[] }> => {
  if (!prompt || prompt.trim().length < 2) return { aiMessage: '', results: [] };
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/materials/chat?prompt=${encodeURIComponent(prompt)}`,
    );
    if (!response.ok) throw new Error('Erro na resposta do servidor');
    return await response.json();
  } catch (error) {
    console.error('Erro no chat de busca acadêmica:', error);
    throw error;
  }
};

export const TOPIC_SEARCH_QUERIES: Record<string, string> = {
  all: 'science research',
  ia: 'technology artificial intelligence',
  gp: 'public administration governance',
  dir: 'law legal rights',
  cd: 'data science analytics',
  edu: 'education pedagogy learning',
  sau: 'health medicine',
  eco: 'economics finance',
  soc: 'sociology social science',
  amb: 'environment ecology sustainability',
};

const CATALOG_PAGE_SIZE = 10;

export const searchCatalogItems = async (
  query: string,
  page = 0,
  signal?: AbortSignal,
): Promise<{ items: CatalogItem[]; total: number }> => {
  if (!query || query.trim().length < 2) return { items: [], total: 0 };
  const response = await fetchWithAuth(
    `${API_BASE_URL}/materials/search?q=${encodeURIComponent(query.trim())}&page=${page}&limit=${CATALOG_PAGE_SIZE}`,
    { signal },
  );
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `Erro ${response.status} ao buscar materiais`);
  }
  return response.json();
};

// --- Favorites ---

export const fetchFavorites = async () => {
  const response = await fetchWithAuth(`${API_BASE_URL}/favorites`);
  if (!response.ok) throw new Error('Erro ao buscar favoritos');
  return response.json();
};

export const addFavorite = async (material: any) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  const response = await fetchWithAuth(
    `${API_BASE_URL}/favorites/${encodeURIComponent(materialId)}`,
    { method: 'DELETE' },
  );
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`[${response.status}] ${body.message || 'Erro ao remover dos favoritos'}`);
  }
  return response.json();
};

// --- User Profile ---

export const getProfile = async (): Promise<UserProfile> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/users/profile`);
  if (!response.ok) throw new Error('Erro ao carregar perfil');
  return response.json();
};

export const updateProfile = async (data: Record<string, any>) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/users/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Erro ao salvar perfil');
  return response.json();
};

export const resolveAvatarUrl = (path: string | null | undefined): string | null =>
  path ? `${BACKEND_BASE_URL}${path}` : null;

export const uploadAvatar = async (file: File): Promise<UserProfile> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetchWithAuth(`${API_BASE_URL}/users/profile/avatar`, {
    method: 'POST',
    body: formData,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(Array.isArray(body.message) ? body.message.join('; ') : body.message || 'Erro ao enviar imagem');
  }
  return body;
};

export const removeAvatar = async (): Promise<UserProfile> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/users/profile/avatar`, {
    method: 'DELETE',
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || 'Erro ao remover imagem');
  return body;
};

// --- Preference Options & Onboarding ---

export const getPreferenceOptions = async (): Promise<PreferenceOptions> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/users/preference-options`);
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || 'Erro ao carregar opções de preferências');
  }
  return body;
};

export const completeOnboarding = async (
  data: CompleteOnboardingPayload,
): Promise<UserProfile> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/users/onboarding`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
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
  const response = await fetchWithAuth(`${API_BASE_URL}/recommendations`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro ao buscar recomendações');
  return data;
};

export const refreshAiRecommendations = async (): Promise<RecommendationsResponse> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/recommendations/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Erro ao atualizar recomendações');
  return data;
};
