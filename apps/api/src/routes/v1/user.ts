import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, ApiError } from '../../middleware/error-handler'
import { requireAuth } from '../../middleware/auth'
import { prisma } from '../../lib/prisma'

const router = Router()
router.use(requireAuth)

// GET /user/me
router.get('/me', asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    include: { profile: true, settings: true },
  })
  if (!user) throw ApiError.notFound('User not found')
  res.json({ success: true, data: user, timestamp: new Date().toISOString() })
}))

// PATCH /user/me
router.patch('/me', asyncHandler(async (req, res) => {
  const schema = z.object({
    displayName: z.string().min(1).max(100).optional(),
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/).optional(),
    avatarUrl: z.string().url().nullable().optional(),
  })

  const updates = schema.parse(req.body)

  if (updates.username) {
    const existing = await prisma.user.findUnique({ where: { username: updates.username } })
    if (existing && existing.id !== req.userId) {
      throw ApiError.badRequest('Username already taken')
    }
  }

  const user = await prisma.user.update({
    where: { id: req.userId },
    data: updates,
    include: { profile: true, settings: true },
  })

  res.json({ success: true, data: user, timestamp: new Date().toISOString() })
}))

// PATCH /user/me/profile
router.patch('/me/profile', asyncHandler(async (req, res) => {
  const schema = z.object({
    bio: z.string().max(500).nullable().optional(),
    favoriteGenres: z.array(z.number().int()).max(10).optional(),
    language: z.string().length(2).optional(),
    country: z.string().nullable().optional(),
    timezone: z.string().nullable().optional(),
  })

  const updates = schema.parse(req.body)
  const profile = await prisma.userProfile.update({
    where: { userId: req.userId },
    data: updates,
  })

  res.json({ success: true, data: profile, timestamp: new Date().toISOString() })
}))

// GET /user/me/settings
router.get('/me/settings', asyncHandler(async (req, res) => {
  const settings = await prisma.userSettings.findUnique({ where: { userId: req.userId } })
  if (!settings) throw ApiError.notFound('Settings not found')
  res.json({ success: true, data: settings, timestamp: new Date().toISOString() })
}))

// PATCH /user/me/settings
router.patch('/me/settings', asyncHandler(async (req, res) => {
  const schema = z.object({
    theme: z.enum(['DARK', 'LIGHT', 'SYSTEM']).optional(),
    accentColor: z.string().regex(/^[0-9a-fA-F]{6}$/).optional(),
    language: z.string().optional(),
    autoPlay: z.boolean().optional(),
    autoPlayNext: z.boolean().optional(),
    defaultQuality: z.enum(['AUTO', '1080p', '720p', '480p', '360p']).optional(),
    showSubtitles: z.boolean().optional(),
    subtitleLanguage: z.string().optional(),
    emailNotifications: z.boolean().optional(),
    pushNotifications: z.boolean().optional(),
  })

  const updates = schema.parse(req.body)
  const settings = await prisma.userSettings.update({
    where: { userId: req.userId },
    data: updates,
  })

  res.json({ success: true, data: settings, timestamp: new Date().toISOString() })
}))

// GET /user/me/stats
router.get('/me/stats', asyncHandler(async (req, res) => {
  const userId = req.userId!

  const [
    totalHistoryItems,
    movieCount,
    tvCount,
    completedCount,
    favoriteCount,
    reviewCount,
    ratingCount,
  ] = await Promise.all([
    prisma.watchHistory.count({ where: { userId } }),
    prisma.watchHistory.count({ where: { userId, mediaType: 'movie' } }),
    prisma.watchHistory.count({ where: { userId, mediaType: 'tv' } }),
    prisma.watchHistory.count({ where: { userId, completed: true } }),
    prisma.favorite.count({ where: { userId } }),
    prisma.userReview.count({ where: { userId } }),
    prisma.userRating.count({ where: { userId } }),
  ])

  const totalWatchTimeResult = await prisma.watchHistory.aggregate({
    where: { userId },
    _sum: { currentTime: true },
  })

  const avgRatingResult = await prisma.userRating.aggregate({
    where: { userId },
    _avg: { rating: true },
  })

  const stats = {
    totalWatchTime: Math.round(totalWatchTimeResult._sum.currentTime ?? 0),
    moviesWatched: movieCount,
    showsWatched: tvCount,
    episodesWatched: totalHistoryItems,
    completedTitles: completedCount,
    favorites: favoriteCount,
    reviews: reviewCount,
    ratings: ratingCount,
    averageRating: avgRatingResult._avg.rating ?? null,
  }

  res.json({ success: true, data: stats, timestamp: new Date().toISOString() })
}))

// GET /user/me/favorites
router.get('/me/favorites', asyncHandler(async (req, res) => {
  const page = z.coerce.number().int().positive().default(1).parse(req.query['page'])
  const limit = 20
  const skip = (page - 1) * limit

  const [items, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId: req.userId },
      orderBy: { addedAt: 'desc' },
      take: limit,
      skip,
    }),
    prisma.favorite.count({ where: { userId: req.userId } }),
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

// POST /user/me/favorites
router.post('/me/favorites', asyncHandler(async (req, res) => {
  const schema = z.object({
    tmdbId: z.number().int().positive(),
    mediaType: z.enum(['movie', 'tv']),
  })

  const { tmdbId, mediaType } = schema.parse(req.body)

  const favorite = await prisma.favorite.upsert({
    where: { userId_tmdbId_mediaType: { userId: req.userId!, tmdbId, mediaType } },
    update: {},
    create: { userId: req.userId!, tmdbId, mediaType },
  })

  res.status(201).json({ success: true, data: favorite, timestamp: new Date().toISOString() })
}))

// DELETE /user/me/favorites/:tmdbId
router.delete('/me/favorites/:tmdbId', asyncHandler(async (req, res) => {
  const tmdbId = z.coerce.number().int().positive().parse(req.params['tmdbId'])
  const mediaType = z.enum(['movie', 'tv']).parse(req.query['mediaType'])

  await prisma.favorite.deleteMany({
    where: { userId: req.userId, tmdbId, mediaType },
  })

  res.json({ success: true, data: null, timestamp: new Date().toISOString() })
}))

// POST /user/me/ratings
router.post('/me/ratings', asyncHandler(async (req, res) => {
  const schema = z.object({
    tmdbId: z.number().int().positive(),
    mediaType: z.enum(['movie', 'tv']),
    rating: z.number().min(0.5).max(10).multipleOf(0.5),
  })

  const { tmdbId, mediaType, rating } = schema.parse(req.body)

  const userRating = await prisma.userRating.upsert({
    where: { userId_tmdbId_mediaType: { userId: req.userId!, tmdbId, mediaType } },
    update: { rating },
    create: { userId: req.userId!, tmdbId, mediaType, rating },
  })

  res.json({ success: true, data: userRating, timestamp: new Date().toISOString() })
}))

// GET /user/me/notifications
router.get('/me/notifications', asyncHandler(async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
    take: 30,
  })

  res.json({ success: true, data: notifications, timestamp: new Date().toISOString() })
}))

// PATCH /user/me/notifications/read
router.patch('/me/notifications/read', asyncHandler(async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.userId, isRead: false },
    data: { isRead: true },
  })
  res.json({ success: true, data: null, timestamp: new Date().toISOString() })
}))

export { router as userRouter }
