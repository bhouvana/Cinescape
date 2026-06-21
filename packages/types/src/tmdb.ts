// ============================================================
// TMDB API Types
// ============================================================

export type MediaType = 'movie' | 'tv' | 'person'

export interface TMDBPaginatedResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface TMDBImage {
  aspect_ratio: number
  file_path: string
  height: number
  iso_639_1: string | null
  vote_average: number
  vote_count: number
  width: number
}

export interface TMDBGenre {
  id: number
  name: string
}

export interface TMDBProductionCompany {
  id: number
  logo_path: string | null
  name: string
  origin_country: string
}

export interface TMDBProductionCountry {
  iso_3166_1: string
  name: string
}

export interface TMDBSpokenLanguage {
  english_name: string
  iso_639_1: string
  name: string
}

export interface TMDBCastMember {
  adult: boolean
  gender: number | null
  id: number
  known_for_department: string
  name: string
  original_name: string
  popularity: number
  profile_path: string | null
  cast_id?: number
  character: string
  credit_id: string
  order: number
}

export interface TMDBCrewMember {
  adult: boolean
  gender: number | null
  id: number
  known_for_department: string
  name: string
  original_name: string
  popularity: number
  profile_path: string | null
  credit_id: string
  department: string
  job: string
}

export interface TMDBCredits {
  id: number
  cast: TMDBCastMember[]
  crew: TMDBCrewMember[]
}

export interface TMDBVideo {
  iso_639_1: string
  iso_3166_1: string
  name: string
  key: string
  site: string
  size: number
  type: string
  official: boolean
  published_at: string
  id: string
}

export interface TMDBVideosResponse {
  id: number
  results: TMDBVideo[]
}

export interface TMDBReview {
  author: string
  author_details: {
    name: string
    username: string
    avatar_path: string | null
    rating: number | null
  }
  content: string
  created_at: string
  id: string
  updated_at: string
  url: string
}

export interface TMDBReviewsResponse {
  id: number
  page: number
  results: TMDBReview[]
  total_pages: number
  total_results: number
}

// Movie Types

export interface TMDBMovie {
  adult: boolean
  backdrop_path: string | null
  genre_ids: number[]
  id: number
  original_language: string
  original_title: string
  overview: string
  popularity: number
  poster_path: string | null
  release_date: string
  title: string
  video: boolean
  vote_average: number
  vote_count: number
  media_type?: MediaType
}

export interface TMDBMovieDetails extends Omit<TMDBMovie, 'genre_ids'> {
  belongs_to_collection: {
    id: number
    name: string
    poster_path: string | null
    backdrop_path: string | null
  } | null
  budget: number
  genres: TMDBGenre[]
  homepage: string | null
  imdb_id: string | null
  production_companies: TMDBProductionCompany[]
  production_countries: TMDBProductionCountry[]
  revenue: number
  runtime: number | null
  spoken_languages: TMDBSpokenLanguage[]
  status: string
  tagline: string | null
}

export interface TMDBMovieDetailsWithExtras extends TMDBMovieDetails {
  credits: TMDBCredits
  videos: TMDBVideosResponse
  recommendations: TMDBPaginatedResponse<TMDBMovie>
  similar: TMDBPaginatedResponse<TMDBMovie>
  reviews: TMDBReviewsResponse
  images: {
    backdrops: TMDBImage[]
    logos: TMDBImage[]
    posters: TMDBImage[]
  }
}

// TV Show Types

export interface TMDBEpisode {
  air_date: string | null
  episode_number: number
  id: number
  name: string
  overview: string
  production_code: string
  runtime: number | null
  season_number: number
  show_id: number
  still_path: string | null
  vote_average: number
  vote_count: number
}

export interface TMDBSeason {
  air_date: string | null
  episode_count: number
  id: number
  name: string
  overview: string
  poster_path: string | null
  season_number: number
  vote_average: number
}

export interface TMDBSeasonDetails extends TMDBSeason {
  episodes: TMDBEpisode[]
  _id: string
}

export interface TMDBTVShow {
  adult: boolean
  backdrop_path: string | null
  genre_ids: number[]
  id: number
  origin_country: string[]
  original_language: string
  original_name: string
  overview: string
  popularity: number
  poster_path: string | null
  first_air_date: string
  name: string
  vote_average: number
  vote_count: number
  media_type?: MediaType
}

export interface TMDBTVShowDetails extends Omit<TMDBTVShow, 'genre_ids'> {
  created_by: Array<{
    id: number
    credit_id: string
    name: string
    original_name: string
    gender: number | null
    profile_path: string | null
  }>
  episode_run_time: number[]
  genres: TMDBGenre[]
  homepage: string
  in_production: boolean
  languages: string[]
  last_air_date: string | null
  last_episode_to_air: TMDBEpisode | null
  next_episode_to_air: TMDBEpisode | null
  networks: Array<{
    id: number
    logo_path: string | null
    name: string
    origin_country: string
  }>
  number_of_episodes: number
  number_of_seasons: number
  production_companies: TMDBProductionCompany[]
  production_countries: TMDBProductionCountry[]
  seasons: TMDBSeason[]
  spoken_languages: TMDBSpokenLanguage[]
  status: string
  tagline: string
  type: string
}

export interface TMDBTVShowDetailsWithExtras extends TMDBTVShowDetails {
  credits: TMDBCredits
  videos: TMDBVideosResponse
  recommendations: TMDBPaginatedResponse<TMDBTVShow>
  similar: TMDBPaginatedResponse<TMDBTVShow>
  reviews: TMDBReviewsResponse
}

// Person Types

export interface TMDBPerson {
  adult: boolean
  gender: number | null
  id: number
  known_for_department: string
  name: string
  original_name: string
  popularity: number
  profile_path: string | null
  known_for: (TMDBMovie | TMDBTVShow)[]
  media_type?: 'person'
}

export interface TMDBPersonDetails {
  adult: boolean
  also_known_as: string[]
  biography: string
  birthday: string | null
  deathday: string | null
  gender: number | null
  homepage: string | null
  id: number
  imdb_id: string
  known_for_department: string
  name: string
  place_of_birth: string | null
  popularity: number
  profile_path: string | null
}

// Search Types

export type TMDBSearchResult = TMDBMovie | TMDBTVShow | TMDBPerson

export interface TMDBSearchResponse {
  page: number
  results: TMDBSearchResult[]
  total_pages: number
  total_results: number
}

// Discover Types

export interface TMDBDiscoverMovieParams {
  page?: number
  sort_by?: string
  with_genres?: string
  primary_release_year?: number
  'vote_average.gte'?: number
  'vote_average.lte'?: number
  with_original_language?: string
  'primary_release_date.gte'?: string
  'primary_release_date.lte'?: string
  'vote_count.gte'?: number
  with_watch_providers?: string
  watch_region?: string
}

export interface TMDBDiscoverTVParams {
  page?: number
  sort_by?: string
  with_genres?: string
  first_air_date_year?: number
  'vote_average.gte'?: number
  'vote_average.lte'?: number
  with_original_language?: string
  'first_air_date.gte'?: string
  'first_air_date.lte'?: string
  'vote_count.gte'?: number
  with_status?: string
  with_type?: string
}

// Trending

export type TrendingTimeWindow = 'day' | 'week'
