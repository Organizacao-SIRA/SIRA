import type { PreferenceOptions, UserProfile, CompleteOnboardingPayload, CatalogItem, SearchFilters } from '../types';
import { i18n } from '../i18n';
import { getStoredUiLocale } from '../i18n/locales';

// Em desenvolvimento, usa o proxy do Vite (/api → localhost:3000).
// Em produção, VITE_API_URL aponta para o backend real.
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

const BACKEND_BASE_URL = import.meta.env.VITE_API_URL ?? '';

let refreshPromise: Promise<boolean> | null = null;

const withLocaleHeader = (headers?: HeadersInit): Headers => {
  const next = new Headers(headers);
  next.set('Accept-Language', getStoredUiLocale());
  return next;
};

const apiMessage = (key: string) => i18n.t(`errors.${key}`, { ns: 'common' });

/**
 * Resolve a mensagem de erro a partir do payload do backend.
 *
 * Ordem de prioridade:
 *   1. `errorCodes.<code>` no namespace common (tradução estável);
 *   2. `error.message` (fallback humano vindo do backend);
 *   3. fallback genérico passado pelo caller.
 */
const resolveApiError = (error: any, fallbackKey: string): string => {
  const code = error?.code;
  if (typeof code === 'string') {
    const translated = i18n.t(`errorCodes.${code}`, { ns: 'common', defaultValue: '' });
    if (translated) return translated;
  }
  const message = error?.message;
  if (Array.isArray(message)) return message.join('. ');
  if (typeof message === 'string' && message) return message;
  return apiMessage(fallbackKey);
};

const refreshAuthSession = (): Promise<boolean> => {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(response => response.ok)
      .catch(() => false)
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const response = await fetch(url, { ...options, headers: withLocaleHeader(options.headers), credentials: 'include' });

  if (response.status === 401) {
    const refreshed = await refreshAuthSession();
    if (refreshed) return fetch(url, { ...options, headers: withLocaleHeader(options.headers), credentials: 'include' });

    window.dispatchEvent(new CustomEvent('sira:auth:expired'));
    throw new Error(apiMessage('sessionExpired'));
  }

  return response;
};

// --- Auth ---

export const loginUser = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: withLocaleHeader({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(resolveApiError(error, 'login'));
  }
  return response.json();
};

export const registerUser = async (data: any) => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: withLocaleHeader({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(resolveApiError(error, 'register'));
  }
  return response.json();
};

// --- Password Recovery ---

export const forgotPassword = async (email: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: withLocaleHeader({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(resolveApiError(error, 'forgotPassword'));
  }
  return response.json();
};

export const resetPassword = async (token: string, newPassword: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: withLocaleHeader({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ token, newPassword }),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(resolveApiError(error, 'resetPassword'));
  }
  return response.json();
};

export const validateResetToken = async (token: string): Promise<{ valid: boolean }> => {
  const response = await fetch(`${API_BASE_URL}/auth/validate-reset-token?token=${encodeURIComponent(token)}`, {
    headers: withLocaleHeader(),
  });
  if (!response.ok) return { valid: false };
  return response.json();
};

// --- Materials ---

function buildFilterParams(filters?: SearchFilters): string {
  if (!filters) return '';
  const params = new URLSearchParams();
  if (filters.types.length === 1) params.set('types', filters.types[0]);
  if (filters.area) params.set('area', filters.area);
  if (filters.openAccessOnly) params.set('openAccessOnly', 'true');
  if (filters.yearFrom !== null) params.set('yearFrom', String(filters.yearFrom));
  const str = params.toString();
  return str ? `&${str}` : '';
}

