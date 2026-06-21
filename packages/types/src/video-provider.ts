// ============================================================
// Video Provider Types
// ============================================================

export interface VideoProvider {
  id: string
  name: string
  baseUrl: string
  getMovieEmbedUrl(tmdbId: number, options?: VideoProviderOptions): string
  getTvEmbedUrl(
    tmdbId: number,
    season: number,
    episode: number,
    options?: VideoProviderOptions
  ): string
}

export interface VideoProviderOptions {
  color?: string
  autoPlay?: boolean
  nextEpisode?: boolean
  episodeSelector?: boolean
  progress?: number
}

export interface VideoProviderConfig {
  id: string
  name: string
  baseUrl: string
  moviePath: string
  tvPath: string
  supportedParams: VideoProviderParam[]
  isActive: boolean
  priority: number
}

export type VideoProviderParam = 'color' | 'autoPlay' | 'nextEpisode' | 'episodeSelector' | 'progress'

export interface PlayerEvent {
  type: 'PLAYER_EVENT'
  data: PlayerEventData
}

export interface PlayerEventData {
  event: PlayerEventType
  currentTime: number
  duration: number
  progress: number
  id: string
  mediaType: 'movie' | 'tv'
  season?: number
  episode?: number
  timestamp: number
}

export type PlayerEventType = 'timeupdate' | 'play' | 'pause' | 'ended' | 'seeked'

export interface WatchProgress {
  tmdbId: number
  mediaType: 'movie' | 'tv'
  currentTime: number
  duration: number
  progress: number
  season?: number
  episode?: number
  lastUpdated: number
}
