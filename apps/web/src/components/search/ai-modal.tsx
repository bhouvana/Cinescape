'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Send, Star, Wand2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { aiApi } from '../../lib/api-client'
import { buildPosterUrl, getMediaTitle, getMediaDate, formatYear } from '../../lib/utils'
import type { TMDBMovie, TMDBTVShow } from '@watchblitz/types'

interface AIModalProps {
  open: boolean
  onClose: () => void
}

type AIResult = TMDBMovie | TMDBTVShow

const HINT_CHIPS = [
  'feel-good comedies',
  'suspense thrillers',
  'mind-bending sci-fi',
  'romantic drama',
  'classic action',
  'family movie night',
  'psychological horror',
  'animated adventures',
]

const PLACEHOLDERS = [
  'something scary but not too scary...',
  'feel good movies for the weekend...',
  'mind-bending sci-fi thrillers...',
  'romantic comedy for date night...',
  'classic 90s action movies...',
  'family-friendly animated films...',
]

export function AIModal({ open, onClose }: AIModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<AIResult[]>([])
  const [explanation, setExplanation] = useState('')
  const [loading, setLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [placeholderIdx, setPlaceholderIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setQuery('')
      setResults([])
      setExplanation('')
      setHasSearched(false)
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [open])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  const handleSearch = async (q?: string) => {
    const searchQuery = (q ?? query).trim()
    if (!searchQuery) return
    if (q) setQuery(q)
    setLoading(true)
    setHasSearched(true)
    try {
      const data = await aiApi.discover(searchQuery)
      setResults((data.results as AIResult[]).slice(0, 12))
      setExplanation(data.explanation)
    } catch {
      setResults([])
      setExplanation('')
    } finally {
      setLoading(false)
    }
  }

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
            <div className="rounded-2xl border border-violet-500/20 bg-card/95 backdrop-blur-2xl shadow-2xl shadow-violet-500/10 overflow-hidden">
              {/* Input bar */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10 bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-transparent">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-500/30 flex-shrink-0">
                  <Sparkles className="h-4 w-4 text-white" />
                </div>

                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder={PLACEHOLDERS[placeholderIdx]}
                  className="flex-1 bg-transparent text-white placeholder:text-white/30 outline-none text-base"
                  autoComplete="off"
                />

                <div className="flex items-center gap-2 flex-shrink-0">
                  {query && (
                    <button
                      onClick={() => handleSearch()}
                      disabled={loading}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-indigo-600 text-white text-sm font-semibold hover:from-violet-500 hover:to-indigo-500 active:scale-95 transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <span className="h-3.5 w-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      Ask AI
                    </button>
                  )}
                  {query && !loading && (
                    <button onClick={() => setQuery('')} className="text-white/40 hover:text-white transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/10 text-white/50 text-xs hover:bg-white/20 transition-colors"
                  >
                    <X className="h-3 w-3" />
                    ESC
                  </button>
                </div>
              </div>

              <div className="max-h-[65vh] overflow-y-auto">
                {/* Loading */}
                {loading && (
                  <div className="p-10 flex flex-col items-center gap-3">
                    <div className="relative">
                      <div className="h-10 w-10 rounded-full border-2 border-violet-500/20 border-t-violet-500 animate-spin" />
                      <Sparkles className="absolute inset-0 m-auto h-4 w-4 text-violet-400 animate-pulse" />
                    </div>
                    <p className="text-white/40 text-sm">AI is finding the perfect picks...</p>
                  </div>
                )}

                {/* Results */}
                {!loading && results.length > 0 && (
                  <div className="p-4 space-y-4">
                    {/* AI explanation */}
                    {explanation && (
                      <div className="flex items-start gap-3 p-3 rounded-xl bg-gradient-to-r from-violet-500/10 to-indigo-500/10 border border-violet-500/20">
                        <Sparkles className="h-4 w-4 text-violet-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-white/70 leading-relaxed">{explanation}</p>
                      </div>
                    )}

                    {/* Poster grid */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {results.map((item) => {
                        const isMovie = 'title' in item
                        const title = getMediaTitle(item as { title?: string; name?: string })
                        const year = formatYear(getMediaDate(item as { release_date?: string; first_air_date?: string }))
                        const poster = buildPosterUrl(
                          'poster_path' in item ? (item.poster_path as string | null) : null,
                          'w185'
                        )
                        const href = isMovie ? `/movie/${item.id}` : `/tv/${item.id}`
                        const rating = 'vote_average' in item ? (item.vote_average as number) : 0

                        return (
                          <Link
                            key={`${isMovie ? 'movie' : 'tv'}-${item.id}`}
                            href={href}
                            onClick={onClose}
                            className="group relative rounded-xl overflow-hidden bg-zinc-800 aspect-[2/3] hover:scale-105 transition-transform duration-200 shadow-md"
                          >
                            {poster ? (
                              <Image
                                src={poster}
                                alt={title}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 33vw, 25vw"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-3xl bg-zinc-800">
                                {isMovie ? '🎬' : '📺'}
                              </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                            <div className="absolute bottom-0 left-0 right-0 p-2 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-200">
                              <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{title}</p>
                              <div className="flex items-center gap-1.5 mt-1">
                                {year && <span className="text-white/50 text-[10px]">{year}</span>}
                                {rating > 0 && (
                                  <span className="flex items-center gap-0.5 text-yellow-400 text-[10px]">
                                    <Star className="h-2.5 w-2.5 fill-yellow-400" />
                                    {rating.toFixed(1)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Hint chips (before first search) */}
                {!loading && !hasSearched && (
                  <div className="p-4 space-y-4">
                    <p className="text-xs font-semibold text-white/30 uppercase tracking-wider flex items-center gap-1.5">
                      <Wand2 className="h-3 w-3" /> Try asking for
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {HINT_CHIPS.map((chip) => (
                        <button
                          key={chip}
                          onClick={() => handleSearch(chip)}
                          className="px-3 py-1.5 rounded-full bg-white/5 hover:bg-violet-500/20 border border-white/10 hover:border-violet-500/40 text-white/60 hover:text-white text-sm transition-all"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                    <div className="p-5 rounded-xl bg-gradient-to-br from-violet-500/5 to-indigo-500/5 border border-violet-500/10 text-center">
                      <Sparkles className="h-6 w-6 text-violet-400/40 mx-auto mb-2" />
                      <p className="text-white/30 text-sm">
                        Describe your mood and AI will pick the perfect titles
                      </p>
                    </div>
                  </div>
                )}

                {/* No results after search */}
                {!loading && hasSearched && results.length === 0 && (
                  <div className="p-8 text-center">
                    <Sparkles className="h-8 w-8 text-white/20 mx-auto mb-3" />
                    <p className="text-white/40 text-sm">No matches found for that description</p>
                    <p className="text-white/20 text-xs mt-1">Try a different mood or genre</p>
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
