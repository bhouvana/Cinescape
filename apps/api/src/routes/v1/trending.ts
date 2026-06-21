import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler } from '../../middleware/error-handler'
import * as tmdb from '../../services/tmdb/tmdb-service'

const router = Router()

const timeWindowSchema = z.enum(['day', 'week']).default('week')
const pageSchema = z.coerce.number().int().positive().default(1)

// GET /trending/all?timeWindow=week&page=1
router.get('/all', asyncHandler(async (req, res) => {
  const timeWindow = timeWindowSchema.parse(req.query['timeWindow'])
  const page = pageSchema.parse(req.query['page'])
  const data = await tmdb.getTrendingAll(timeWindow, page)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /trending/movies
router.get('/movies', asyncHandler(async (req, res) => {
  const timeWindow = timeWindowSchema.parse(req.query['timeWindow'])
  const page = pageSchema.parse(req.query['page'])
  const data = await tmdb.getTrendingMovies(timeWindow, page)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /trending/tv
router.get('/tv', asyncHandler(async (req, res) => {
  const timeWindow = timeWindowSchema.parse(req.query['timeWindow'])
  const page = pageSchema.parse(req.query['page'])
  const data = await tmdb.getTrendingTV(timeWindow, page)
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

export { router as trendingRouter }
