import { z } from 'zod'

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),

  // TMDB
  TMDB_API_KEY: z.string().min(1, 'TMDB_API_KEY is required'),
  TMDB_READ_ACCESS_TOKEN: z.string().min(1, 'TMDB_READ_ACCESS_TOKEN is required'),
  TMDB_BASE_URL: z.string().default('https://api.themoviedb.org/3'),
  TMDB_IMAGE_BASE_URL: z.string().default('https://image.tmdb.org/t/p'),

  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),

  // Redis
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),

  // Auth
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  CLERK_SECRET_KEY: z.string().min(1, 'CLERK_SECRET_KEY is required'),

  // Analytics
  POSTHOG_KEY: z.string().optional(),
  POSTHOG_HOST: z.string().default('https://app.posthog.com'),

  // Sentry
  SENTRY_DSN: z.string().optional(),

  // CORS
  CORS_ORIGINS: z.string().default('http://localhost:3000'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(15 * 60 * 1000),
  RATE_LIMIT_MAX: z.coerce.number().default(100),

  // Video Provider
  VIDEO_PROVIDER_BASE_URL: z.string().default('https://www.vidking.net'),
  VIDEO_PROVIDER_DEFAULT_COLOR: z.string().default('e50914'),
})

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().default('http://localhost:4000'),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().min(1, 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required'),
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: z.string().default('/sign-in'),
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: z.string().default('/sign-up'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: z.string().default('/'),
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: z.string().default('/'),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().default('https://app.posthog.com'),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
})

export type ServerEnv = z.infer<typeof serverEnvSchema>
export type ClientEnv = z.infer<typeof clientEnvSchema>

export function validateServerEnv(): ServerEnv {
  const result = serverEnvSchema.safeParse(process.env)
  if (!result.success) {
    console.error('❌ Invalid server environment variables:')
    console.error(result.error.flatten().fieldErrors)
    process.exit(1)
  }
  return result.data
}

export function validateClientEnv(): ClientEnv {
  const result = clientEnvSchema.safeParse(process.env)
  if (!result.success) {
    console.error('❌ Invalid client environment variables:')
    console.error(result.error.flatten().fieldErrors)
    process.exit(1)
  }
  return result.data
}
