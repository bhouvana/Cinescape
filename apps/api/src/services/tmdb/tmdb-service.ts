import type {
  TMDBMovie,
  TMDBMovieDetails,
  TMDBMovieDetailsWithExtras,
  TMDBTVShow,
  TMDBTVShowDetails,
  TMDBTVShowDetailsWithExtras,
  TMDBPaginatedResponse,
  TMDBCredits,
  TMDBVideosResponse,
  TMDBReviewsResponse,
  TMDBSeasonDetails,
  TMDBGenre,
  TMDBSearchResponse,
  TMDBDiscoverMovieParams,
  TMDBDiscoverTVParams,
  TrendingTimeWindow,
  TMDBPersonDetails,
} from '@watchblitz/types'
import { CacheKeys } from '@watchblitz/utils'
import { TMDB_CONFIG } from '@watchblitz/config'
import { getTMDBClient } from './tmdb-client'
import { getCache, setCache } from '../../lib/redis'
import { logger } from '../../lib/logger'

function withCache<T>(
  key: string,
  ttl: number,
  fetcher: () => Promise<T>
): Promise<T> {
  return getCache<T>(key).then((cached) => {
    if (cached) return cached
    return fetcher().then((data) => {
      setCache(key, data, ttl).catch((e) =>
        logger.error('Cache write failed', { key, error: e })
      )
      return data
    })
  })
}

const client = () => getTMDBClient()

// ============================================================
// Movies
// ============================================================

export async function getTrendingMovies(
  timeWindow: TrendingTimeWindow = 'week',
  page = 1
): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  return withCache(
    CacheKeys.trendingMovies(timeWindow),
    TMDB_CONFIG.CACHE_TTL.trending,
    () => client().fetch<TMDBPaginatedResponse<TMDBMovie>>(
      `/trending/movie/${timeWindow}`,
      { params: { page } }
    )
  )
}

export async function getPopularMovies(page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  return withCache(
    CacheKeys.popularMovies(page),
    TMDB_CONFIG.CACHE_TTL.popular,
    () => client().fetch<TMDBPaginatedResponse<TMDBMovie>>('/movie/popular', { params: { page } })
  )
}

export async function getTopRatedMovies(page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  return withCache(
    CacheKeys.topRatedMovies(page),
    TMDB_CONFIG.CACHE_TTL.topRated,
    () => client().fetch<TMDBPaginatedResponse<TMDBMovie>>('/movie/top_rated', { params: { page } })
  )
}

export async function getNowPlayingMovies(page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  return withCache(
    CacheKeys.nowPlayingMovies(page),
    TMDB_CONFIG.CACHE_TTL.trending,
    () => client().fetch<TMDBPaginatedResponse<TMDBMovie>>('/movie/now_playing', { params: { page } })
  )
}

export async function getUpcomingMovies(page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  return withCache(
    CacheKeys.upcomingMovies(page),
    TMDB_CONFIG.CACHE_TTL.trending,
    () => client().fetch<TMDBPaginatedResponse<TMDBMovie>>('/movie/upcoming', { params: { page } })
  )
}

export async function getMovieDetails(id: number): Promise<TMDBMovieDetailsWithExtras> {
  return withCache(
    CacheKeys.movieDetails(id),
    TMDB_CONFIG.CACHE_TTL.details,
    () => client().fetch<TMDBMovieDetailsWithExtras>(
      `/movie/${id}`,
      {
        params: {
          append_to_response: 'credits,videos,recommendations,similar,reviews,images',
          include_image_language: 'en,null',
        },
      }
    )
  )
}

export async function getMovieCredits(id: number): Promise<TMDBCredits> {
  return withCache(
    CacheKeys.movieCredits(id),
    TMDB_CONFIG.CACHE_TTL.credits,
    () => client().fetch<TMDBCredits>(`/movie/${id}/credits`)
  )
}

export async function getMovieVideos(id: number): Promise<TMDBVideosResponse> {
  return withCache(
    CacheKeys.movieVideos(id),
    TMDB_CONFIG.CACHE_TTL.videos,
    () => client().fetch<TMDBVideosResponse>(`/movie/${id}/videos`)
  )
}

export async function getMovieReviews(id: number): Promise<TMDBReviewsResponse> {
  return withCache(
    CacheKeys.movieReviews(id),
    TMDB_CONFIG.CACHE_TTL.details,
    () => client().fetch<TMDBReviewsResponse>(`/movie/${id}/reviews`)
  )
}

