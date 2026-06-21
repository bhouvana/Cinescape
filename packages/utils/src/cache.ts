// ============================================================
// Cache Key Utilities
// ============================================================

export const CacheKeys = {
  // TMDB - Movies
  trendingMovies: (timeWindow: string) => `tmdb:trending:movie:${timeWindow}`,
  popularMovies: (page: number) => `tmdb:movies:popular:${page}`,
  topRatedMovies: (page: number) => `tmdb:movies:top_rated:${page}`,
  nowPlayingMovies: (page: number) => `tmdb:movies:now_playing:${page}`,
  upcomingMovies: (page: number) => `tmdb:movies:upcoming:${page}`,
  movieDetails: (id: number) => `tmdb:movie:${id}:details`,
  movieCredits: (id: number) => `tmdb:movie:${id}:credits`,
  movieVideos: (id: number) => `tmdb:movie:${id}:videos`,
  movieImages: (id: number) => `tmdb:movie:${id}:images`,
  movieRecommendations: (id: number, page: number) => `tmdb:movie:${id}:recommendations:${page}`,
  movieSimilar: (id: number, page: number) => `tmdb:movie:${id}:similar:${page}`,
  movieReviews: (id: number) => `tmdb:movie:${id}:reviews`,
  discoverMovies: (params: string) => `tmdb:discover:movie:${params}`,

  // TMDB - TV
  trendingTV: (timeWindow: string) => `tmdb:trending:tv:${timeWindow}`,
  popularTV: (page: number) => `tmdb:tv:popular:${page}`,
  topRatedTV: (page: number) => `tmdb:tv:top_rated:${page}`,
  airingTodayTV: (page: number) => `tmdb:tv:airing_today:${page}`,
  onTheAirTV: (page: number) => `tmdb:tv:on_the_air:${page}`,
  tvDetails: (id: number) => `tmdb:tv:${id}:details`,
  tvCredits: (id: number) => `tmdb:tv:${id}:credits`,
  tvVideos: (id: number) => `tmdb:tv:${id}:videos`,
  tvImages: (id: number) => `tmdb:tv:${id}:images`,
  tvRecommendations: (id: number, page: number) => `tmdb:tv:${id}:recommendations:${page}`,
  tvSimilar: (id: number, page: number) => `tmdb:tv:${id}:similar:${page}`,
  tvReviews: (id: number) => `tmdb:tv:${id}:reviews`,
  tvSeason: (id: number, season: number) => `tmdb:tv:${id}:season:${season}`,
  discoverTV: (params: string) => `tmdb:discover:tv:${params}`,

  // TMDB - Shared
  trendingAll: (timeWindow: string) => `tmdb:trending:all:${timeWindow}`,
  movieGenres: () => `tmdb:genres:movie`,
  tvGenres: () => `tmdb:genres:tv`,
  searchMulti: (query: string, page: number) => `tmdb:search:multi:${encodeURIComponent(query)}:${page}`,
  searchMovie: (query: string, page: number) => `tmdb:search:movie:${encodeURIComponent(query)}:${page}`,
  searchTV: (query: string, page: number) => `tmdb:search:tv:${encodeURIComponent(query)}:${page}`,
  personDetails: (id: number) => `tmdb:person:${id}`,

  // User
  userWatchHistory: (userId: string, page: number) => `user:${userId}:history:${page}`,
  userWatchlist: (userId: string) => `user:${userId}:watchlist`,
  userFavorites: (userId: string) => `user:${userId}:favorites`,
  userRecommendations: (userId: string) => `user:${userId}:recommendations`,
  userStats: (userId: string) => `user:${userId}:stats`,

  // Rate Limiting
  rateLimitTmdb: () => `ratelimit:tmdb`,
  rateLimitApi: (ip: string) => `ratelimit:api:${ip}`,
} as const
