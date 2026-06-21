// ============================================================
// Video Provider Configuration
// ============================================================
// Providers are tried in priority order. Choose ones with .com/.cc/.me/.at TLDs
// that are not typically ISP-blocked. Providers with .to/.su tend to get blocked.

import type { VideoProviderConfig } from '@watchblitz/types'

// vidsrc.me — different from vidsrc.to, globally reliable, query-param style
const VIDSRCME_CONFIG: VideoProviderConfig = {
  id: 'vidsrcme',
  name: 'Server 1',
  baseUrl: 'https://vidsrc.me',
  moviePath: '/embed/movie?tmdb={tmdbId}',
  tvPath: '/embed/tv?tmdb={tmdbId}&season={season}&episode={episode}',
  supportedParams: [],
  isActive: true,
  priority: 1,
}

// 2embed.cc — clean embed player, globally accessible .cc TLD
const TWOEMBED_CONFIG: VideoProviderConfig = {
  id: '2embed',
  name: 'Server 2',
  baseUrl: 'https://www.2embed.cc',
  moviePath: '/embed/{tmdbId}',
  tvPath: '/embedtv/{tmdbId}?s={season}&e={episode}',
  supportedParams: [],
  isActive: true,
  priority: 2,
}

// moviesapi.club — good content coverage, TV uses dash-separated path
const MOVIESAPI_CONFIG: VideoProviderConfig = {
  id: 'moviesapi',
  name: 'Server 3',
  baseUrl: 'https://moviesapi.club',
  moviePath: '/movie/{tmdbId}',
  tvPath: '/tv/{tmdbId}-{season}-{episode}',
  supportedParams: [],
  isActive: true,
  priority: 3,
}

// autoembed.cc — fallback with its own multi-source player
const AUTOEMBED_CONFIG: VideoProviderConfig = {
  id: 'autoembed',
  name: 'Server 4',
  baseUrl: 'https://player.autoembed.cc',
  moviePath: '/embed/movie/{tmdbId}',
  tvPath: '/embed/tv/{tmdbId}/{season}/{episode}',
  supportedParams: [],
  isActive: true,
  priority: 4,
}

// multiembed.mov — extra fallback with its own source aggregation
const MULTIEMBED_CONFIG: VideoProviderConfig = {
  id: 'multiembed',
  name: 'Server 5',
  baseUrl: 'https://multiembed.mov',
  moviePath: '/?video_id={tmdbId}&tmdb=1',
  tvPath: '/?video_id={tmdbId}&tmdb=1&s={season}&e={episode}',
  supportedParams: [],
  isActive: true,
  priority: 5,
}

export const PROVIDER_REGISTRY: VideoProviderConfig[] = [
  TWOEMBED_CONFIG,
]

export const DEFAULT_PROVIDER_OPTIONS = {
  color: 'e50914',
  autoPlay: true,
  nextEpisode: true,
  episodeSelector: true,
}