export async function getMovieRecommendations(
  id: number,
  page = 1
): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  return withCache(
    CacheKeys.movieRecommendations(id, page),
    TMDB_CONFIG.CACHE_TTL.details,
    () => client().fetch<TMDBPaginatedResponse<TMDBMovie>>(`/movie/${id}/recommendations`, { params: { page } })
  )
}

export async function getSimilarMovies(id: number, page = 1): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  return withCache(
    CacheKeys.movieSimilar(id, page),
    TMDB_CONFIG.CACHE_TTL.details,
    () => client().fetch<TMDBPaginatedResponse<TMDBMovie>>(`/movie/${id}/similar`, { params: { page } })
  )
}

export async function discoverMovies(
  params: TMDBDiscoverMovieParams
): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  const paramKey = JSON.stringify(params)
  return withCache(
    CacheKeys.discoverMovies(paramKey),
    TMDB_CONFIG.CACHE_TTL.popular,
    () => client().fetch<TMDBPaginatedResponse<TMDBMovie>>('/discover/movie', {
      params: params as Record<string, string | number | boolean | undefined>,
    })
  )
}

// ============================================================
// TV Shows
// ============================================================

export async function getTrendingTV(
  timeWindow: TrendingTimeWindow = 'week',
  page = 1
): Promise<TMDBPaginatedResponse<TMDBTVShow>> {
  return withCache(
    CacheKeys.trendingTV(timeWindow),
    TMDB_CONFIG.CACHE_TTL.trending,
    () => client().fetch<TMDBPaginatedResponse<TMDBTVShow>>(
      `/trending/tv/${timeWindow}`,
      { params: { page } }
    )
  )
}

export async function getPopularTV(page = 1): Promise<TMDBPaginatedResponse<TMDBTVShow>> {
  return withCache(
    CacheKeys.popularTV(page),
    TMDB_CONFIG.CACHE_TTL.popular,
    () => client().fetch<TMDBPaginatedResponse<TMDBTVShow>>('/tv/popular', { params: { page } })
  )
}

export async function getTopRatedTV(page = 1): Promise<TMDBPaginatedResponse<TMDBTVShow>> {
  return withCache(
    CacheKeys.topRatedTV(page),
    TMDB_CONFIG.CACHE_TTL.topRated,
    () => client().fetch<TMDBPaginatedResponse<TMDBTVShow>>('/tv/top_rated', { params: { page } })
  )
}

export async function getAiringTodayTV(page = 1): Promise<TMDBPaginatedResponse<TMDBTVShow>> {
  return withCache(
    CacheKeys.airingTodayTV(page),
    TMDB_CONFIG.CACHE_TTL.trending,
    () => client().fetch<TMDBPaginatedResponse<TMDBTVShow>>('/tv/airing_today', { params: { page } })
  )
}

export async function getOnTheAirTV(page = 1): Promise<TMDBPaginatedResponse<TMDBTVShow>> {
  return withCache(
    CacheKeys.onTheAirTV(page),
    TMDB_CONFIG.CACHE_TTL.trending,
    () => client().fetch<TMDBPaginatedResponse<TMDBTVShow>>('/tv/on_the_air', { params: { page } })
  )
}

export async function getTVDetails(id: number): Promise<TMDBTVShowDetailsWithExtras> {
  return withCache(
    CacheKeys.tvDetails(id),
    TMDB_CONFIG.CACHE_TTL.details,
    () => client().fetch<TMDBTVShowDetailsWithExtras>(
      `/tv/${id}`,
      {
        params: {
          append_to_response: 'credits,videos,recommendations,similar,reviews',
        },
      }
    )
  )
}

export async function getTVSeasonDetails(
  id: number,
  season: number
): Promise<TMDBSeasonDetails> {
  return withCache(
    CacheKeys.tvSeason(id, season),
    TMDB_CONFIG.CACHE_TTL.details,
    () => client().fetch<TMDBSeasonDetails>(`/tv/${id}/season/${season}`)
  )
}

export async function getTVCredits(id: number): Promise<TMDBCredits> {
  return withCache(
    CacheKeys.tvCredits(id),
    TMDB_CONFIG.CACHE_TTL.credits,
    () => client().fetch<TMDBCredits>(`/tv/${id}/credits`)
  )
}

