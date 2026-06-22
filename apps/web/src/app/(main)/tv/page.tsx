'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { SlidersHorizontal, X, ChevronLeft, ChevronRight } from 'lucide-react'
import { MediaCard } from '../../../components/media/media-card'
import { MediaGridSkeleton } from '../../../components/skeletons/media-card-skeleton'
import { Pagination } from '../../../components/ui/pagination'
import { tvApi } from '../../../lib/api-client'
import { cn } from '../../../lib/utils'
import type { TMDBTVShow } from '@watchblitz/types'

type SafeTVItem = TMDBTVShow & { media_type?: 'movie' | 'tv' }

const SORT_TABS = [
  { id: 'popular', label: 'Most Popular', sort: 'popularity.desc', minVotes: 50 },
  { id: 'top-rated', label: 'Top Rated', sort: 'vote_average.desc', minVotes: 200 },
  { id: 'new', label: 'New Releases', sort: 'first_air_date.desc', minVotes: 0 },
]

const TV_GENRES = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
]

export default function TVPage() {
  const [activeTab, setActiveTab] = useState<string>('popular')
  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [minRating, setMinRating] = useState(0)
  const [year, setYear] = useState<number | undefined>()
  const [page, setPage] = useState(1)
  const tabBarRef = useRef<HTMLDivElement>(null)

  const buildParams = useCallback(() => {
    const sortTab = SORT_TABS.find((t) => t.id === activeTab)
    return {
      sort_by: selectedGenreId
        ? ('popularity.desc' as const)
        : ((sortTab?.sort ?? 'popularity.desc') as 'popularity.desc'),
      with_genres: selectedGenreId ? String(selectedGenreId) : undefined,
      'vote_average.gte': minRating || undefined,
      'vote_count.gte': selectedGenreId ? 30 : (sortTab?.minVotes ?? 50),
      first_air_date_year: year,
    }
  }, [activeTab, selectedGenreId, minRating, year])

  const { data, isLoading, isFetching, isError, refetch } = useQuery({
    queryKey: ['discover-tv', activeTab, selectedGenreId, minRating, year, page],
    queryFn: () => tvApi.discover({ ...buildParams(), page }),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
  })

  const allShows = data?.results ?? []
  const totalPages = Math.min(data?.total_pages ?? 1, 500)
  const totalResults = data?.total_results ?? 0

  // Scroll to top when page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [page])

  const handleSortTab = (id: string) => {
    setActiveTab(id)
    setSelectedGenreId(null)
    setPage(1)
  }

  const handleGenreTab = (id: number) => {
    setSelectedGenreId((prev) => (prev === id ? null : id))
    if (selectedGenreId !== id) setActiveTab('popular')
    setPage(1)
  }

  const clearAll = () => {
    setActiveTab('popular')
    setSelectedGenreId(null)
    setMinRating(0)
    setYear(undefined)
    setPage(1)
  }

  const hasAdvancedFilters = minRating > 0 || !!year

  const scrollTabs = (dir: 'left' | 'right') => {
    tabBarRef.current?.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' })
  }

  const activeLabel = selectedGenreId
    ? TV_GENRES.find((g) => g.id === selectedGenreId)?.name
    : SORT_TABS.find((t) => t.id === activeTab)?.label

  return (
    <div className="min-h-screen pt-20 pb-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-center justify-between py-4 mb-2">
          <div>
            <h1 className="text-2xl font-black text-white">TV Shows</h1>
            <p className="text-white/40 text-xs mt-0.5">
              {activeLabel} · {totalResults.toLocaleString()} titles
            </p>
          </div>
          <div className="flex items-center gap-2">
            {(hasAdvancedFilters || selectedGenreId) && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                showAdvanced || hasAdvancedFilters
                  ? 'bg-primary/20 text-primary border-primary/40'
                  : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
              )}
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filters
              {hasAdvancedFilters && (
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-white text-[9px] font-black">
                  {(minRating > 0 ? 1 : 0) + (year ? 1 : 0)}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Genre tab strip */}
        <div className="relative mb-6">
          <button
            onClick={() => scrollTabs('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-6 items-center justify-center bg-gradient-to-r from-background to-transparent text-white/50 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div
            ref={tabBarRef}
            className="flex gap-1 overflow-x-auto no-scrollbar px-6 border-b border-white/8"
          >
            {SORT_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleSortTab(tab.id)}
                className={cn(
                  'flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px whitespace-nowrap',
                  activeTab === tab.id && !selectedGenreId
                    ? 'text-primary border-primary'
                    : 'text-white/50 border-transparent hover:text-white hover:border-white/30'
                )}
              >
                {tab.label}
              </button>
            ))}

            <div className="flex-shrink-0 w-px bg-white/10 mx-2 self-stretch my-1.5" />

            {TV_GENRES.map((genre) => (
              <button
                key={genre.id}
                onClick={() => handleGenreTab(genre.id)}
                className={cn(
                  'flex-shrink-0 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px whitespace-nowrap',
                  selectedGenreId === genre.id
                    ? 'text-primary border-primary'
                    : 'text-white/50 border-transparent hover:text-white hover:border-white/30'
                )}
              >
                {genre.name}
              </button>
            ))}
          </div>
          <button
            onClick={() => scrollTabs('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex h-8 w-6 items-center justify-center bg-gradient-to-l from-background to-transparent text-white/50 hover:text-white transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Advanced filters */}
        <AnimatePresence>
          {showAdvanced && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 overflow-hidden"
            >
              <div className="flex flex-wrap gap-4 p-4 rounded-xl border border-white/10 bg-white/3">
                <div className="flex items-center gap-2">
                  <label className="text-xs text-white/50 whitespace-nowrap">Min Rating</label>
                  <select
                    value={minRating}
                    onChange={(e) => { setMinRating(Number(e.target.value)); setPage(1) }}
                    className="bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-primary"
                  >
                    <option value={0} className="bg-zinc-900">Any</option>
                    <option value={9} className="bg-zinc-900">9+ Excellent</option>
                    <option value={7} className="bg-zinc-900">7+ Great</option>
                    <option value={5} className="bg-zinc-900">5+ Average</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs text-white/50">Year</label>
                  <select
                    value={year ?? ''}
                    onChange={(e) => { setYear(e.target.value ? Number(e.target.value) : undefined); setPage(1) }}
                    className="bg-white/10 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white outline-none focus:border-primary"
                  >
                    <option value="" className="bg-zinc-900">All Years</option>
                    {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i).map((y) => (
                      <option key={y} value={y} className="bg-zinc-900">{y}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Grid */}
        <div className={cn('transition-opacity duration-200', isFetching && !isLoading && 'opacity-60')}>
          {isLoading ? (
            <MediaGridSkeleton count={20} />
          ) : isError ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="text-4xl">📡</div>
              <p className="text-white/50 text-sm">Couldn&apos;t connect to the server. Please try again.</p>
              <button
                onClick={() => refetch()}
                className="px-5 py-2 bg-primary text-black rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Retry
              </button>
            </div>
          ) : allShows.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
              <div className="text-4xl">📭</div>
              <p className="text-white/50 text-sm">No TV shows found for these filters.</p>
              <button onClick={clearAll} className="text-primary text-sm hover:underline">Clear filters</button>
            </div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
            >
              <AnimatePresence mode="popLayout">
                {allShows.map((show, i) => (
                  <motion.div
                    key={show.id}
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    transition={{ duration: 0.18, delay: Math.min(i, 15) * 0.025 }}
                  >
                    <MediaCard item={show as SafeTVItem} mediaType="tv" size="lg" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-10 flex flex-col items-center gap-3"
          >
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            <p className="text-xs text-white/25">
              Page {page} of {totalPages.toLocaleString()} · {totalResults.toLocaleString()} total titles
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
