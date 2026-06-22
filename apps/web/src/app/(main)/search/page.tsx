'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import { useInView } from 'react-intersection-observer'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Film, Tv, X, Sparkles, Loader2 } from 'lucide-react'
import { MediaCard } from '../../../components/media/media-card'
import { MediaGridSkeleton } from '../../../components/skeletons/media-card-skeleton'
import { searchApi, aiApi } from '../../../lib/api-client'
import { useDebounce } from '../../../hooks/use-debounce'
import type { TMDBMovie, TMDBTVShow } from '@watchblitz/types'

type SafeSearchItem = (TMDBMovie | TMDBTVShow) & { media_type?: 'movie' | 'tv' }
import type { AIDiscoverResult } from '../../../lib/api-client'

type FilterType = 'multi' | 'movie' | 'tv'
type SearchMode = 'normal' | 'ai'

const AI_PLACEHOLDER_HINTS = [
  'suspense thriller with plot twists…',
  'feel-good comedy for a lazy Sunday…',
  'dark crime drama like Breaking Bad…',
  'scary horror movies for tonight…',
  'romantic films that make you cry…',
]

function AIResultsPanel({ result }: { result: AIDiscoverResult }) {
  const items = result.results as (TMDBMovie | TMDBTVShow)[]
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      {/* AI explanation card */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-primary/10 border border-primary/20 mb-6">
        <Sparkles className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
        <p className="text-sm text-white/80 leading-relaxed">{result.explanation}</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map((item, i) => {
          const r = item as { id: number; media_type?: string; title?: string }
          const mediaType = r.media_type === 'tv' ? 'tv' : 'movie'
          return (
            <motion.div
              key={`${r.id}-${i}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i, 10) * 0.04 }}
            >
              <MediaCard item={item as SafeSearchItem} mediaType={mediaType} size="lg" />
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}

function SearchContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const initialQuery = searchParams.get('q') ?? ''

  const [query, setQuery] = useState(initialQuery)
  const [filterType, setFilterType] = useState<FilterType>('multi')
  const [mode, setMode] = useState<SearchMode>('normal')
  const [hintIndex, setHintIndex] = useState(0)
  const [aiResult, setAiResult] = useState<AIDiscoverResult | null>(null)

  const debouncedQuery = useDebounce(query, 400)
  const { ref: loadMoreRef, inView } = useInView({ threshold: 0.1 })

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['search', debouncedQuery, filterType],
    queryFn: ({ pageParam = 1 }) =>
      searchApi.search(debouncedQuery, pageParam as number, filterType),
    getNextPageParam: (last) =>
      (last.page ?? 0) < (last.total_pages ?? 0) ? (last.page ?? 0) + 1 : undefined,
    initialPageParam: 1,
    enabled: mode === 'normal' && debouncedQuery.length >= 2,
    staleTime: 1000 * 60 * 2,
  })

  const aiMutation = useMutation({
    mutationFn: (q: string) => aiApi.discover(q),
    onSuccess: (result) => setAiResult(result),
  })

  if (inView && hasNextPage && !isFetchingNextPage && mode === 'normal') fetchNextPage()

  useEffect(() => {
    if (debouncedQuery && mode === 'normal') {
      router.replace(`/search?q=${encodeURIComponent(debouncedQuery)}`, { scroll: false })
    }
  }, [debouncedQuery, router, mode])

  useEffect(() => {
    const id = setInterval(() => setHintIndex((i) => (i + 1) % AI_PLACEHOLDER_HINTS.length), 2800)
    return () => clearInterval(id)
  }, [])

  const allResults = data?.pages
    .flatMap((p) => p.results ?? [])
    .filter((r) => {
      const item = r as { media_type?: string }
      return filterType !== 'multi' || (item.media_type === 'movie' || item.media_type === 'tv')
    }) ?? []

  const totalResults = data?.pages[0]?.total_results ?? 0

  function handleAISearch() {
    if (!query.trim() || query.trim().length < 3) return
    setAiResult(null)
    aiMutation.mutate(query.trim())
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">

        {/* Mode toggle */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <button
            onClick={() => { setMode('normal'); setAiResult(null) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'normal'
                ? 'bg-white/10 text-white border border-white/20'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Search className="h-4 w-4" /> Search
          </button>
          <button
            onClick={() => { setMode('ai'); setAiResult(null) }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              mode === 'ai'
                ? 'bg-primary/20 text-primary border border-primary/30'
                : 'text-white/40 hover:text-white'
            }`}
          >
            <Sparkles className="h-4 w-4" /> AI Discovery
          </button>
        </div>

        {/* Search input */}
        <div className="relative mb-8 max-w-2xl mx-auto">
          {mode === 'ai'
            ? <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
            : <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/40" />
          }
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setAiResult(null) }}
            onKeyDown={(e) => { if (e.key === 'Enter' && mode === 'ai') handleAISearch() }}
            placeholder={
              mode === 'ai'
                ? AI_PLACEHOLDER_HINTS[hintIndex]
                : 'Search movies, TV shows…'
            }
            className={`w-full h-14 pl-12 pr-28 bg-white/5 border rounded-2xl text-white text-base placeholder:text-white/30 outline-none transition-all ${
              mode === 'ai'
                ? 'border-primary/30 focus:border-primary focus:ring-1 focus:ring-primary/50'
                : 'border-white/10 focus:border-primary focus:ring-1 focus:ring-primary/50'
            }`}
            autoFocus
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
            {query && (
              <button
                onClick={() => { setQuery(''); setAiResult(null) }}
                className="p-1.5 text-white/40 hover:text-white transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {mode === 'ai' && (
              <button
                onClick={handleAISearch}
                disabled={!query.trim() || aiMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-primary text-white hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {aiMutation.isPending
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Sparkles className="h-3.5 w-3.5" />
                }
                Ask AI
              </button>
            )}
          </div>
        </div>

        {/* AI mode hint */}
        {mode === 'ai' && !aiResult && !aiMutation.isPending && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto mb-10"
          >
            <p className="text-center text-white/40 text-sm mb-4">Try asking things like:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {[
                'suspense thrillers with plot twists',
                'feel-good family movies',
                'dark crime dramas',
                'romantic comedies',
                'mind-bending sci-fi',
                'animated movies for adults',
              ].map((hint) => (
                <button
                  key={hint}
                  onClick={() => { setQuery(hint); setTimeout(() => aiMutation.mutate(hint), 50) }}
                  className="px-3 py-1.5 rounded-full text-xs bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-primary/10 hover:border-primary/20 transition-all"
                >
                  {hint}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* AI loading */}
        {aiMutation.isPending && (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
              <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-white/40 text-sm">AI is finding the perfect titles for you…</p>
          </div>
        )}

        {/* AI error */}
        {aiMutation.isError && (
          <div className="max-w-md mx-auto text-center py-12">
            <p className="text-white/40">Couldn't reach AI right now. Try a normal search instead.</p>
          </div>
        )}

        {/* AI results */}
        {aiResult && !aiMutation.isPending && (
          <AIResultsPanel result={aiResult} />
        )}

        {/* Normal mode filters + results */}
        {mode === 'normal' && (
          <>
            {debouncedQuery && (
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  {([
                    { value: 'multi', label: 'All', icon: null },
                    { value: 'movie', label: 'Movies', icon: Film },
                    { value: 'tv', label: 'TV Shows', icon: Tv },
                  ] as { value: FilterType; label: string; icon: React.ElementType | null }[]).map((f) => (
                    <button
                      key={f.value}
                      onClick={() => setFilterType(f.value)}
                      className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        filterType === f.value
                          ? 'bg-primary text-white'
                          : 'bg-white/10 text-white/60 hover:bg-white/20 hover:text-white'
                      }`}
                    >
                      {f.icon && <f.icon className="h-3.5 w-3.5" />}
                      {f.label}
                    </button>
                  ))}
                </div>
                {totalResults > 0 && (
                  <p className="text-sm text-white/40">{totalResults.toLocaleString()} results</p>
                )}
              </div>
            )}

            {!debouncedQuery || debouncedQuery.length < 2 ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Search className="h-16 w-16 text-white/10 mb-6" />
                <h2 className="text-xl font-bold text-white/40 mb-2">Search for anything</h2>
                <p className="text-white/20 text-sm mb-4">Find movies, TV shows, and more</p>
                <button
                  onClick={() => setMode('ai')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-all"
                >
                  <Sparkles className="h-4 w-4" />
                  Try AI Discovery
                </button>
              </div>
            ) : isLoading ? (
              <MediaGridSkeleton count={20} />
            ) : allResults.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-32">
                <div className="text-5xl mb-4">🔍</div>
                <h2 className="text-xl font-bold text-white mb-2">No results found</h2>
                <p className="text-white/40 text-sm mb-6">Try different keywords, or let AI help</p>
                <button
                  onClick={() => setMode('ai')}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-primary bg-primary/10 border border-primary/20"
                >
                  <Sparkles className="h-4 w-4" /> Try AI Discovery
                </button>
              </div>
            ) : (
              <>
                <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                  <AnimatePresence>
                    {allResults.map((result, i) => {
                      const r = result as { id: number; media_type?: string; title?: string; name?: string }
                      const mediaType = r.media_type === 'movie' || 'title' in r ? 'movie' : 'tv'
                      return (
                        <motion.div
                          key={`${r.id}-${i}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ duration: 0.2, delay: Math.min(i % 20, 10) * 0.03 }}
                        >
                          <MediaCard item={result as SafeSearchItem} mediaType={mediaType} size="lg" />
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </motion.div>
                <div ref={loadMoreRef} className="py-8 flex justify-center">
                  {isFetchingNextPage && (
                    <div className="flex gap-2">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-3 w-3 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-24 flex items-center justify-center"><div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" /></div>}>
      <SearchContent />
    </Suspense>
  )
}
