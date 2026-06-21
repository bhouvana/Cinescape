import { Router } from 'express'
import { moviesRouter } from './movies'
import { tvRouter } from './tv'
import { searchRouter } from './search'
import { trendingRouter } from './trending'
import { watchHistoryRouter } from './watch-history'
import { watchlistRouter } from './watchlist'
import { userRouter } from './user'
import { providerRouter } from './provider'
import { aiRouter } from './ai'

const router = Router()

router.use('/movies', moviesRouter)
router.use('/tv', tvRouter)
router.use('/search', searchRouter)
router.use('/trending', trendingRouter)
router.use('/watch-history', watchHistoryRouter)
router.use('/watchlists', watchlistRouter)
router.use('/user', userRouter)
router.use('/provider', providerRouter)
router.use('/ai', aiRouter)

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
      version: '1.0.0',
      service: 'cinescape-api',
    },
    timestamp: new Date().toISOString(),
  })
})

export { router as v1Router }
