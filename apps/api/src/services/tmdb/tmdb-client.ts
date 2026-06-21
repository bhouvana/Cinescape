import { TMDB_CONFIG } from '@watchblitz/config'
import { logger } from '../../lib/logger'

interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

interface TMDBClientOptions {
  apiKey?: string
  readAccessToken: string
  baseUrl?: string
}

export class TMDBClient {
  private readonly baseUrl: string
  private readonly headers: Record<string, string>
  private requestQueue: Promise<unknown> = Promise.resolve()
  private requestCount = 0
  private windowStart = Date.now()

  constructor(options: TMDBClientOptions) {
    this.baseUrl = options.baseUrl ?? TMDB_CONFIG.BASE_URL
    this.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `Bearer ${options.readAccessToken}`,
    }
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now()
    if (now - this.windowStart > 1000) {
      this.windowStart = now
      this.requestCount = 0
    }
    if (this.requestCount >= TMDB_CONFIG.RATE_LIMIT.MAX_REQUESTS_PER_SECOND) {
      const waitMs = 1000 - (now - this.windowStart)
      if (waitMs > 0) await new Promise((r) => setTimeout(r, waitMs))
      this.windowStart = Date.now()
      this.requestCount = 0
    }
    this.requestCount++
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.baseUrl}${path}`)
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) {
          url.searchParams.set(key, String(value))
        }
      }
    }
    return url.toString()
  }

  async fetch<T>(path: string, options: FetchOptions = {}): Promise<T> {
    const { params, ...fetchOptions } = options
    const url = this.buildUrl(path, params)

    let lastError: Error | null = null

    for (let attempt = 0; attempt < TMDB_CONFIG.RATE_LIMIT.RETRY_ATTEMPTS; attempt++) {
      try {
        await this.enforceRateLimit()

        const response = await globalThis.fetch(url, {
          ...fetchOptions,
          headers: { ...this.headers, ...fetchOptions.headers },
        })

        if (response.status === 429) {
          const retryAfter = parseInt(response.headers.get('Retry-After') ?? '1', 10)
          logger.warn(`TMDB rate limited, retrying after ${retryAfter}s`, { url })
          await new Promise((r) => setTimeout(r, retryAfter * 1000))
          continue
        }

        if (!response.ok) {
          const body = await response.text()
          throw new Error(`TMDB API error: ${response.status} ${response.statusText} - ${body}`)
        }

        return response.json() as Promise<T>
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error))
        if (attempt < TMDB_CONFIG.RATE_LIMIT.RETRY_ATTEMPTS - 1) {
          const delay = TMDB_CONFIG.RATE_LIMIT.RETRY_DELAY_MS * Math.pow(2, attempt)
          logger.warn(`TMDB request failed, retrying in ${delay}ms`, { url, attempt, error })
          await new Promise((r) => setTimeout(r, delay))
        }
      }
    }

    logger.error(`TMDB request failed after ${TMDB_CONFIG.RATE_LIMIT.RETRY_ATTEMPTS} attempts`, {
      url,
      error: lastError,
    })
    throw lastError ?? new Error('TMDB request failed')
  }
}

let tmdbClientInstance: TMDBClient | null = null

export function getTMDBClient(): TMDBClient {
  if (!tmdbClientInstance) {
    const token = process.env['TMDB_READ_ACCESS_TOKEN']
    if (!token) throw new Error('TMDB_READ_ACCESS_TOKEN is not set')
    tmdbClientInstance = new TMDBClient({ readAccessToken: token })
  }
  return tmdbClientInstance
}
