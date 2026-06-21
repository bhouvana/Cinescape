import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, ApiError } from '../../middleware/error-handler'
import { searchRateLimit } from '../../middleware/rate-limit'
import { optionalAuth } from '../../middleware/auth'
import * as tmdb from '../../services/tmdb/tmdb-service'
import { prisma } from '../../lib/prisma'

const router = Router()

// GET /search?q=query&page=1&type=multi|movie|tv
router.get('/', searchRateLimit, optionalAuth, asyncHandler(async (req, res) => {
  const schema = z.object({
    q: z.string().min(1, 'Query is required').max(200),
    page: z.coerce.number().int().positive().default(1),
    type: z.enum(['multi', 'movie', 'tv']).default('multi'),
  })

  const { q, page, type } = schema.parse(req.query)

  let data
  switch (type) {
    case 'movie':
      data = await tmdb.searchMovies(q, page)
      break
    case 'tv':
      data = await tmdb.searchTV(q, page)
      break
    default:
      data = await tmdb.searchMulti(q, page)
  }

  // Save search history for authenticated users
  if (req.userId) {
    prisma.searchHistory.create({
      data: {
        userId: req.userId,
        query: q,
        resultCount: data.total_results,
      },
    }).catch(() => null)
  }

  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// GET /search/history - Get user's search history
router.get('/history', optionalAuth, asyncHandler(async (req, res) => {
  if (!req.userId) {
    res.json({ success: true, data: [], timestamp: new Date().toISOString() })
    return
  }

  const history = await prisma.searchHistory.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
    take: 10,
    distinct: ['query'],
  })

  res.json({ success: true, data: history, timestamp: new Date().toISOString() })
}))

// DELETE /search/history - Clear search history
router.delete('/history', optionalAuth, asyncHandler(async (req, res) => {
  if (!req.userId) throw ApiError.unauthorized()
  await prisma.searchHistory.deleteMany({ where: { userId: req.userId } })
  res.json({ success: true, data: null, timestamp: new Date().toISOString() })
}))

// GET /search/trending - Trending search terms
router.get('/trending', asyncHandler(async (_req, res) => {
  const trending = await prisma.searchHistory.groupBy({
    by: ['query'],
    _count: { query: true },
    orderBy: { _count: { query: 'desc' } },
    take: 10,
    where: {
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
  })

  const data = trending.map((t) => ({ query: t.query, count: t._count.query }))
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

export { router as searchRouter }
