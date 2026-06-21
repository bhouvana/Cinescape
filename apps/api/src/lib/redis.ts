import Redis from 'ioredis'
import { logger } from './logger'

let redisClient: Redis | null = null

export function getRedis(): Redis {
  if (!redisClient) {
    const url = process.env['REDIS_URL'] ?? 'redis://localhost:6379'
    redisClient = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      lazyConnect: true,
    })

    redisClient.on('connect', () => logger.info('Redis connected'))
    redisClient.on('error', (err) => logger.error('Redis error', { err }))
    redisClient.on('reconnecting', () => logger.warn('Redis reconnecting'))
  }
  return redisClient
}

export async function connectRedis(): Promise<void> {
  const client = getRedis()
  await client.connect()
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
  }
}

// Cache helpers

export async function getCache<T>(key: string): Promise<T | null> {
  const client = getRedis()
  const value = await client.get(key)
  if (!value) return null
  try {
    return JSON.parse(value) as T
  } catch {
    return null
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const client = getRedis()
  await client.setex(key, ttlSeconds, JSON.stringify(value))
}

export async function deleteCache(key: string): Promise<void> {
  const client = getRedis()
  await client.del(key)
}

export async function deleteCachePattern(pattern: string): Promise<void> {
  const client = getRedis()
  const keys = await client.keys(pattern)
  if (keys.length > 0) {
    await client.del(...keys)
  }
}

export async function incrementCounter(key: string, ttlSeconds?: number): Promise<number> {
  const client = getRedis()
  const count = await client.incr(key)
  if (ttlSeconds && count === 1) {
    await client.expire(key, ttlSeconds)
  }
  return count
}
