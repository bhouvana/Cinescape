import 'dotenv/config'
import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import compression from 'compression'
import morgan from 'morgan'
import * as Sentry from '@sentry/node'
import { v1Router } from './routes/v1'
import { globalRateLimit } from './middleware/rate-limit'
import { errorHandler } from './middleware/error-handler'
import { connectDatabase, disconnectDatabase } from './lib/prisma'
import { connectRedis, disconnectRedis } from './lib/redis'
import { logger } from './lib/logger'

async function bootstrap() {
  // Initialize Sentry
  if (process.env['SENTRY_DSN']) {
    Sentry.init({
      dsn: process.env['SENTRY_DSN'],
      environment: process.env['NODE_ENV'] ?? 'development',
      tracesSampleRate: 0.1,
    })
  }

  const app = express()
  const PORT = parseInt(process.env['PORT'] ?? '4000', 10)

  // Trust proxy for rate limiting behind reverse proxy
  app.set('trust proxy', 1)

  // Security middleware
  app.use(helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https://image.tmdb.org'],
        frameSrc: ['https://www.vidking.net'],
      },
    },
  }))

  // CORS
  const corsOrigins = (process.env['CORS_ORIGINS'] ?? 'http://localhost:3000')
    .split(',')
    .map((o) => o.trim())

  app.use(cors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
  }))

  // Body parsing
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true, limit: '10mb' }))

  // Compression
  app.use(compression())

  // Logging
  app.use(morgan('combined', {
    stream: { write: (msg) => logger.info(msg.trim()) },
    skip: (req) => req.url === '/health',
  }))

  // Rate limiting
  app.use(globalRateLimit)

  // Routes
  app.use('/api/v1', v1Router)

  // Root health check
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'watchblitz-api', timestamp: new Date().toISOString() })
  })

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Route not found' },
      timestamp: new Date().toISOString(),
    })
  })

  // Error handler (must be last)
  app.use(errorHandler)

  // Connect to services
  try {
    await connectDatabase()
    await connectRedis()
    logger.info('All services connected')
  } catch (error) {
    logger.error('Failed to connect to services', { error })
    process.exit(1)
  }

  const server = app.listen(PORT, () => {
    logger.info(`🚀 Cinescape API running on http://localhost:${PORT}`)
    logger.info(`   Environment: ${process.env['NODE_ENV'] ?? 'development'}`)
  })

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`)
    server.close(async () => {
      await disconnectDatabase()
      await disconnectRedis()
      logger.info('Server shut down')
      process.exit(0)
    })
    setTimeout(() => {
      logger.error('Forced shutdown after timeout')
      process.exit(1)
    }, 10000)
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'))
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('uncaughtException', (err) => {
    logger.error('Uncaught exception', { err })
    process.exit(1)
  })
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', { reason })
    process.exit(1)
  })
}

bootstrap().catch((err) => {
  console.error('Bootstrap failed:', err)
  process.exit(1)
})
