import { logger } from '../../lib/logger'

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

export interface AISearchParams {
  mediaType: 'movie' | 'tv' | 'both'
  movieGenres: number[]
  tvGenres: number[]
  sortBy: string
  minVoteAverage: number
  minVoteCount: number
  explanation: string
}

const SYSTEM_PROMPT = `You are a movie and TV show recommendation engine for Cinescape, a streaming discovery platform.
Analyze natural language queries and return ONLY valid JSON matching this shape:

{
  "mediaType": "movie" | "tv" | "both",
  "movieGenres": number[],
  "tvGenres": number[],
  "sortBy": "popularity.desc" | "vote_average.desc" | "vote_count.desc" | "primary_release_date.desc",
  "minVoteAverage": number,
  "minVoteCount": number,
  "explanation": string
}

TMDB Movie Genre IDs: Action=28, Adventure=12, Animation=16, Comedy=35, Crime=80, Documentary=99, Drama=18, Family=10751, Fantasy=14, History=36, Horror=27, Music=10402, Mystery=9648, Romance=10749, SciFi=878, Thriller=53, War=10752, Western=37
TMDB TV Genre IDs: Action&Adventure=10759, Animation=16, Comedy=35, Crime=80, Documentary=99, Drama=18, Family=10751, Kids=10762, Mystery=9648, Reality=10764, SciFi&Fantasy=10765, War&Politics=10768, Western=37

Rules:
- explanation: friendly 1-2 sentences describing what you're showing the user
- minVoteCount: 100 for niche, 500 for mainstream, 1000 for blockbusters
- minVoteAverage: 0 for any quality, 6 for decent, 7 for good, 8 for great
- sortBy: use "vote_count.desc" for classics/well-known, "popularity.desc" for trending, "vote_average.desc" for critically acclaimed
- Return ONLY the JSON object, no markdown, no explanation outside the JSON`

export async function parseSearchQuery(query: string): Promise<AISearchParams> {
  const apiKey = process.env['GROQ_API_KEY']
  if (!apiKey) throw new Error('GROQ_API_KEY not configured')

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: query },
      ],
      temperature: 0.3,
      max_tokens: 512,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    logger.error('Groq API error', { status: response.status, err })
    throw new Error(`Groq API error: ${response.status}`)
  }

  const data = await response.json() as {
    choices: Array<{ message: { content: string } }>
  }

  const content = data.choices[0]?.message?.content?.trim() ?? ''

  try {
    const parsed = JSON.parse(content) as AISearchParams
    return {
      mediaType: parsed.mediaType ?? 'both',
      movieGenres: Array.isArray(parsed.movieGenres) ? parsed.movieGenres : [],
      tvGenres: Array.isArray(parsed.tvGenres) ? parsed.tvGenres : [],
      sortBy: parsed.sortBy ?? 'popularity.desc',
      minVoteAverage: typeof parsed.minVoteAverage === 'number' ? parsed.minVoteAverage : 6,
      minVoteCount: typeof parsed.minVoteCount === 'number' ? parsed.minVoteCount : 100,
      explanation: parsed.explanation ?? `Showing results for: ${query}`,
    }
  } catch {
    logger.error('Failed to parse Groq response', { content })
    throw new Error('Failed to parse AI response')
  }
}
