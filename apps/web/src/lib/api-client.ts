import type {
  TMDBMovie,
  TMDBMovieDetailsWithExtras,
  TMDBTVShow,
  TMDBTVShowDetailsWithExtras,
  TMDBPaginatedResponse,
  TMDBGenre,
  TMDBSearchResponse,
  TMDBSeasonDetails,
  TrendingTimeWindow,
  TMDBDiscoverMovieParams,
  TMDBDiscoverTVParams,
} from '@watchblitz/types'

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] ?? 'http://localhost:4000'

async function apiFetch<T>(
  path: string,
  options: RequestInit & { params?: Record<string, string | number | boolean | undefined> } = {}
): Promise<T> {
  const { params, ...fetchOptions } = options
  const url = new URL(`${API_BASE}/api/v1${path}`)

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined) url.searchParams.set(key, String(value))
    }
  }

  const res = await fetch(url.toString(), {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    },
  })

  if (!res.ok) {
    const errorData = await res.json().catch(() => null)
    throw new Error(
      (errorData as { error?: { message?: string } } | null)?.error?.message
        ?? `API error: ${res.status}`
    )
  }

  const json = await res.json() as { success: boolean; data: T }
  return json.data
}

async function authFetch<T>(path: string, token: string, options: RequestInit = {}): Promise<T> {
  return apiFetch<T>(path, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  })
}

// ============================================================
// Movies API
// ============================================================

export const moviesApi = {
  getTrending: (timeWindow: TrendingTimeWindow = 'week', page = 1) =>
    apiFetch<TMDBPaginatedResponse<TMDBMovie>>('/movies/trending', { params: { timeWindow, page } }),

  getPopular: (page = 1) =>
    apiFetch<TMDBPaginatedResponse<TMDBMovie>>('/movies/popular', { params: { page } }),

  getTopRated: (page = 1) =>
    apiFetch<TMDBPaginatedResponse<TMDBMovie>>('/movies/top-rated', { params: { page } }),

  getNowPlaying: (page = 1) =>
    apiFetch<TMDBPaginatedResponse<TMDBMovie>>('/movies/now-playing', { params: { page } }),

  getUpcoming: (page = 1) =>
    apiFetch<TMDBPaginatedResponse<TMDBMovie>>('/movies/upcoming', { params: { page } }),

  getDetails: (id: number) =>
    apiFetch<TMDBMovieDetailsWithExtras>(`/movies/${id}`),

  getRecommendations: (id: number, page = 1) =>
    apiFetch<TMDBPaginatedResponse<TMDBMovie>>(`/movies/${id}/recommendations`, { params: { page } }),

  getSimilar: (id: number, page = 1) =>
    apiFetch<TMDBPaginatedResponse<TMDBMovie>>(`/movies/${id}/similar`, { params: { page } }),

  getGenres: () =>
    apiFetch<{ genres: TMDBGenre[] }>('/movies/genres'),

  discover: (params: TMDBDiscoverMovieParams) =>
    apiFetch<TMDBPaginatedResponse<TMDBMovie>>('/movies/discover', {
      params: params as Record<string, string | number | boolean | undefined>,
    }),
}

// ============================================================
// TV API
// ============================================================

export const tvApi = {
  getTrending: (timeWindow: TrendingTimeWindow = 'week', page = 1) =>
    apiFetch<TMDBPaginatedResponse<TMDBTVShow>>('/tv/trending', { params: { timeWindow, page } }),

  getPopular: (page = 1) =>
    apiFetch<TMDBPaginatedResponse<TMDBTVShow>>('/tv/popular', { params: { page } }),

  getTopRated: (page = 1) =>
    apiFetch<TMDBPaginatedResponse<TMDBTVShow>>('/tv/top-rated', { params: { page } }),

  getAiringToday: (page = 1) =>
    apiFetch<TMDBPaginatedResponse<TMDBTVShow>>('/tv/airing-today', { params: { page } }),

  getOnTheAir: (page = 1) =>
    apiFetch<TMDBPaginatedResponse<TMDBTVShow>>('/tv/on-the-air', { params: { page } }),

  getDetails: (id: number) =>
    apiFetch<TMDBTVShowDetailsWithExtras>(`/tv/${id}`),

  getSeason: (id: number, season: number) =>
    apiFetch<TMDBSeasonDetails>(`/tv/${id}/season/${season}`),

  getRecommendations: (id: number, page = 1) =>
    apiFetch<TMDBPaginatedResponse<TMDBTVShow>>(`/tv/${id}/recommendations`, { params: { page } }),

  getGenres: () =>
    apiFetch<{ genres: TMDBGenre[] }>('/tv/genres'),

  discover: (params: TMDBDiscoverTVParams) =>
    apiFetch<TMDBPaginatedResponse<TMDBTVShow>>('/tv/discover', {
      params: params as Record<string, string | number | boolean | undefined>,
    }),
}

// ============================================================
// Search API
// ============================================================

export const searchApi = {
  search: (q: string, page = 1, type: 'multi' | 'movie' | 'tv' = 'multi') =>
    apiFetch<TMDBSearchResponse>('/search', { params: { q, page, type } }),

  getHistory: (token: string) =>
    authFetch<Array<{ id: string; query: string; createdAt: string }>>('/search/history', token),

  getTrending: () =>
    apiFetch<Array<{ query: string; count: number }>>('/search/trending'),
}

// ============================================================
// Trending API
// ============================================================

