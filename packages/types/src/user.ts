// ============================================================
// User & Profile Types
// ============================================================

export interface User {
  id: string
  clerkId: string
  email: string
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  role: UserRole
  createdAt: Date
  updatedAt: Date
}

export type UserRole = 'USER' | 'ADMIN' | 'MODERATOR'

export interface UserProfile {
  id: string
  userId: string
  bio: string | null
  favoriteGenres: number[]
  language: string
  country: string | null
  timezone: string | null
  createdAt: Date
  updatedAt: Date
}

export interface UserStats {
  totalWatchTime: number
  moviesWatched: number
  showsWatched: number
  episodesWatched: number
  favoriteGenre: string | null
  averageRating: number | null
}

// Watchlist Types

export interface Watchlist {
  id: string
  userId: string
  name: string
  description: string | null
  isPublic: boolean
  isPinned: boolean
  itemCount: number
  coverImageUrl: string | null
  createdAt: Date
  updatedAt: Date
}

export interface WatchlistItem {
  id: string
  watchlistId: string
  tmdbId: number
  mediaType: 'movie' | 'tv'
  addedAt: Date
  notes: string | null
  sortOrder: number
}

export interface WatchlistWithItems extends Watchlist {
  items: WatchlistItem[]
}

// Watch History Types

export interface WatchHistory {
  id: string
  userId: string
  tmdbId: number
  mediaType: 'movie' | 'tv'
  season: number | null
  episode: number | null
  currentTime: number
  duration: number
  progress: number
  completed: boolean
  lastWatchedAt: Date
  createdAt: Date
}

export interface ContinueWatching extends WatchHistory {
  title: string
  posterPath: string | null
  backdropPath: string | null
  overview: string | null
  releaseDate: string | null
  voteAverage: number | null
  seasonName?: string | null
  episodeName?: string | null
}

// Favorite Types

export interface Favorite {
  id: string
  userId: string
  tmdbId: number
  mediaType: 'movie' | 'tv'
  addedAt: Date
}

// Rating Types

export interface UserRating {
  id: string
  userId: string
  tmdbId: number
  mediaType: 'movie' | 'tv'
  rating: number
  createdAt: Date
  updatedAt: Date
}

// Review Types

export interface UserReview {
  id: string
  userId: string
  tmdbId: number
  mediaType: 'movie' | 'tv'
  content: string
  containsSpoilers: boolean
  isPublic: boolean
  likes: number
  createdAt: Date
  updatedAt: Date
}

// Settings Types

export interface UserSettings {
  id: string
  userId: string
  theme: Theme
  accentColor: string
  language: string
  autoPlay: boolean
  autoPlayNext: boolean
  defaultQuality: VideoQuality
  showSubtitles: boolean
  subtitleLanguage: string
  emailNotifications: boolean
  pushNotifications: boolean
  createdAt: Date
  updatedAt: Date
}

export type Theme = 'dark' | 'light' | 'system'
export type VideoQuality = 'auto' | '1080p' | '720p' | '480p' | '360p'

// Notification Types

export interface Notification {
  id: string
  userId: string
  type: NotificationType
  title: string
  message: string
  data: Record<string, unknown> | null
  isRead: boolean
  createdAt: Date
}

export type NotificationType =
  | 'NEW_EPISODE'
  | 'RECOMMENDATION'
  | 'WATCHLIST_UPDATE'
  | 'SYSTEM'
  | 'REVIEW_LIKE'