export const searchAcademicContent = async (query: string, page = 0, filters?: SearchFilters): Promise<{ items: any[]; total: number }> => {
  if (!query || query.length < 2) return { items: [], total: 0 };
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/materials/search?q=${encodeURIComponent(query)}&page=${page}${buildFilterParams(filters)}`,
    );
    if (!response.ok) throw new Error(apiMessage('serverResponse'));
    return await response.json();
  } catch (error) {
    console.error('Erro ao buscar conteúdos acadêmicos:', error);
    return { items: [], total: 0 };
  }
};

interface ChatSearchOptions {
  excludeIds?: string[];
  diversify?: boolean;
}

function buildChatSearchParams(prompt: string, filters?: SearchFilters, options?: ChatSearchOptions): string {
  const params = new URLSearchParams({ prompt });
  if (filters?.types.length === 1) params.set('types', filters.types[0]);
  if (filters?.area) params.set('area', filters.area);
  if (filters?.openAccessOnly) params.set('openAccessOnly', 'true');
  if (filters?.yearFrom !== null && filters?.yearFrom !== undefined) params.set('yearFrom', String(filters.yearFrom));
  if (options?.excludeIds?.length) params.set('excludeIds', options.excludeIds.join(','));
  if (options?.diversify) params.set('diversify', 'true');
  return params.toString();
}

export const chatSearchMaterials = async (
  prompt: string,
  filters?: SearchFilters,
  options?: ChatSearchOptions,
): Promise<{ aiMessage: string; results: any[] }> => {
  if (!prompt || prompt.trim().length < 2) return { aiMessage: '', results: [] };
  try {
    const response = await fetchWithAuth(
      `${API_BASE_URL}/materials/chat?${buildChatSearchParams(prompt, filters, options)}`,
    );
    if (!response.ok) throw new Error(apiMessage('serverResponse'));
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
  filters?: SearchFilters,
  signal?: AbortSignal,
): Promise<{ items: CatalogItem[]; total: number }> => {
  if (!query || query.trim().length < 2) return { items: [], total: 0 };
  const response = await fetchWithAuth(
    `${API_BASE_URL}/materials/search?q=${encodeURIComponent(query.trim())}&page=${page}&limit=${CATALOG_PAGE_SIZE}${buildFilterParams(filters)}`,
    { signal },
  );
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.message || `${apiMessage('searchMaterials')} (${response.status})`);
  }
  return response.json();
};

// --- Favorites ---

export type FavoriteTypeFilter = 'all' | 'book' | 'article';

export interface FavoritesPage {
  items: CatalogItem[];
  total: number;
  page: number;
  totalPages: number;
  counts: Record<FavoriteTypeFilter, number>;
}

interface FetchFavoritesOptions {
  page?: number;
  limit?: number;
  type?: FavoriteTypeFilter;
  signal?: AbortSignal;
}

export const fetchFavoriteIds = async (): Promise<string[]> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/favorites/ids`);
  if (!response.ok) throw new Error(apiMessage('favoritesLoad'));
  return response.json();
};

export const fetchFavorites = async ({
  page = 0,
  limit = 20,
  type = 'all',
  signal,
}: FetchFavoritesOptions = {}): Promise<FavoritesPage> => {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (type !== 'all') params.set('type', type);

  const response = await fetchWithAuth(`${API_BASE_URL}/favorites?${params.toString()}`, { signal });
  if (!response.ok) throw new Error(apiMessage('favoritesLoad'));
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
      provider: material.provider ?? undefined,
      aiExplanation: material.aiExplanation ?? material.aiJustification ?? undefined,
    }),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(`[${response.status}] ${resolveApiError(body, 'favoriteAdd')}`);
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
    throw new Error(`[${response.status}] ${resolveApiError(body, 'favoriteRemove')}`);
  }
  return response.json();
};

// --- User Profile ---

export const getProfile = async (): Promise<UserProfile> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/users/profile`);
  if (!response.ok) throw new Error(apiMessage('profileLoad'));
  return response.json();
};

export const updateProfile = async (data: Record<string, any>) => {
  const response = await fetchWithAuth(`${API_BASE_URL}/users/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(resolveApiError(body, 'profileSave'));
  }
  return response.json();
};

export const resolveAvatarUrl = (path: string | null | undefined): string | null => {
  if (!path) return null;
  return path.startsWith('http') ? path : `${BACKEND_BASE_URL}${path}`;
};

export const uploadAvatar = async (file: File): Promise<UserProfile> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await fetchWithAuth(`${API_BASE_URL}/users/profile/avatar`, {
    method: 'POST',
    body: formData,
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(resolveApiError(body, 'avatarUpload'));
  }
  return body;
};

export const removeAvatar = async (): Promise<UserProfile> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/users/profile/avatar`, {
    method: 'DELETE',
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message || apiMessage('avatarRemove'));
  return body;
};

// --- Preference Options & Onboarding ---

export const getPreferenceOptions = async (): Promise<PreferenceOptions> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/users/preference-options`);
  const body = await response.json();
  if (!response.ok) {
    throw new Error(body.message || apiMessage('preferencesLoad'));
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
    throw new Error(body.message || apiMessage('preferencesSave'));
  }
  return body;
};

// --- AI Recommendations ---

type RecommendationsResponse = {
  recommendations: Array<any & { aiExplanation: string | null }>;
  basedOn: { favorites: number; searches: number; preferences: boolean };
  generatedAt: string;
  coldStart?: boolean;
};

export const getAiRecommendations = async (): Promise<RecommendationsResponse> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/recommendations`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || apiMessage('recommendationsLoad'));
  return data;
};

export const refreshAiRecommendations = async (): Promise<RecommendationsResponse> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/recommendations/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || apiMessage('recommendationsRefresh'));
  return data;
};

export const trackRecommendationEvent = (materialId: string, eventType: 'impression' | 'click' | 'favorite'): void => {
  void fetchWithAuth(`${API_BASE_URL}/recommendations/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ materialId, eventType }),
  });
};
