import type {
  AuthResponse,
  CatalogItem,
  ChatSearchResponse,
  CompleteOnboardingPayload,
  LoginPayload,
  PreferenceOptions,
  RecommendationsResponse,
  RegisterPayload,
  SearchFilters,
  SearchResultsResponse,
  UpdateProfilePayload,
  UserProfile,
} from '../types';
import { i18n } from '../i18n';
import { getStoredUiLocale } from '../i18n/locales';

// Em desenvolvimento, usa o proxy do Vite (/api → localhost:3000).
// Em produção, VITE_API_URL aponta para o backend real.
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api/v1`
  : '/api/v1';

const BACKEND_BASE_URL = import.meta.env.VITE_API_URL ?? '';

// ── Token storage ────────────────────────────────────────────────
const TOKEN_KEY = 'sira_access_token';
const REFRESH_KEY = 'sira_refresh_token';

const saveTokens = (accessToken: string, refreshToken?: string) => {
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken);
};

export const clearTokens = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
};

const getAccessToken = () => localStorage.getItem(TOKEN_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_KEY);

// ── i18n helpers ─────────────────────────────────────────────────
const withLocaleHeader = (headers?: HeadersInit): Headers => {
  const next = new Headers(headers);
  next.set('Accept-Language', getStoredUiLocale());
  return next;
};

const apiMessage = (key: string) => i18n.t(`errors.${key}`, { ns: 'common' });

type ApiErrorPayload = {
  code?: unknown;
  message?: unknown;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const readErrorPayload = async (response: Response): Promise<ApiErrorPayload> => {
  const body: unknown = await response.json().catch(() => ({}));
  return isRecord(body) ? body : {};
};

/**
 * Resolve a mensagem de erro a partir do payload do backend.
 *
 * Ordem de prioridade:
 *   1. `errorCodes.<code>` no namespace common (tradução estável);
 *   2. `error.message` (fallback humano vindo do backend);
 *   3. fallback genérico passado pelo caller.
 */
const resolveApiError = (error: unknown, fallbackKey: string): string => {
  const payload = isRecord(error) ? error : {};
  const code = payload.code;
  if (typeof code === 'string') {
    const translated = i18n.t(`errorCodes.${code}`, { ns: 'common', defaultValue: '' });
    if (translated) return translated;
  }
  const message = payload.message;
  if (Array.isArray(message)) return message.join('. ');
  if (typeof message === 'string' && message) return message;
  return apiMessage(fallbackKey);
};

// ── Fetch with auth ──────────────────────────────────────────────
let isRefreshing = false;

const buildHeaders = (options: RequestInit): Record<string, string> => {
  const token = getAccessToken();
  return {
    ...(options.headers as Record<string, string> ?? {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const fetchWithAuth = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const response = await fetch(url, {
    ...options,
    headers: withLocaleHeader(buildHeaders(options)),
    credentials: 'include',
  });

  if (response.status === 401 && !isRefreshing) {
    isRefreshing = true;
    try {
      const refreshToken = getRefreshToken();
      const refreshed = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: withLocaleHeader({ 'Content-Type': 'application/json' }),
        credentials: 'include',
        body: refreshToken ? JSON.stringify({ refreshToken }) : undefined,
      });

      if (refreshed.ok) {
        const data: Partial<AuthResponse> = await refreshed.json();
        if (data.accessToken) saveTokens(data.accessToken, data.refreshToken);
        isRefreshing = false;
        return fetch(url, {
          ...options,
          headers: withLocaleHeader(buildHeaders(options)),
          credentials: 'include',
        });
      }
    } catch { /* ignore */ }

    isRefreshing = false;
    clearTokens();
    window.dispatchEvent(new CustomEvent('sira:auth:expired'));
    throw new Error(apiMessage('sessionExpired'));
  }

  return response;
};

// --- Auth ---

export const loginUser = async (data: LoginPayload): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: withLocaleHeader({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await readErrorPayload(response);
    throw new Error(resolveApiError(error, 'login'));
  }
  const result: AuthResponse = await response.json();
  if (result.accessToken) saveTokens(result.accessToken, result.refreshToken);
  return result;
};

export const registerUser = async (data: RegisterPayload): Promise<AuthResponse> => {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: withLocaleHeader({ 'Content-Type': 'application/json' }),
    credentials: 'include',
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await readErrorPayload(response);
    throw new Error(resolveApiError(error, 'register'));
  }
  const result: AuthResponse = await response.json();
  if (result.accessToken) saveTokens(result.accessToken, result.refreshToken);
  return result;
};

// --- Password Recovery ---

export const forgotPassword = async (email: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: withLocaleHeader({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const error = await readErrorPayload(response);
    throw new Error(resolveApiError(error, 'forgotPassword'));
  }
  return response.json();
};

export const resetPassword = async (token: string, newPassword: string) => {
  const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: withLocaleHeader({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ token, newPassword, confirmNewPassword: newPassword }),
  });
  if (!response.ok) {
    const error = await readErrorPayload(response);
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

export const searchAcademicContent = async (query: string, page = 0, filters?: SearchFilters): Promise<SearchResultsResponse> => {
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
): Promise<ChatSearchResponse> => {
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
    const body = await readErrorPayload(response);
    throw new Error(resolveApiError(body, 'searchMaterials') || `${apiMessage('searchMaterials')} (${response.status})`);
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

export const addFavorite = async (material: CatalogItem): Promise<unknown> => {
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
    const body = await readErrorPayload(response);
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
    const body = await readErrorPayload(response);
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

export const updateProfile = async (data: UpdateProfilePayload): Promise<UserProfile> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/users/profile`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const body = await readErrorPayload(response);
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
  const body: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(resolveApiError(body, 'avatarUpload'));
  }
  return body as UserProfile;
};

export const removeAvatar = async (): Promise<UserProfile> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/users/profile/avatar`, {
    method: 'DELETE',
  });
  const body: unknown = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(resolveApiError(body, 'avatarRemove'));
  return body as UserProfile;
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

export const getAiRecommendations = async (): Promise<RecommendationsResponse> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/recommendations`, {
    headers: { 'Content-Type': 'application/json' },
  });
  const data: unknown = await response.json();
  if (!response.ok) throw new Error(resolveApiError(data, 'recommendationsLoad'));
  return data as RecommendationsResponse;
};

export const refreshAiRecommendations = async (): Promise<RecommendationsResponse> => {
  const response = await fetchWithAuth(`${API_BASE_URL}/recommendations/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const data: unknown = await response.json();
  if (!response.ok) throw new Error(resolveApiError(data, 'recommendationsRefresh'));
  return data as RecommendationsResponse;
};

export const trackRecommendationEvent = (materialId: string, eventType: 'impression' | 'click' | 'favorite'): void => {
  void fetchWithAuth(`${API_BASE_URL}/recommendations/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ materialId, eventType }),
  });
};
