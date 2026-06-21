'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Bookmark, Trash2, Play, Film, Tv, LayoutGrid, List, Loader2 } from 'lucide-react'
import { watchlistApi, moviesApi, tvApi } from '../../../lib/api-client'
import { buildPosterUrl, cn } from '../../../lib/utils'
import { toast } from 'sonner'

type ViewMode = 'grid' | 'list'
type MediaFilter = 'all' | 'movie' | 'tv'

interface RawItem {
  id: string
  tmdbId: number
  mediaType: string
  watchlistId: string
  notes?: string
}

function WatchlistItemCard({
  item,
  viewMode,
  onRemove,
  isRemoving,
}: {
  item: RawItem
  viewMode: ViewMode
  onRemove: () => void
  isRemoving: boolean
}) {
  const isMovie = item.mediaType === 'movie'

  const { data: movieDetails, isLoading: movieLoading } = useQuery({
    queryKey: ['movie-details', item.tmdbId],
    queryFn: () => moviesApi.getDetails(item.tmdbId),
    enabled: isMovie,
    staleTime: 1000 * 60 * 30,
  })

  const { data: tvDetails, isLoading: tvLoading } = useQuery({
    queryKey: ['tv-details', item.tmdbId],
    queryFn: () => tvApi.getDetails(item.tmdbId),
    enabled: !isMovie,
    staleTime: 1000 * 60 * 30,
  })

  const title = isMovie ? movieDetails?.title : tvDetails?.name
  const posterPath = isMovie ? movieDetails?.poster_path : tvDetails?.poster_path
  const isLoading = isMovie ? movieLoading : tvLoading
  const posterUrl = posterPath ? buildPosterUrl(posterPath, 'w342') : null
  const watchHref = isMovie
    ? `/watch/movie/${item.tmdbId}`
    : `/watch/tv/${item.tmdbId}/1/1`
  const detailHref = isMovie ? `/movie/${item.tmdbId}` : `/tv/${item.tmdbId}`

  if (viewMode === 'grid') {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.85 }}
        className="group relative"
      >
        <Link href={detailHref}>
          <div className="aspect-[2/3] rounded-xl overflow-hidden bg-muted relative">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/5 to-transparent">
                <Loader2 className="h-6 w-6 text-white/20 animate-spin" />
              </div>
            ) : posterUrl ? (
              <Image
                src={posterUrl}
                alt={title ?? ''}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 16vw"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-purple-500/10 text-4xl">
                {isMovie ? '🎬' : '📺'}
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
              <Link
                href={watchHref}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary text-white hover:bg-primary/90"
              >
                <Play className="h-3 w-3 fill-current" /> Watch
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  onRemove()
                }}
                disabled={isRemoving}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white/10 text-white/70 hover:bg-red-500/20 hover:text-red-400 border border-white/10 transition-all disabled:opacity-50"
              >
                {isRemoving ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Trash2 className="h-3 w-3" />
                )}{' '}
                Remove
              </button>
            </div>

            {/* Media badge */}
            <div className="absolute top-2 left-2">
              <div className="p-1 rounded-md bg-black/60 backdrop-blur-sm">
                {isMovie ? (
                  <Film className="h-3 w-3 text-white/70" />
                ) : (
                  <Tv className="h-3 w-3 text-white/70" />
                )}
              </div>
            </div>
          </div>
        </Link>
        {title && (
          <p className="mt-2 text-xs font-medium text-white/70 truncate px-1">{title}</p>
        )}
      </motion.div>
    )
  }

  // List view
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 10 }}
      className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/8 transition-all group"
    >
      <Link href={detailHref} className="flex items-center gap-4 flex-1 min-w-0">
        <div className="relative h-16 w-11 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center">
              <Loader2 className="h-4 w-4 text-white/20 animate-spin" />
            </div>
          ) : posterUrl ? (
            <Image
              src={posterUrl}
              alt={title ?? ''}
              fill
              className="object-cover"
              sizes="44px"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-lg">
              {isMovie ? '🎬' : '📺'}
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white truncate">
            {isLoading ? (
              <span className="inline-block h-4 w-32 rounded bg-white/10 animate-pulse" />
            ) : (
              title ?? `TMDB #${item.tmdbId}`
            )}
          </p>
          <p className="text-xs text-white/40 flex items-center gap-1 mt-0.5">
            {isMovie ? <Film className="h-3 w-3" /> : <Tv className="h-3 w-3" />}
            {isMovie ? 'Movie' : 'TV Show'}
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-2 flex-shrink-0">
        <Link
          href={watchHref}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary/20 text-primary hover:bg-primary hover:text-white transition-all border border-primary/30"
        >
          <Play className="h-3 w-3 fill-current" /> Watch
        </Link>
        <button
          onClick={onRemove}
          disabled={isRemoving}
          className="p-2 rounded-lg text-white/30 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
        >
          {isRemoving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </button>
      </div>
    </motion.div>
  )
}

