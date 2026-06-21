import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, ApiError } from '../../middleware/error-handler'
import * as tmdb from '../../services/tmdb/tmdb-service'

const router = Router()

const pageSchema = z.coerce.number().int().positive().default(1)
const idSchema = z.coerce.number().int().positive()

// GET /movies/trending?timeWindow=week&page=1
router.get('/trending', asyncHandler(async (req, res) => {
  const timeWindow = z.enum(['day', 'week']).default('week').parse(req.query['timeWindow'])
  const page = pageSchema.parse(req.query['page'])
  const data = await tmdb.getTrendingMovies(timeWindow, page)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /movies/popular
router.get('/popular', asyncHandler(async (req, res) => {
  const page = pageSchema.parse(req.query['page'])
  const data = await tmdb.getPopularMovies(page)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /movies/top-rated
router.get('/top-rated', asyncHandler(async (req, res) => {
  const page = pageSchema.parse(req.query['page'])
  const data = await tmdb.getTopRatedMovies(page)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /movies/now-playing
router.get('/now-playing', asyncHandler(async (req, res) => {
  const page = pageSchema.parse(req.query['page'])
  const data = await tmdb.getNowPlayingMovies(page)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /movies/upcoming
router.get('/upcoming', asyncHandler(async (req, res) => {
  const page = pageSchema.parse(req.query['page'])
  const data = await tmdb.getUpcomingMovies(page)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /movies/genres
router.get('/genres', asyncHandler(async (_req, res) => {
  const data = await tmdb.getMovieGenres()
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /movies/discover
router.get('/discover', asyncHandler(async (req, res) => {
  const schema = z.object({
    page: z.coerce.number().default(1),
    sort_by: z.string().optional(),
    with_genres: z.string().optional(),
    primary_release_year: z.coerce.number().optional(),
    'vote_average.gte': z.coerce.number().optional(),
    'vote_average.lte': z.coerce.number().optional(),
    with_original_language: z.string().optional(),
  })
  const params = schema.parse(req.query)
  const data = await tmdb.discoverMovies(params)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /movies/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const id = idSchema.parse(req.params['id'])
  const data = await tmdb.getMovieDetails(id)
  if (!data) throw ApiError.notFound(`Movie ${id} not found`)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /movies/:id/recommendations
router.get('/:id/recommendations', asyncHandler(async (req, res) => {
  const id = idSchema.parse(req.params['id'])
  const page = pageSchema.parse(req.query['page'])
  const data = await tmdb.getMovieRecommendations(id, page)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /movies/:id/similar
router.get('/:id/similar', asyncHandler(async (req, res) => {
  const id = idSchema.parse(req.params['id'])
  const page = pageSchema.parse(req.query['page'])
  const data = await tmdb.getSimilarMovies(id, page)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /movies/:id/videos
router.get('/:id/videos', asyncHandler(async (req, res) => {
  const id = idSchema.parse(req.params['id'])
  const data = await tmdb.getMovieVideos(id)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /movies/:id/reviews
router.get('/:id/reviews', asyncHandler(async (req, res) => {
  const id = idSchema.parse(req.params['id'])
  const data = await tmdb.getMovieReviews(id)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

export { router as moviesRouter }
