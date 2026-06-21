import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../../middleware/error-handler'
import { getVideoProviderService } from '../../services/video/video-provider'

const router = Router()
const providerService = getVideoProviderService()

// GET /provider/movie/:tmdbId
router.get('/movie/:tmdbId', asyncHandler(async (req, res) => {
  const schema = z.object({
    tmdbId: z.coerce.number().int().positive(),
    color: z.string().regex(/^[0-9a-fA-F]{6}$/).optional(),
    autoPlay: z.coerce.boolean().optional(),
    progress: z.coerce.number().min(0).optional(),
    providerId: z.string().optional(),
  })

  const { tmdbId, color, autoPlay, progress, providerId } = schema.parse({
    ...req.params,
    ...req.query,
  })

  const opts = { color, autoPlay, progress }
  const embedUrl = providerService.getMovieEmbedUrl(tmdbId, opts, providerId)
  const providers = providerService.getAllMovieEmbedUrls(tmdbId, opts)

  res.json({
    success: true,
    data: { embedUrl, providers, tmdbId, mediaType: 'movie' },
    timestamp: new Date().toISOString(),
  })
}))

// GET /provider/tv/:tmdbId/:season/:episode
router.get('/tv/:tmdbId/:season/:episode', asyncHandler(async (req, res) => {
  const schema = z.object({
    tmdbId: z.coerce.number().int().positive(),
    season: z.coerce.number().int().min(1),
    episode: z.coerce.number().int().min(1),
    color: z.string().regex(/^[0-9a-fA-F]{6}$/).optional(),
    autoPlay: z.coerce.boolean().optional(),
    nextEpisode: z.coerce.boolean().optional(),
    episodeSelector: z.coerce.boolean().optional(),
    progress: z.coerce.number().min(0).optional(),
    providerId: z.string().optional(),
  })

  const { tmdbId, season, episode, color, autoPlay, nextEpisode, episodeSelector, progress, providerId } =
    schema.parse({ ...req.params, ...req.query })

  const opts = { color, autoPlay, nextEpisode, episodeSelector, progress }
  const embedUrl = providerService.getTvEmbedUrl(tmdbId, season, episode, opts, providerId)
  const providers = providerService.getAllTvEmbedUrls(tmdbId, season, episode, opts)

  res.json({
    success: true,
    data: { embedUrl, providers, tmdbId, mediaType: 'tv', season, episode },
    timestamp: new Date().toISOString(),
  })
}))

// GET /provider/list
router.get('/list', asyncHandler(async (_req, res) => {
  const providers = providerService.listProviders()
  res.json({ success: true, data: providers, timestamp: new Date().toISOString() })
}))

export { router as providerRouter }
