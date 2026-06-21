import { describe, it, expect, vi } from 'vitest'
import type { Request, Response, NextFunction } from 'express'
import { ApiError, errorHandler } from './error-handler'

function makeRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response
  return res
}

describe('ApiError', () => {
  it('creates a 400 bad request error', () => {
    const err = ApiError.badRequest('Invalid input')
    expect(err.statusCode).toBe(400)
    expect(err.message).toBe('Invalid input')
  })

  it('creates a 401 unauthorized error', () => {
    const err = ApiError.unauthorized()
    expect(err.statusCode).toBe(401)
  })

  it('creates a 404 not found error', () => {
    const err = ApiError.notFound('Resource not found')
    expect(err.statusCode).toBe(404)
    expect(err.message).toBe('Resource not found')
  })

  it('creates a 429 too many requests error', () => {
    const err = ApiError.tooManyRequests()
    expect(err.statusCode).toBe(429)
  })

  it('creates a 500 internal server error', () => {
    const err = ApiError.internalError()
    expect(err.statusCode).toBe(500)
  })
})

describe('errorHandler middleware', () => {
  const req = {} as Request
  const next = vi.fn() as NextFunction

  it('handles ApiError with correct status code', () => {
    const res = makeRes()
    const err = ApiError.notFound('Movie not found')

    errorHandler(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(404)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({ message: 'Movie not found' }),
      })
    )
  })

  it('handles unknown errors as 500', () => {
    const res = makeRes()
    const err = new Error('Something went wrong')

    errorHandler(err, req, res, next)

    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false })
    )
  })

  it('hides internal error message in production', () => {
    const originalEnv = process.env['NODE_ENV']
    process.env['NODE_ENV'] = 'production'
    const res = makeRes()
    const err = new Error('DB connection string exposed')

    errorHandler(err, req, res, next)

    const body = (res.json as ReturnType<typeof vi.fn>).mock.calls[0]?.[0] as {
      error: { message: string }
    }
    expect(body.error.message).not.toContain('DB connection string exposed')

    process.env['NODE_ENV'] = originalEnv
  })
})
