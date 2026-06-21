import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, ApiError } from '../../middleware/error-handler'
import * as tmdb from '../../services/tmdb/tmdb-service'

const router = Router()
const pageSchema = z.coerce.number().int().positive().default(1)
const idSchema = z.coerce.number().int().positive()

// GET /tv/trending
router.get('/trending', asyncHandler(async (req, res) => {
  const timeWindow = z.enum(['day', 'week']).default('week').parse(req.query['timeWindow'])
  const page = pageSchema.parse(req.query['page'])
  const data = await tmdb.getTrendingTV(timeWindow, page)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /tv/popular
router.get('/popular', asyncHandler(async (req, res) => {
  const page = pageSchema.parse(req.query['page'])
  const data = await tmdb.getPopularTV(page)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /tv/top-rated
router.get('/top-rated', asyncHandler(async (req, res) => {
  const page = pageSchema.parse(req.query['page'])
  const data = await tmdb.getTopRatedTV(page)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /tv/airing-today
router.get('/airing-today', asyncHandler(async (req, res) => {
  const page = pageSchema.parse(req.query['page'])
  const data = await tmdb.getAiringTodayTV(page)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /tv/on-the-air
router.get('/on-the-air', asyncHandler(async (req, res) => {
  const page = pageSchema.parse(req.query['page'])
  const data = await tmdb.getOnTheAirTV(page)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /tv/genres
router.get('/genres', asyncHandler(async (_req, res) => {
  const data = await tmdb.getTVGenres()
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /tv/discover
router.get('/discover', asyncHandler(async (req, res) => {
  const schema = z.object({
    page: z.coerce.number().default(1),
    sort_by: z.string().optional(),
    with_genres: z.string().optional(),
    first_air_date_year: z.coerce.number().optional(),
    'vote_average.gte': z.coerce.number().optional(),
    with_original_language: z.string().optional(),
    with_status: z.string().optional(),
  })
  const params = schema.parse(req.query)
  const data = await tmdb.discoverTV(params)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /tv/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const id = idSchema.parse(req.params['id'])
  const data = await tmdb.getTVDetails(id)
  if (!data) throw ApiError.notFound(`TV show ${id} not found`)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /tv/:id/season/:season
router.get('/:id/season/:season', asyncHandler(async (req, res) => {
  const id = idSchema.parse(req.params['id'])
  const season = z.coerce.number().int().min(0).parse(req.params['season'])
  const data = await tmdb.getTVSeasonDetails(id, season)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /tv/:id/recommendations
router.get('/:id/recommendations', asyncHandler(async (req, res) => {
  const id = idSchema.parse(req.params['id'])
  const page = pageSchema.parse(req.query['page'])
  const data = await tmdb.getTVRecommendations(id, page)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /tv/:id/similar
router.get('/:id/similar', asyncHandler(async (req, res) => {
  const id = idSchema.parse(req.params['id'])
  const page = pageSchema.parse(req.query['page'])
  const data = await tmdb.getSimilarTV(id, page)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /tv/:id/videos
router.get('/:id/videos', asyncHandler(async (req, res) => {
  const id = idSchema.parse(req.params['id'])
  const data = await tmdb.getTVVideos(id)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /tv/:id/reviews
router.get('/:id/reviews', asyncHandler(async (req, res) => {
  const id = idSchema.parse(req.params['id'])
  const data = await tmdb.getTVReviews(id)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

export { router as tvRouter }
