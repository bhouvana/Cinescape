import { Router } from 'express'
import { z } from 'zod'
import { parseSearchQuery } from '../../services/ai/groq-service'
import { discoverMovies, discoverTV } from '../../services/tmdb/tmdb-service'
import { aiRateLimit } from '../../middleware/rate-limit'

export const aiRouter = Router()

const searchSchema = z.object({ query: z.string().min(2).max(500) })

aiRouter.post('/search', aiRateLimit, async (req, res) => {
  try {
    const { query } = searchSchema.parse(req.body)

    const params = await parseSearchQuery(query)

    const [movieResults, tvResults] = await Promise.all([
      params.mediaType !== 'tv'
        ? discoverMovies({
            with_genres: params.movieGenres.join(','),
            sort_by: params.sortBy as 'popularity.desc',
            'vote_average.gte': params.minVoteAverage,
            'vote_count.gte': params.minVoteCount,
          })
        : null,
      params.mediaType !== 'movie'
        ? discoverTV({
            with_genres: params.tvGenres.join(','),
            sort_by: params.sortBy as 'popularity.desc',
            'vote_average.gte': params.minVoteAverage,
            'vote_count.gte': params.minVoteCount,
          })
        : null,
    ])

    const movies = (movieResults?.results ?? []).map((m) => ({ ...m, media_type: 'movie' as const }))
    const shows = (tvResults?.results ?? []).map((t) => ({ ...t, media_type: 'tv' as const }))

    // Interleave movies and TV if both
    let results
    if (params.mediaType === 'both') {
      results = []
      const maxLen = Math.max(movies.length, shows.length)
      for (let i = 0; i < maxLen; i++) {
        if (movies[i]) results.push(movies[i])
        if (shows[i]) results.push(shows[i])
      }
    } else {
      results = params.mediaType === 'movie' ? movies : shows
    }

    res.json({
      success: true,
      data: {
        results: results.slice(0, 20),
        explanation: params.explanation,
        mediaType: params.mediaType,
        params,
      },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI search failed'
    res.status(500).json({ success: false, error: { message } })
  }
})
