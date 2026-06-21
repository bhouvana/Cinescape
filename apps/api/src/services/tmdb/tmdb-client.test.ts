import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { TMDBClient } from './tmdb-client'

describe('TMDBClient', () => {
  const client = new TMDBClient('test-read-access-token')

  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  describe('request', () => {
    it('adds Authorization header with Bearer token', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ page: 1, results: [], total_pages: 1, total_results: 0 }),
      })
      vi.stubGlobal('fetch', mockFetch)

      await client.request('/trending/movie/week')

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/trending/movie/week'),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-read-access-token',
          }),
        })
      )
    })

    it('retries on 429 with exponential backoff', async () => {
      const tooManyRequests = {
        ok: false,
        status: 429,
        json: () => Promise.resolve({ status_message: 'Too many requests' }),
      }
      const success = {
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      }
      const mockFetch = vi
        .fn()
        .mockResolvedValueOnce(tooManyRequests)
        .mockResolvedValueOnce(success)
      vi.stubGlobal('fetch', mockFetch)

      const promise = client.request('/trending/movie/week')
      // Advance timers past backoff delay
      await vi.runAllTimersAsync()
      const result = await promise

      expect(mockFetch).toHaveBeenCalledTimes(2)
      expect(result).toEqual({ results: [] })
    })

    it('throws after 3 failed attempts', async () => {
      const tooManyRequests = {
        ok: false,
        status: 429,
        json: () => Promise.resolve({ status_message: 'Too many requests' }),
      }
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(tooManyRequests))

      const promise = client.request('/trending/movie/week')
      await vi.runAllTimersAsync()

      await expect(promise).rejects.toThrow()
    })

    it('appends query params correctly', async () => {
      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ results: [] }),
      })
      vi.stubGlobal('fetch', mockFetch)

      await client.request('/movie/popular', { page: 2, language: 'en-US' })

      const calledUrl = mockFetch.mock.calls[0]?.[0] as string
      expect(calledUrl).toContain('page=2')
      expect(calledUrl).toContain('language=en-US')
    })
  })
})