export default function WatchlistPage() {
  const { getToken } = useAuth()
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [mediaFilter, setMediaFilter] = useState<MediaFilter>('all')
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set())

  // Load the user's watchlists
  const { data: watchlists, isLoading: listsLoading } = useQuery({
    queryKey: ['watchlists'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) return []
      return watchlistApi.getAll(token)
    },
  })

  const lists = (watchlists as Array<{ id: string; name: string }> | undefined) ?? []
  const defaultList = lists[0] // first list is the user's default

  // Load items from the default watchlist
  const { data: rawItems, isLoading: itemsLoading } = useQuery({
    queryKey: ['watchlist-items', 'page', defaultList?.id],
    queryFn: async () => {
      const token = await getToken()
      if (!token || !defaultList) return []
      return watchlistApi.getItems(token, defaultList.id)
    },
    enabled: !!defaultList,
    staleTime: 1000 * 30,
  })

  const items = (rawItems as RawItem[] | undefined) ?? []
  const filteredItems = items.filter(
    (item) => mediaFilter === 'all' || item.mediaType === mediaFilter
  )

  const removeMutation = useMutation({
    mutationFn: async ({ listId, itemId }: { listId: string; itemId: string }) => {
      const token = await getToken()
      if (!token) throw new Error('Unauthorized')
      return watchlistApi.removeItem(token, listId, itemId)
    },
    onSuccess: (_, { itemId }) => {
      setRemovingIds((prev) => { const next = new Set(prev); next.delete(itemId); return next })
      queryClient.invalidateQueries({ queryKey: ['watchlist-items'] })
      toast.success('Removed from My List')
    },
    onError: (_, { itemId }) => {
      setRemovingIds((prev) => { const next = new Set(prev); next.delete(itemId); return next })
      toast.error('Failed to remove item')
    },
  })

  const handleRemove = (item: RawItem) => {
    if (!defaultList) return
    setRemovingIds((prev) => new Set(prev).add(item.id))
    removeMutation.mutate({ listId: item.watchlistId || defaultList.id, itemId: item.id })
  }

  const isLoading = listsLoading || (!!defaultList && itemsLoading)

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Bookmark className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-black text-white">My Watchlist</h1>
            </div>
            <p className="text-sm text-white/40">
              {filteredItems.length} {filteredItems.length === 1 ? 'title' : 'titles'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Media type filter */}
            <div className="flex rounded-lg bg-white/5 border border-white/10 overflow-hidden">
              {(['all', 'movie', 'tv'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setMediaFilter(type)}
                  className={cn(
                    'px-3 py-1.5 text-sm font-medium capitalize transition-all',
                    mediaFilter === type
                      ? 'bg-primary text-white'
                      : 'text-white/50 hover:text-white'
                  )}
                >
                  {type === 'all' ? 'All' : type === 'movie' ? 'Movies' : 'TV'}
                </button>
              ))}
            </div>

            {/* View toggle */}
            <div className="flex rounded-lg bg-white/5 border border-white/10 overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'grid' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'
                )}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  'p-2 transition-colors',
                  viewMode === 'list' ? 'bg-white/20 text-white' : 'text-white/40 hover:text-white'
                )}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Content */}
        {isLoading ? (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
                : 'space-y-2'
            )}
          >
            {Array.from({ length: 12 }).map((_, i) => (
              viewMode === 'grid'
                ? <div key={i} className="aspect-[2/3] shimmer rounded-xl" />
                : <div key={i} className="h-20 shimmer rounded-xl" />
            ))}
          </div>
        ) : filteredItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-32 text-center"
          >
            <Bookmark className="h-16 w-16 text-white/10 mb-4" />
            <h2 className="text-xl font-bold text-white/40 mb-2">Your watchlist is empty</h2>
            <p className="text-sm text-white/25 mb-8 max-w-sm">
              Browse movies and TV shows, then click the + button to add them here.
            </p>
            <Link
              href="/movies"
              className="px-6 py-2.5 rounded-xl font-bold text-sm bg-primary text-white hover:bg-primary/90 transition-all active:scale-95"
            >
              Browse Movies
            </Link>
          </motion.div>
        ) : (
          <div
            className={cn(
              viewMode === 'grid'
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
                : 'space-y-2'
            )}
          >
            <AnimatePresence mode="popLayout">
              {filteredItems.map((item) => (
                <WatchlistItemCard
                  key={item.id}
                  item={item}
                  viewMode={viewMode}
                  onRemove={() => handleRemove(item)}
                  isRemoving={removingIds.has(item.id)}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}
