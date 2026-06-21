import { Router } from 'express'
import { z } from 'zod'
import { asyncHandler, ApiError } from '../../middleware/error-handler'
import { requireAuth } from '../../middleware/auth'
import { prisma } from '../../lib/prisma'

const router = Router()
router.use(requireAuth)

// GET /watchlists
router.get('/', asyncHandler(async (req, res) => {
  const lists = await prisma.watchlist.findMany({
    where: { userId: req.userId },
    orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
    include: { _count: { select: { items: true } } },
  })

  const data = lists.map((l) => ({ ...l, itemCount: l._count.items }))
  res.json({ success: true, data, timestamp: new Date().toISOString() })
}))

// POST /watchlists
router.post('/', asyncHandler(async (req, res) => {
  const schema = z.object({
    name: z.string().min(1).max(100),
    description: z.string().max(500).optional(),
    isPublic: z.boolean().default(false),
  })

  const { name, description, isPublic } = schema.parse(req.body)

  const list = await prisma.watchlist.create({
    data: { userId: req.userId!, name, description, isPublic },
  })

  res.status(201).json({ success: true, data: list, timestamp: new Date().toISOString() })
}))

// GET /watchlists/check/:tmdbId?mediaType=movie  (must be before /:id)
router.get('/check/:tmdbId', asyncHandler(async (req, res) => {
  const tmdbId = z.coerce.number().int().positive().parse(req.params['tmdbId'])
  const mediaType = z.enum(['movie', 'tv']).parse(req.query['mediaType'])

  const items = await prisma.watchlistItem.findMany({
    where: {
      tmdbId,
      mediaType,
      watchlist: { userId: req.userId },
    },
    include: { watchlist: { select: { id: true, name: true } } },
  })

  res.json({ success: true, data: { inWatchlists: items }, timestamp: new Date().toISOString() })
}))

// GET /watchlists/:id
router.get('/:id', asyncHandler(async (req, res) => {
  const list = await prisma.watchlist.findFirst({
    where: { id: req.params['id'], userId: req.userId },
    include: { items: { orderBy: { sortOrder: 'asc' } } },
  })

  if (!list) throw ApiError.notFound('Watchlist not found')
  res.json({ success: true, data: list, timestamp: new Date().toISOString() })
}))

// PATCH /watchlists/:id
router.patch('/:id', asyncHandler(async (req, res) => {
  const schema = z.object({
    name: z.string().min(1).max(100).optional(),
    description: z.string().max(500).nullable().optional(),
    isPublic: z.boolean().optional(),
    isPinned: z.boolean().optional(),
  })

  const updates = schema.parse(req.body)
  const list = await prisma.watchlist.updateMany({
    where: { id: req.params['id'], userId: req.userId },
    data: updates,
  })

  if (list.count === 0) throw ApiError.notFound('Watchlist not found')
  res.json({ success: true, data: { id: req.params['id'], ...updates }, timestamp: new Date().toISOString() })
}))

// DELETE /watchlists/:id
router.delete('/:id', asyncHandler(async (req, res) => {
  const result = await prisma.watchlist.deleteMany({
    where: { id: req.params['id'], userId: req.userId },
  })
  if (result.count === 0) throw ApiError.notFound('Watchlist not found')
  res.json({ success: true, data: null, timestamp: new Date().toISOString() })
}))

// GET /watchlists/:id/items
router.get('/:id/items', asyncHandler(async (req, res) => {
  const page = z.coerce.number().int().positive().default(1).parse(req.query['page'])
  const limit = 40
  const skip = (page - 1) * limit

  const list = await prisma.watchlist.findFirst({
    where: { id: req.params['id'], userId: req.userId },
  })
  if (!list) throw ApiError.notFound('Watchlist not found')

  const [items, total] = await Promise.all([
    prisma.watchlistItem.findMany({
      where: { watchlistId: req.params['id'] },
      orderBy: { sortOrder: 'asc' },
      take: limit,
      skip,
    }),
    prisma.watchlistItem.count({ where: { watchlistId: req.params['id'] } }),
  ])

  res.json({
    success: true,
    data: items,
    pagination: { page, totalPages: Math.ceil(total / limit), totalResults: total },
    timestamp: new Date().toISOString(),
  })
}))

// POST /watchlists/:id/items
router.post('/:id/items', asyncHandler(async (req, res) => {
  const schema = z.object({
    tmdbId: z.number().int().positive(),
    mediaType: z.enum(['movie', 'tv']),
    notes: z.string().max(500).optional(),
  })

  const { tmdbId, mediaType, notes } = schema.parse(req.body)

  const list = await prisma.watchlist.findFirst({
    where: { id: req.params['id'], userId: req.userId },
  })
  if (!list) throw ApiError.notFound('Watchlist not found')

  const item = await prisma.watchlistItem.upsert({
    where: {
      watchlistId_tmdbId_mediaType: {
        watchlistId: req.params['id']!,
        tmdbId,
        mediaType,
      },
    },
    update: { notes },
    create: { watchlistId: req.params['id']!, tmdbId, mediaType, notes },
  })

  res.status(201).json({ success: true, data: item, timestamp: new Date().toISOString() })
}))

// DELETE /watchlists/:id/items/:itemId
router.delete('/:id/items/:itemId', asyncHandler(async (req, res) => {
  const list = await prisma.watchlist.findFirst({
    where: { id: req.params['id'], userId: req.userId },
  })
  if (!list) throw ApiError.notFound('Watchlist not found')

  await prisma.watchlistItem.delete({
    where: { id: req.params['itemId'] },
  })

  res.json({ success: true, data: null, timestamp: new Date().toISOString() })
}))

export { router as watchlistRouter }
