import { moviesApi } from '../../lib/api-client'
import { HeroBanner } from './hero-banner'
import type { TMDBMovie } from '@watchblitz/types'

export async function HeroSection() {
  try {
    const data = await moviesApi.getTrending('week', 1)
    const heroItems = data.results.slice(0, 8) as (TMDBMovie & {
      genres?: Array<{ id: number; name: string }>
      videos?: { results: Array<{ type: string; site: string; key: string }> }
    })[]
    return <HeroBanner items={heroItems} mediaType="movie" autoPlay interval={9000} />
  } catch {
    return null
  }
}
