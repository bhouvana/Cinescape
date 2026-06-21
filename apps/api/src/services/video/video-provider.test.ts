import { describe, it, expect } from 'vitest'
import { VideoProviderService } from './video-provider'

describe('VideoProviderService', () => {
  const service = VideoProviderService.getInstance()

  describe('getMovieEmbedUrl', () => {
    it('returns a valid Vidking movie URL', () => {
      const url = service.getMovieEmbedUrl(550)
      expect(url).toContain('550')
      expect(url).toMatch(/^https?:\/\//)
    })

    it('includes default color parameter', () => {
      const url = service.getMovieEmbedUrl(550)
      expect(url).toContain('color=e50914')
    })

    it('applies custom accent color', () => {
      const url = service.getMovieEmbedUrl(550, { color: '0284c7' })
      expect(url).toContain('color=0284c7')
    })

    it('includes autoPlay param when enabled', () => {
      const url = service.getMovieEmbedUrl(550, { autoPlay: true })
      expect(url).toContain('autoPlay=true')
    })

    it('includes progress param when provided', () => {
      const url = service.getMovieEmbedUrl(550, { progress: 42 })
      expect(url).toContain('progress=42')
    })

    it('omits progress param when 0', () => {
      const url = service.getMovieEmbedUrl(550, { progress: 0 })
      expect(url).not.toContain('progress=0')
    })
  })

  describe('getTvEmbedUrl', () => {
    it('returns a valid Vidking TV URL with season and episode', () => {
      const url = service.getTvEmbedUrl(1399, 1, 1)
      expect(url).toContain('1399')
      expect(url).toContain('1')
      expect(url).toMatch(/^https?:\/\//)
    })

    it('includes episodeSelector by default', () => {
      const url = service.getTvEmbedUrl(1399, 1, 1)
      expect(url).toContain('episodeSelector=true')
    })

    it('includes nextEpisode by default', () => {
      const url = service.getTvEmbedUrl(1399, 1, 1)
      expect(url).toContain('nextEpisode=true')
    })

    it('can disable episodeSelector', () => {
      const url = service.getTvEmbedUrl(1399, 1, 1, { episodeSelector: false })
      expect(url).not.toContain('episodeSelector=true')
    })
  })
})
