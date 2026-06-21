import rateLimit from 'express-rate-limit'
import type { Request, Response } from 'express'

const isDev = process.env['NODE_ENV'] === 'development'

// In development, skip all rate limiting so the frontend never gets blocked.
// In production, use environment-configurable limits.
export const globalRateLimit = rateLimit({
  windowMs: parseInt(process.env['RATE_LIMIT_WINDOW_MS'] ?? '900000', 10),
  max: parseInt(process.env['RATE_LIMIT_MAX'] ?? '2000', 10),
  standardHeaders: true,
  legacyHeaders: false,
  skip: () => isDev,
  keyGenerator: (req: Request) => req.ip ?? 'unknown',
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests. Please slow down.',
      },
      timestamp: new Date().toISOString(),
    })
  },
})

export const authRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: isDev ? 1000 : 20,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many auth attempts' },
    timestamp: new Date().toISOString(),
  },
})

export const searchRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 1000 : 120,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: { code: 'TOO_MANY_REQUESTS', message: 'Too many search requests' },
    timestamp: new Date().toISOString(),
  },
})

export const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: isDev ? 100 : 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: { code: 'TOO_MANY_REQUESTS', message: 'Too many AI requests. Please wait a moment.' },
      timestamp: new Date().toISOString(),
    })
  },
})
