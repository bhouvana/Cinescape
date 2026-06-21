// ============================================================
// Analytics Types
// ============================================================

export type AnalyticsEvent =
  | 'movie_opened'
  | 'tv_opened'
  | 'watch_started'
  | 'watch_paused'
  | 'watch_completed'
  | 'search_performed'
  | 'watchlist_added'
  | 'favorite_added'
  | 'rating_submitted'
  | 'review_submitted'
  | 'genre_browsed'
  | 'trending_viewed'
  | 'recommendation_clicked'
  | 'sign_up'
  | 'sign_in'
  | 'session_started'
  | 'session_ended'

export interface AnalyticsEventData {
  event: AnalyticsEvent
  userId?: string
  tmdbId?: number
  mediaType?: 'movie' | 'tv'
  title?: string
  genre?: string
  searchTerm?: string
  watchProgress?: number
  sessionDuration?: number
  source?: string
  metadata?: Record<string, unknown>
  timestamp: number
}

export interface AnalyticsDashboard {
  totalViews: number
  uniqueUsers: number
  totalWatchTime: number
  topMovies: TopContent[]
  topTVShows: TopContent[]
  topSearchTerms: SearchTerm[]
  popularGenres: GenreStat[]
  dailyActiveUsers: DailyMetric[]
  watchCompletionRate: number
}

export interface TopContent {
  tmdbId: number
  title: string
  views: number
  watchTime: number
  completionRate: number
}

export interface SearchTerm {
  term: string
  count: number
  clickRate: number
}

export interface GenreStat {
  genreId: number
  genreName: string
  views: number
  percentage: number
}

export interface DailyMetric {
  date: string
  value: number
}
