'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import { MediaCard } from '../../../components/media/media-card'
import { MediaGridSkeleton } from '../../../components/skeletons/media-card-skeleton'
import { trendingApi } from '../../../lib/api-client'

type TimeWindow = 'day' | 'week'
type ContentType = 'all' | 'movies' | 'tv'

export default function TrendingPage() {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('week')
  const [contentType, setContentType] = useState<ContentType>('all')

  const { data: allTrending, isLoading: l1 } = useQuery({
    queryKey: ['trending', 'all', timeWindow],
    queryFn: () => trendingApi.getAll(timeWindow),
    enabled: contentType === 'all',
  })

  const { data: moviesTrending, isLoading: l2 } = useQuery({
    queryKey: ['trending', 'movies', timeWindow],
    queryFn: () => trendingApi.getMovies(timeWindow),
    enabled: contentType === 'movies',
  })

  const { data: tvTrending, isLoading: l3 } = useQuery({
    queryKey: ['trending', 'tv', timeWindow],
    queryFn: () => trendingApi.getTV(timeWindow),
    enabled: contentType === 'tv',
  })

  const items = (() => {
    if (contentType === 'movies') return moviesTrending?.results ?? []
    if (contentType === 'tv') return tvTrending?.results ?? []
    return allTrending?.results?.filter((r) => {
      const item = r as { media_type?: string }
      return item.media_type === 'movie' || item.media_type === 'tv'
    }) ?? []
  })()

  const isLoading = l1 || l2 || l3

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/30">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-black text-white">Trending</h1>
          </div>
          <p className="text-white/50 text-sm">What people are watching right now</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Time window */}
          <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
            {(['day', 'week'] as TimeWindow[]).map((t) => (
              <button
                key={t}
                onClick={() => setTimeWindow(t)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  timeWindow === t
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {t === 'day' ? 'Today' : 'This Week'}
              </button>
            ))}
          </div>

          {/* Content type */}
          <div className="flex items-center rounded-xl border border-white/10 bg-white/5 p-1">
            {([
              { value: 'all', label: 'All' },
              { value: 'movies', label: '🎬 Movies' },
              { value: 'tv', label: '📺 TV Shows' },
            ] as { value: ContentType; label: string }[]).map((t) => (
              <button
                key={t.value}
                onClick={() => setContentType(t.value)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  contentType === t.value
                    ? 'bg-white/20 text-white'
                    : 'text-white/50 hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <MediaGridSkeleton count={20} />
        ) : (
          <motion.div
            layout
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
          >
            {items.map((item, i) => {
              const mediaItem = item as { id: number; media_type?: string; title?: string; name?: string }
              const mediaType = mediaItem.media_type === 'movie' || 'title' in mediaItem ? 'movie' : 'tv'
              return (
                <motion.div
                  key={`${mediaItem.id}-${i}`}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.2, delay: Math.min(i, 10) * 0.03 }}
                  className="relative"
                >
                  {/* Rank number */}
                  {i < 10 && (
                    <div className="absolute -top-2 -left-1 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-white text-xs font-black shadow-lg">
                      {i + 1}
                    </div>
                  )}
                  <MediaCard
                    item={item as Parameters<typeof MediaCard>[0]['item']}
                    mediaType={mediaType}
                    size="lg"
                  />
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </div>
    </div>
  )
}
