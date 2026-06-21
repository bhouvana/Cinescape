'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, TrendingUp, Clock, Film, Tv } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { useDebounce } from '../../hooks/use-debounce'
import { searchApi } from '../../lib/api-client'
import { buildPosterUrl, formatYear, getMediaTitle, getMediaDate } from '../../lib/utils'
import type { TMDBMovie, TMDBTVShow, TMDBPerson } from '@watchblitz/types'

interface SearchModalProps {
  open: boolean
  onClose: () => void
}

type SearchResult = (TMDBMovie | TMDBTVShow | TMDBPerson) & { media_type?: string }

export function SearchModal({ open, onClose }: SearchModalProps) {
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const debouncedQuery = useDebounce(query, 350)

  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchApi.search(debouncedQuery),
    enabled: debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 2,
  })

  const { data: trending } = useQuery({
    queryKey: ['search-trending'],
    queryFn: () => searchApi.getTrending(),
    enabled: open && !query,
    staleTime: 1000 * 60 * 30,
  })

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
    }
  }, [open])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const results = searchResults?.results?.filter((r) => {
    const result = r as SearchResult
    return result.media_type !== 'person'
  }).slice(0, 8) as SearchResult[] | undefined

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed left-1/2 top-20 z-[101] w-full max-w-2xl -translate-x-1/2 px-4"
          >
            <div className="rounded-2xl border border-white/10 bg-card/95 backdrop-blur-2xl shadow-2xl overflow-hidden">
              {/* Search input */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
                <Search className="h-5 w-5 text-white/40 flex-shrink-0" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search movies, TV shows..."
                  className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none text-base"
                  autoComplete="off"
                />
                {query && (
                  <button onClick={() => setQuery('')} className="text-white/40 hover:text-white">
                    <X className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 text-white/50 text-xs hover:bg-white/20 transition-colors"
                >
                  <X className="h-3 w-3" />
                  <span>ESC</span>
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {isLoading && (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex gap-3">
                        <div className="h-12 w-8 shimmer rounded flex-shrink-0" />
                        <div className="flex-1 space-y-1.5">
                          <div className="shimmer h-4 w-3/4 rounded" />
                          <div className="shimmer h-3 w-1/2 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {results && results.length > 0 && (
                  <div className="p-2">
                    <p className="px-2 py-1.5 text-xs font-semibold text-white/30 uppercase tracking-wider">
                      Results
                    </p>
                    {results.map((result) => {
                      const r = result as SearchResult
                      const isMovie = r.media_type === 'movie' || 'title' in r
                      const title = getMediaTitle(r as { title?: string; name?: string })
                      const year = formatYear(getMediaDate(r as { release_date?: string; first_air_date?: string }))
                      const poster = buildPosterUrl('poster_path' in r ? r.poster_path as string | null : null, 'w92')
                      const href = isMovie ? `/movie/${r.id}` : `/tv/${r.id}`

                      return (
                        <Link
                          key={r.id}
                          href={href}
                          onClick={onClose}
                          className="flex items-center gap-3 rounded-lg p-2 hover:bg-white/10 transition-colors group"
                        >
                          {/* Poster */}
                          <div className="relative h-12 w-8 flex-shrink-0 rounded overflow-hidden bg-muted">
                            {poster ? (
                              <Image src={poster} alt={title} fill className="object-cover" sizes="32px" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-lg">
                                {isMovie ? '🎬' : '📺'}
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{title}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-1 text-xs text-white/40">
                                {isMovie ? (
                                  <><Film className="h-3 w-3" /> Movie</>
                                ) : (
                                  <><Tv className="h-3 w-3" /> TV Show</>
                                )}
                              </span>
                              {year && year !== 'N/A' && (
                                <span className="text-xs text-white/30">{year}</span>
                              )}
                            </div>
                          </div>

                          {'vote_average' in r && r.vote_average > 0 && (
                            <span className="text-xs font-bold text-yellow-400 flex-shrink-0">
                              ★ {(r.vote_average as number).toFixed(1)}
                            </span>
                          )}
                        </Link>
                      )
                    })}

                    {/* View all results */}
                    {query.length >= 2 && (
                      <Link
                        href={`/search?q=${encodeURIComponent(query)}`}
                        onClick={onClose}
                        className="flex items-center justify-center gap-2 rounded-lg p-3 mt-1 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
                      >
                        <Search className="h-4 w-4" />
                        See all results for &quot;{query}&quot;
                      </Link>
                    )}
                  </div>
                )}

                {/* No results */}
                {!isLoading && results?.length === 0 && query.length >= 2 && (
                  <div className="p-8 text-center">
                    <p className="text-white/40 text-sm">No results for &quot;{query}&quot;</p>
                    <p className="text-white/20 text-xs mt-1">Try different keywords</p>
                  </div>
                )}

                {/* Trending (when no query) */}
                {!query && trending && trending.length > 0 && (
                  <div className="p-2">
                    <p className="px-2 py-1.5 text-xs font-semibold text-white/30 uppercase tracking-wider flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> Trending Searches
                    </p>
                    {trending.slice(0, 8).map((item) => (
                      <button
                        key={item.query}
                        onClick={() => setQuery(item.query)}
                        className="w-full flex items-center gap-3 rounded-lg p-2 hover:bg-white/10 transition-colors text-left"
                      >
                        <TrendingUp className="h-4 w-4 text-white/30 flex-shrink-0" />
                        <span className="text-sm text-white/70">{item.query}</span>
                        <span className="ml-auto text-xs text-white/30">{item.count} searches</span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Empty state */}
                {!query && (!trending || trending.length === 0) && (
                  <div className="p-8 text-center">
                    <Search className="h-8 w-8 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">Start typing to search</p>
                    <p className="text-white/20 text-xs mt-1">Movies, TV shows, and more</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
