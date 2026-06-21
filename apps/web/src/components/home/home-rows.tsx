'use client'

import { useQuery } from '@tanstack/react-query'
import { MediaRow } from '../media/media-row'
import { moviesApi, tvApi } from '../../lib/api-client'

export function HomeRows() {
  const { data: trendingMovies, isLoading: l1 } = useQuery({
    queryKey: ['movies', 'trending', 'week'],
    queryFn: () => moviesApi.getTrending('week'),
  })

  const { data: trendingTV, isLoading: l2 } = useQuery({
    queryKey: ['tv', 'trending', 'week'],
    queryFn: () => tvApi.getTrending('week'),
  })

  const { data: popularMovies, isLoading: l3 } = useQuery({
    queryKey: ['movies', 'popular'],
    queryFn: () => moviesApi.getPopular(),
  })

  const { data: topRatedMovies, isLoading: l4 } = useQuery({
    queryKey: ['movies', 'top-rated'],
    queryFn: () => moviesApi.getTopRated(),
  })

  const { data: popularTV, isLoading: l5 } = useQuery({
    queryKey: ['tv', 'popular'],
    queryFn: () => tvApi.getPopular(),
  })

  const { data: nowPlaying, isLoading: l6 } = useQuery({
    queryKey: ['movies', 'now-playing'],
    queryFn: () => moviesApi.getNowPlaying(),
  })

  const { data: airingToday, isLoading: l7 } = useQuery({
    queryKey: ['tv', 'airing-today'],
    queryFn: () => tvApi.getAiringToday(),
  })

  const { data: topRatedTV, isLoading: l8 } = useQuery({
    queryKey: ['tv', 'top-rated'],
    queryFn: () => tvApi.getTopRated(),
  })

  const { data: upcoming, isLoading: l9 } = useQuery({
    queryKey: ['movies', 'upcoming'],
    queryFn: () => moviesApi.getUpcoming(),
  })

  return (
    <>
      <MediaRow
        title="🔥 Trending Movies"
        subtitle="What everyone is watching this week"
        items={trendingMovies?.results ?? []}
        isLoading={l1}
        mediaType="movie"
        viewAllHref="/trending"
      />

      <MediaRow
        title="📺 Trending TV Shows"
        subtitle="Series everyone's binging right now"
        items={trendingTV?.results ?? []}
        isLoading={l2}
        mediaType="tv"
        viewAllHref="/trending"
      />

      <MediaRow
        title="🍿 Now Playing"
        subtitle="Currently in theaters"
        items={nowPlaying?.results ?? []}
        isLoading={l6}
        mediaType="movie"
        viewAllHref="/movies"
      />

      <MediaRow
        title="⭐ Top Rated Movies"
        subtitle="The greatest films of all time"
        items={topRatedMovies?.results ?? []}
        isLoading={l4}
        mediaType="movie"
        viewAllHref="/movies"
      />

      <MediaRow
        title="🎬 Popular Movies"
        subtitle="Most watched this month"
        items={popularMovies?.results ?? []}
        isLoading={l3}
        mediaType="movie"
        viewAllHref="/movies"
      />

      <MediaRow
        title="📡 Airing Today"
        subtitle="New episodes available now"
        items={airingToday?.results ?? []}
        isLoading={l7}
        mediaType="tv"
        viewAllHref="/tv"
      />

      <MediaRow
        title="🏆 Top Rated TV"
        subtitle="Best series ever made"
        items={topRatedTV?.results ?? []}
        isLoading={l8}
        mediaType="tv"
        viewAllHref="/tv"
      />

      <MediaRow
        title="🎭 Popular TV Shows"
        subtitle="Fan favorites"
        items={popularTV?.results ?? []}
        isLoading={l5}
        mediaType="tv"
        viewAllHref="/tv"
      />

      <MediaRow
        title="🗓 Upcoming Movies"
        subtitle="Coming soon to theaters"
        items={upcoming?.results ?? []}
        isLoading={l9}
        mediaType="movie"
        viewAllHref="/movies"
      />
    </>
  )
}