export const trendingApi = {
  getAll: (timeWindow: TrendingTimeWindow = 'week', page = 1) =>
    apiFetch<TMDBSearchResponse>('/trending/all', { params: { timeWindow, page } }),

  getMovies: (timeWindow: TrendingTimeWindow = 'week', page = 1) =>
    apiFetch<TMDBPaginatedResponse<TMDBMovie>>('/trending/movies', { params: { timeWindow, page } }),

  getTV: (timeWindow: TrendingTimeWindow = 'week', page = 1) =>
    apiFetch<TMDBPaginatedResponse<TMDBTVShow>>('/trending/tv', { params: { timeWindow, page } }),
}

// ============================================================
// Watch History API
// ============================================================

export const watchHistoryApi = {
  saveProgress: (
    token: string,
    data: {
      tmdbId: number
      mediaType: 'movie' | 'tv'
      season?: number
      episode?: number
      currentTime: number
      duration: number
    }
  ) => authFetch('/watch-history', token, { method: 'POST', body: JSON.stringify(data) }),

  getHistory: (token: string, page = 1) =>
    authFetch<{
      items: unknown[]
      page: number
      totalPages: number
      totalResults: number
    }>('/watch-history', token, { method: 'GET' }),

  getContinueWatching: (token: string) =>
    authFetch<unknown[]>('/watch-history/continue-watching', token),

  getProgress: (token: string, tmdbId: number, mediaType: 'movie' | 'tv') =>
    authFetch<{ currentTime: number; duration: number; progress: number } | null>(
      `/watch-history/${tmdbId}?mediaType=${mediaType}`,
      token
    ),

  delete: (token: string, tmdbId: number, mediaType: 'movie' | 'tv') =>
    authFetch(`/watch-history/${tmdbId}?mediaType=${mediaType}`, token, { method: 'DELETE' }),
}

// ============================================================
// Provider API
// ============================================================

export interface ProviderEntry {
  id: string
  name: string
  embedUrl: string
}

export const providerApi = {
  getMovieUrl: (tmdbId: number, options?: { color?: string; autoPlay?: boolean; progress?: number }) =>
    apiFetch<{ embedUrl: string; providers: ProviderEntry[] }>(`/provider/movie/${tmdbId}`, { params: options }),

  getTvUrl: (
    tmdbId: number,
    season: number,
    episode: number,
    options?: { color?: string; autoPlay?: boolean; progress?: number }
  ) => apiFetch<{ embedUrl: string; providers: ProviderEntry[] }>(`/provider/tv/${tmdbId}/${season}/${episode}`, {
    params: options,
  }),
}

// ============================================================
// User API
// ============================================================

export const userApi = {
  getMe: (token: string) =>
    authFetch<{
      id: string
      email: string
      displayName: string | null
      avatarUrl: string | null
      profile: { favoriteGenres: number[] } | null
      settings: { theme: string; accentColor: string } | null
    }>('/user/me', token),

  getStats: (token: string) =>
    authFetch<{
      totalWatchTime: number
      moviesWatched: number
      showsWatched: number
      completedTitles: number
      favorites: number
    }>('/user/me/stats', token),

  getFavorites: (token: string, page = 1) =>
    authFetch<{ items: unknown[]; page: number; totalPages: number }>(
      `/user/me/favorites?page=${page}`,
      token
    ),

  addFavorite: (token: string, tmdbId: number, mediaType: 'movie' | 'tv') =>
    authFetch('/user/me/favorites', token, {
      method: 'POST',
      body: JSON.stringify({ tmdbId, mediaType }),
    }),

  removeFavorite: (token: string, tmdbId: number, mediaType: 'movie' | 'tv') =>
    authFetch(`/user/me/favorites/${tmdbId}?mediaType=${mediaType}`, token, { method: 'DELETE' }),

  getSettings: (token: string) =>
    authFetch<Record<string, unknown>>('/user/me/settings', token),

  updateSettings: (token: string, settings: Record<string, unknown>) =>
    authFetch('/user/me/settings', token, {
      method: 'PATCH',
      body: JSON.stringify(settings),
    }),
}

// ============================================================
// AI API
// ============================================================

export interface AIDiscoverResult {
  results: (TMDBMovie | TMDBTVShow)[]
  explanation: string
  mediaType: 'movie' | 'tv' | 'both'
}

export const aiApi = {
  discover: (query: string) =>
    apiFetch<AIDiscoverResult>('/ai/search', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),
}

// ============================================================
// Watchlist API
// ============================================================

export const watchlistApi = {
  getAll: (token: string) =>
    authFetch<unknown[]>('/watchlists', token),

  create: (token: string, data: { name: string; description?: string; isPublic?: boolean }) =>
    authFetch('/watchlists', token, { method: 'POST', body: JSON.stringify(data) }),

  getById: (token: string, id: string) =>
    authFetch(`/watchlists/${id}`, token),

  getItems: (token: string, watchlistId: string, page = 1) =>
    authFetch<unknown[]>(`/watchlists/${watchlistId}/items?page=${page}`, token),

  addItem: (token: string, watchlistId: string, tmdbId: number, mediaType: 'movie' | 'tv') =>
    authFetch(`/watchlists/${watchlistId}/items`, token, {
      method: 'POST',
      body: JSON.stringify({ tmdbId, mediaType }),
    }),

  removeItem: (token: string, watchlistId: string, itemId: string) =>
    authFetch(`/watchlists/${watchlistId}/items/${itemId}`, token, { method: 'DELETE' }),

  check: (token: string, tmdbId: number, mediaType: 'movie' | 'tv') =>
    authFetch<{ inWatchlists: unknown[] }>(`/watchlists/check/${tmdbId}?mediaType=${mediaType}`, token),
}
