import type { VideoProvider, VideoProviderOptions, VideoProviderConfig, VideoProviderParam } from '@watchblitz/types'
import { PROVIDER_REGISTRY, DEFAULT_PROVIDER_OPTIONS } from '@watchblitz/config'

// ============================================================
// Generic Embed Provider — builds URLs from config templates
// ============================================================

class GenericEmbedProvider implements VideoProvider {
  id: string
  name: string
  baseUrl: string
  private moviePath: string
  private tvPath: string
  private supportedParams: VideoProviderParam[]

  constructor(config: VideoProviderConfig) {
    this.id = config.id
    this.name = config.name
    this.baseUrl = config.baseUrl
    this.moviePath = config.moviePath
    this.tvPath = config.tvPath
    this.supportedParams = config.supportedParams
  }

  getMovieEmbedUrl(tmdbId: number, options: VideoProviderOptions = {}): string {
    const path = this.moviePath.replace('{tmdbId}', String(tmdbId))
    const url = new URL(`${this.baseUrl}${path}`)
    this.applyOptions(url, options)
    return url.toString()
  }

  getTvEmbedUrl(tmdbId: number, season: number, episode: number, options: VideoProviderOptions = {}): string {
    const path = this.tvPath
      .replace('{tmdbId}', String(tmdbId))
      .replace('{season}', String(season))
      .replace('{episode}', String(episode))
    const url = new URL(`${this.baseUrl}${path}`)
    this.applyOptions(url, { nextEpisode: true, episodeSelector: true, ...options })
    return url.toString()
  }

  private applyOptions(url: URL, options: VideoProviderOptions): void {
    if (this.supportedParams.length === 0) return
    const merged = { ...DEFAULT_PROVIDER_OPTIONS, ...options }
    if (this.supportedParams.includes('color') && merged.color) {
      url.searchParams.set('color', merged.color.replace('#', ''))
    }
    if (this.supportedParams.includes('autoPlay') && merged.autoPlay !== undefined) {
      url.searchParams.set('autoPlay', String(merged.autoPlay))
    }
    if (this.supportedParams.includes('nextEpisode') && merged.nextEpisode !== undefined) {
      url.searchParams.set('nextEpisode', String(merged.nextEpisode))
    }
    if (this.supportedParams.includes('episodeSelector') && merged.episodeSelector !== undefined) {
      url.searchParams.set('episodeSelector', String(merged.episodeSelector))
    }
    if (this.supportedParams.includes('progress') && merged.progress !== undefined && merged.progress > 0) {
      url.searchParams.set('progress', String(Math.floor(merged.progress)))
    }
  }
}

// ============================================================
// Provider Registry
// ============================================================

class ProviderRegistry {
  private providers: Map<string, VideoProvider> = new Map()

  register(provider: VideoProvider): void {
    this.providers.set(provider.id, provider)
  }

  get(id: string): VideoProvider | undefined {
    return this.providers.get(id)
  }

  getDefault(): VideoProvider {
    const activeProviders = PROVIDER_REGISTRY.filter((p) => p.isActive).sort(
      (a, b) => a.priority - b.priority
    )
    const first = activeProviders[0]
    if (!first) throw new Error('No active video providers configured')
    const provider = this.providers.get(first.id)
    if (!provider) throw new Error(`Provider ${first.id} not found in registry`)
    return provider
  }

  listAll(): VideoProvider[] {
    const order = PROVIDER_REGISTRY.filter((p) => p.isActive)
      .sort((a, b) => a.priority - b.priority)
      .map((p) => p.id)
    return order.map((id) => this.providers.get(id)!).filter(Boolean)
  }
}

// ============================================================
// Provider Service
// ============================================================

export interface ProviderEntry {
  id: string
  name: string
  embedUrl: string
}

export class VideoProviderService {
  private registry: ProviderRegistry

  constructor() {
    this.registry = new ProviderRegistry()
    this.initialize()
  }

  private initialize(): void {
    for (const config of PROVIDER_REGISTRY) {
      if (config.isActive) {
        this.registry.register(new GenericEmbedProvider(config))
      }
    }
  }

  getMovieEmbedUrl(tmdbId: number, options: VideoProviderOptions = {}, providerId?: string): string {
    const provider = providerId
      ? this.registry.get(providerId) ?? this.registry.getDefault()
      : this.registry.getDefault()
    return provider.getMovieEmbedUrl(tmdbId, options)
  }

  getTvEmbedUrl(
    tmdbId: number,
    season: number,
    episode: number,
    options: VideoProviderOptions = {},
    providerId?: string
  ): string {
    const provider = providerId
      ? this.registry.get(providerId) ?? this.registry.getDefault()
      : this.registry.getDefault()
    return provider.getTvEmbedUrl(tmdbId, season, episode, options)
  }

  getAllMovieEmbedUrls(tmdbId: number, options: VideoProviderOptions = {}): ProviderEntry[] {
    return this.registry.listAll().map((p) => ({
      id: p.id,
      name: p.name,
      embedUrl: p.getMovieEmbedUrl(tmdbId, options),
    }))
  }

  getAllTvEmbedUrls(
    tmdbId: number,
    season: number,
    episode: number,
    options: VideoProviderOptions = {}
  ): ProviderEntry[] {
    return this.registry.listAll().map((p) => ({
      id: p.id,
      name: p.name,
      embedUrl: p.getTvEmbedUrl(tmdbId, season, episode, options),
    }))
  }

  listProviders(): Array<{ id: string; name: string }> {
    return this.registry.listAll().map((p) => ({ id: p.id, name: p.name }))
  }
}

let providerServiceInstance: VideoProviderService | null = null

export function getVideoProviderService(): VideoProviderService {
  if (!providerServiceInstance) {
    providerServiceInstance = new VideoProviderService()
  }
  return providerServiceInstance
}
