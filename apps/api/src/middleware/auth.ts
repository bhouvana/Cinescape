import type { Request, Response, NextFunction } from 'express'
import { createClerkClient, verifyToken } from '@clerk/backend'
import { prisma } from '../lib/prisma'
import { logger } from '../lib/logger'

declare global {
  namespace Express {
    interface Request {
      userId?: string
      clerkUserId?: string
    }
  }
}

const clerk = createClerkClient({
  secretKey: process.env['CLERK_SECRET_KEY'] ?? '',
})

export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header' } })
      return
    }

    const token = authHeader.slice(7)
    const payload = await verifyToken(token, { secretKey: process.env['CLERK_SECRET_KEY'] ?? '' })

    if (!payload?.sub) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Invalid token' } })
      return
    }

    req.clerkUserId = payload.sub

    // Sync user to our database
    let user = await prisma.user.findUnique({ where: { clerkId: payload.sub } })
    if (!user) {
      const clerkUser = await clerk.users.getUser(payload.sub)
      const email = clerkUser.emailAddresses[0]?.emailAddress ?? ''
      user = await prisma.user.create({
        data: {
          clerkId: payload.sub,
          email,
          displayName: `${clerkUser.firstName ?? ''} ${clerkUser.lastName ?? ''}`.trim() || null,
          avatarUrl: clerkUser.imageUrl ?? null,
          profile: { create: { language: 'en', favoriteGenres: [] } },
          settings: { create: {} },
        },
      })
    }

    req.userId = user.id
    next()
  } catch (error) {
    logger.error('Auth middleware error', { error })
    res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication failed' } })
  }
}

export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    next()
    return
  }
  return requireAuth(req, res, next)
}

export function requireRole(role: string) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.userId) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } })
      return
    }
    const user = await prisma.user.findUnique({ where: { id: req.userId } })
    if (!user || user.role !== role) {
      res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } })
      return
    }
    next()
  }
}
