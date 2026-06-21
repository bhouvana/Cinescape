import winston from 'winston'

const { combine, timestamp, errors, json, colorize, simple } = winston.format

const isDevelopment = process.env['NODE_ENV'] === 'development'

export const logger = winston.createLogger({
  level: process.env['LOG_LEVEL'] ?? (isDevelopment ? 'debug' : 'info'),
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    json()
  ),
  defaultMeta: { service: 'watchblitz-api' },
  transports: [
    new winston.transports.Console({
      format: isDevelopment ? combine(colorize(), simple()) : json(),
    }),
  ],
})

// Request logger middleware helper
export function logRequest(method: string, url: string, statusCode: number, ms: number) {
  const level = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info'
  logger.log(level, `${method} ${url} ${statusCode} - ${ms}ms`)
}
