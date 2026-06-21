// ============================================================
// TMDB Configuration
// ============================================================

export const TMDB_CONFIG = {
  BASE_URL: 'https://api.themoviedb.org/3',
  IMAGE_BASE_URL: 'https://image.tmdb.org/t/p',
  BACKDROP_SIZES: {
    small: 'w300',
    medium: 'w780',
    large: 'w1280',
    original: 'original',
  },
  POSTER_SIZES: {
    tiny: 'w92',
    small: 'w154',
    medium: 'w185',
    large: 'w342',
    xlarge: 'w500',
    xxlarge: 'w780',
    original: 'original',
  },
  PROFILE_SIZES: {
    small: 'w45',
    medium: 'w185',
    large: 'h632',
    original: 'original',
  },
  LOGO_SIZES: {
    tiny: 'w45',
    small: 'w92',
    medium: 'w154',
    large: 'w185',
    xlarge: 'w300',
    xxlarge: 'w500',
    original: 'original',
  },
  CACHE_TTL: {
    trending: 60 * 30, // 30 minutes
    popular: 60 * 60, // 1 hour
    topRated: 60 * 60 * 2, // 2 hours
    details: 60 * 60 * 6, // 6 hours
    search: 60 * 5, // 5 minutes
    genres: 60 * 60 * 24, // 24 hours
    credits: 60 * 60 * 12, // 12 hours
    images: 60 * 60 * 12, // 12 hours
    videos: 60 * 60 * 6, // 6 hours
  },
  RATE_LIMIT: {
    MAX_REQUESTS_PER_SECOND: 40,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
  },
  ENDPOINTS: {
    // Trending
    TRENDING_MOVIE: '/trending/movie',
    TRENDING_TV: '/trending/tv',
    TRENDING_ALL: '/trending/all',
    // Popular
    POPULAR_MOVIES: '/movie/popular',
    POPULAR_TV: '/tv/popular',
    // Top Rated
    TOP_RATED_MOVIES: '/movie/top_rated',
    TOP_RATED_TV: '/tv/top_rated',
    // Upcoming / Now Playing
    NOW_PLAYING: '/movie/now_playing',
    UPCOMING: '/movie/upcoming',
    AIRING_TODAY: '/tv/airing_today',
    ON_THE_AIR: '/tv/on_the_air',
    // Details
    MOVIE_DETAILS: '/movie/{id}',
    TV_DETAILS: '/tv/{id}',
    PERSON_DETAILS: '/person/{id}',
    SEASON_DETAILS: '/tv/{id}/season/{season}',
    EPISODE_DETAILS: '/tv/{id}/season/{season}/episode/{episode}',
    // Search
    SEARCH_MULTI: '/search/multi',
    SEARCH_MOVIE: '/search/movie',
    SEARCH_TV: '/search/tv',
    SEARCH_PERSON: '/search/person',
    // Discover
    DISCOVER_MOVIE: '/discover/movie',
    DISCOVER_TV: '/discover/tv',
    // Genres
    MOVIE_GENRES: '/genre/movie/list',
    TV_GENRES: '/genre/tv/list',
  },
} as const

export type TMDBImageSize = 'tiny' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'original'

export function buildImageUrl(path: string | null, size = 'original'): string | null {
  if (!path) return null
  return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`
}

export function buildPosterUrl(path: string | null, size: TMDBImageSize = 'large'): string | null {
  const sizeMap = TMDB_CONFIG.POSTER_SIZES
  const s = sizeMap[size as keyof typeof sizeMap] ?? 'w342'
  return buildImageUrl(path, s)
}

export function buildBackdropUrl(path: string | null, size: TMDBImageSize = 'large'): string | null {
  const sizeMap = TMDB_CONFIG.BACKDROP_SIZES
  const s = sizeMap[size as keyof typeof sizeMap] ?? 'w1280'
  return buildImageUrl(path, s)
}

export function buildProfileUrl(path: string | null, size: TMDBImageSize = 'medium'): string | null {
  const sizeMap = TMDB_CONFIG.PROFILE_SIZES
  const s = sizeMap[size as keyof typeof sizeMap] ?? 'w185'
  return buildImageUrl(path, s)
}