export async function getTVVideos(id: number): Promise<TMDBVideosResponse> {
  return withCache(
    CacheKeys.tvVideos(id),
    TMDB_CONFIG.CACHE_TTL.videos,
    () => client().fetch<TMDBVideosResponse>(`/tv/${id}/videos`)
  )
}

export async function getTVReviews(id: number): Promise<TMDBReviewsResponse> {
  return withCache(
    CacheKeys.tvReviews(id),
    TMDB_CONFIG.CACHE_TTL.details,
    () => client().fetch<TMDBReviewsResponse>(`/tv/${id}/reviews`)
  )
}

export async function getTVRecommendations(
  id: number,
  page = 1
): Promise<TMDBPaginatedResponse<TMDBTVShow>> {
  return withCache(
    CacheKeys.tvRecommendations(id, page),
    TMDB_CONFIG.CACHE_TTL.details,
    () => client().fetch<TMDBPaginatedResponse<TMDBTVShow>>(`/tv/${id}/recommendations`, { params: { page } })
  )
}

export async function getSimilarTV(id: number, page = 1): Promise<TMDBPaginatedResponse<TMDBTVShow>> {
  return withCache(
    CacheKeys.tvSimilar(id, page),
    TMDB_CONFIG.CACHE_TTL.details,
    () => client().fetch<TMDBPaginatedResponse<TMDBTVShow>>(`/tv/${id}/similar`, { params: { page } })
  )
}

export async function discoverTV(
  params: TMDBDiscoverTVParams
): Promise<TMDBPaginatedResponse<TMDBTVShow>> {
  const paramKey = JSON.stringify(params)
  return withCache(
    CacheKeys.discoverTV(paramKey),
    TMDB_CONFIG.CACHE_TTL.popular,
    () => client().fetch<TMDBPaginatedResponse<TMDBTVShow>>('/discover/tv', {
      params: params as Record<string, string | number | boolean | undefined>,
    })
  )
}

// ============================================================
// Genres
// ============================================================

export async function getMovieGenres(): Promise<{ genres: TMDBGenre[] }> {
  return withCache(
    CacheKeys.movieGenres(),
    TMDB_CONFIG.CACHE_TTL.genres,
    () => client().fetch<{ genres: TMDBGenre[] }>('/genre/movie/list')
  )
}

export async function getTVGenres(): Promise<{ genres: TMDBGenre[] }> {
  return withCache(
    CacheKeys.tvGenres(),
    TMDB_CONFIG.CACHE_TTL.genres,
    () => client().fetch<{ genres: TMDBGenre[] }>('/genre/tv/list')
  )
}

// ============================================================
// Search
// ============================================================

export async function searchMulti(query: string, page = 1): Promise<TMDBSearchResponse> {
  return withCache(
    CacheKeys.searchMulti(query, page),
    TMDB_CONFIG.CACHE_TTL.search,
    () => client().fetch<TMDBSearchResponse>('/search/multi', { params: { query, page } })
  )
}

export async function searchMovies(
  query: string,
  page = 1
): Promise<TMDBPaginatedResponse<TMDBMovie>> {
  return withCache(
    CacheKeys.searchMovie(query, page),
    TMDB_CONFIG.CACHE_TTL.search,
    () => client().fetch<TMDBPaginatedResponse<TMDBMovie>>('/search/movie', { params: { query, page } })
  )
}

export async function searchTV(
  query: string,
  page = 1
): Promise<TMDBPaginatedResponse<TMDBTVShow>> {
  return withCache(
    CacheKeys.searchTV(query, page),
    TMDB_CONFIG.CACHE_TTL.search,
    () => client().fetch<TMDBPaginatedResponse<TMDBTVShow>>('/search/tv', { params: { query, page } })
  )
}

// ============================================================
// Person
// ============================================================

export async function getPersonDetails(id: number): Promise<TMDBPersonDetails> {
  return withCache(
    CacheKeys.personDetails(id),
    TMDB_CONFIG.CACHE_TTL.details,
    () => client().fetch<TMDBPersonDetails>(`/person/${id}`)
  )
}

// ============================================================
// Trending All
// ============================================================

export async function getTrendingAll(
  timeWindow: TrendingTimeWindow = 'week',
  page = 1
): Promise<TMDBSearchResponse> {
  return withCache(
    CacheKeys.trendingAll(timeWindow),
    TMDB_CONFIG.CACHE_TTL.trending,
    () => client().fetch<TMDBSearchResponse>(`/trending/all/${timeWindow}`, { params: { page } })
  )
}
