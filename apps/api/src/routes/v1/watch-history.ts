import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, ApiError } from '../../middleware/error-handler'
import { requireAuth } from '../../middleware/auth'
import { prisma } from '../../lib/prisma'
import { formatProgress } from '@watchblitz/utils'

const router = Router()

router.use(requireAuth)

// POST /watch-history - Save or update watch progress
router.post('/', asyncHandler(async (req, res) => {
  const schema = z.object({
    tmdbId: z.number().int().positive(),
    mediaType: z.enum(['movie', 'tv']),
    season: z.number().int().min(1).optional(),
    episode: z.number().int().min(1).optional(),
    currentTime: z.number().min(0),
    duration: z.number().min(0),
  })

  const { tmdbId, mediaType, season, episode, currentTime, duration } = schema.parse(req.body)
  const userId = req.userId!

  const progress = formatProgress(currentTime, duration)
  const completed = progress >= 90

  // Upsert continue watching
  const continueWatching = await prisma.continueWatching.upsert({
    where: {
      userId_tmdbId_mediaType: { userId, tmdbId, mediaType },
    },
    update: {
      season,
      episode,
      currentTime,
      duration,
      progress,
    },
    create: {
      userId,
      tmdbId,
      mediaType,
      season,
      episode,
      currentTime,
      duration,
      progress,
    },
  })

  // Also record in history
  await prisma.watchHistory.create({
    data: {
      userId,
      tmdbId,
      mediaType,
      season,
      episode,
      currentTime,
      duration,
      progress,
      completed,
      lastWatchedAt: new Date(),
    },
  })

  // Remove from continue watching if completed
  if (completed) {
    await prisma.continueWatching.delete({
      where: {
        userId_tmdbId_mediaType: { userId, tmdbId, mediaType },
      },
    }).catch(() => null)
  }

  res.json({ success: true, data: continueWatching, timestamp: new Date().toISOString() })
}))

// GET /watch-history - Get full watch history
router.get('/', asyncHandler(async (req, res) => {
  const page = z.coerce.number().int().positive().default(1).parse(req.query['page'])
  const limit = 20
  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    prisma.watchHistory.findMany({
      where: { userId: req.userId },
      orderBy: { lastWatchedAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.watchHistory.count({ where: { userId: req.userId } }),
  ])

  res.json({
    success: true,
    data: {
      items,
      page,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      hasNextPage: skip + limit < total,
      hasPrevPage: page > 1,
    },
    timestamp: new Date().toISOString(),
  })
}))

// GET /watch-history/continue-watching
router.get('/continue-watching', asyncHandler(async (req, res) => {
  const items = await prisma.continueWatching.findMany({
    where: { userId: req.userId, progress: { lt: 90 } },
    orderBy: { updatedAt: 'desc' },
    take: 20,
  })
  res.json({ success: true, data: items, timestamp: new Date().toISOString() })
}))

// GET /watch-history/:tmdbId?mediaType=movie
router.get('/:tmdbId', asyncHandler(async (req, res) => {
  const tmdbId = z.coerce.number().int().positive().parse(req.params['tmdbId'])
  const mediaType = z.enum(['movie', 'tv']).parse(req.query['mediaType'])

  const item = await prisma.continueWatching.findUnique({
    where: {
      userId_tmdbId_mediaType: { userId: req.userId!, tmdbId, mediaType },
    },
  })

  res.json({ success: true, data: item, timestamp: new Date().toISOString() })
}))

// DELETE /watch-history/:tmdbId
router.delete('/:tmdbId', asyncHandler(async (req, res) => {
  const tmdbId = z.coerce.number().int().positive().parse(req.params['tmdbId'])
  const mediaType = z.enum(['movie', 'tv']).parse(req.query['mediaType'])

  await prisma.continueWatching.delete({
    where: {
      userId_tmdbId_mediaType: { userId: req.userId!, tmdbId, mediaType },
    },
  }).catch(() => null)

  await prisma.watchHistory.deleteMany({
    where: { userId: req.userId, tmdbId, mediaType },
  })

  res.json({ success: true, data: null, timestamp: new Date().toISOString() })
}))

export { router as watchHistoryRouter }
