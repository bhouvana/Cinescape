'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Info, Volume2, VolumeX, Star, Clock, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { buildBackdropUrl, formatRuntime, formatVoteAverage, getTrailer, truncateText } from '../../lib/utils'
import type { TMDBMovie, TMDBTVShow } from '@watchblitz/types'

type HeroItem = (TMDBMovie | TMDBTVShow) & {
  runtime?: number
  genres?: Array<{ id: number; name: string }>
  videos?: { results: Array<{ type: string; site: string; key: string }> }
}

interface HeroBannerProps {
  items: HeroItem[]
  mediaType?: 'movie' | 'tv'
  autoPlay?: boolean
  interval?: number
}

export function HeroBanner({ items, mediaType, autoPlay = true, interval = 8000 }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [muted, setMuted] = useState(true)
  const [showTrailer, setShowTrailer] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)

  const item = items[currentIndex]
  if (!item) return null

  const title = 'title' in item ? item.title : item.name
  const date = 'release_date' in item ? item.release_date : item.first_air_date
  const type = mediaType ?? (('title' in item) ? 'movie' : 'tv')
  const href = type === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`
  const watchHref = type === 'movie' ? `/watch/movie/${item.id}` : `/watch/tv/${item.id}/1/1`
  const backdropUrl = buildBackdropUrl(item.backdrop_path, 'original')
  const trailer = item.videos?.results ? getTrailer(item.videos.results) : null
  const year = date ? new Date(date).getFullYear() : null

  const goTo = useCallback((index: number) => {
    if (isTransitioning) return
    setIsTransitioning(true)
    setShowTrailer(false)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 300)
  }, [isTransitioning])

  const goPrev = () => goTo((currentIndex - 1 + items.length) % items.length)
  const goNext = () => goTo((currentIndex + 1) % items.length)

  // Auto-advance
  useEffect(() => {
    if (!autoPlay || items.length <= 1) return
    const timer = setInterval(goNext, interval)
    return () => clearInterval(timer)
  }, [currentIndex, autoPlay, interval, items.length])

  // Show trailer after 3 seconds
  useEffect(() => {
    if (!trailer) return
    const timer = setTimeout(() => setShowTrailer(true), 3000)
    return () => clearTimeout(timer)
  }, [currentIndex, trailer])

  return (
    <section className="relative h-[90vh] min-h-[600px] overflow-hidden">
      {/* Background */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="absolute inset-0"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          {/* YouTube trailer iframe */}
          {showTrailer && trailer && (
            <iframe
              className="absolute inset-0 w-full h-full pointer-events-none"
              style={{ transform: 'scale(1.15)' }}
              src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&mute=${muted ? 1 : 0}&controls=0&loop=1&playlist=${trailer.key}&modestbranding=1&rel=0&iv_load_policy=3&disablekb=1`}
              allow="autoplay; encrypted-media"
              title="Trailer"
            />
          )}

          {/* Backdrop image */}
          {backdropUrl && (
            <Image
              src={backdropUrl}
              alt={title ?? ''}
              fill
              className={`object-cover object-top transition-opacity duration-1000 ${showTrailer ? 'opacity-0' : 'opacity-100'}`}
              priority
              sizes="100vw"
            />
          )}

          {/* Gradient overlays */}
          <div className="absolute inset-0 hero-overlay" />
          <div className="absolute bottom-0 left-0 right-0 h-48 hero-bottom-fade" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-black/20" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 flex h-full items-end pb-28">
        <div className="mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="max-w-2xl"
            >
              {/* Badges */}
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-flex items-center gap-1 rounded-md bg-primary/20 border border-primary/30 px-2 py-0.5 text-xs font-bold text-primary uppercase tracking-wide">
                  {type === 'movie' ? '🎬 Movie' : '📺 Series'}
                </span>
                {item.vote_average > 0 && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-yellow-500/20 border border-yellow-500/30 px-2 py-0.5 text-xs font-bold text-yellow-400">
                    <Star className="h-2.5 w-2.5 fill-current" />
                    {formatVoteAverage(item.vote_average)}
                  </span>
                )}
                {year && (
                  <span className="text-xs text-white/50 font-medium">{year}</span>
                )}
                {'runtime' in item && item.runtime && (
                  <span className="inline-flex items-center gap-1 text-xs text-white/50">
                    <Clock className="h-3 w-3" />
                    {formatRuntime(item.runtime)}
                  </span>
                )}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-6xl font-black text-white mb-4 leading-none tracking-tight">
                {title}
              </h1>

              {/* Genres */}
              {item.genres && item.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {item.genres.slice(0, 4).map((genre) => (
                    <span key={genre.id} className="genre-pill text-xs">
                      {genre.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Overview */}
              <p className="text-sm md:text-base text-white/70 mb-8 leading-relaxed max-w-xl">
                {truncateText(item.overview, 200)}
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-3">
                <Link href={watchHref}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="play-button text-sm px-6 py-3 shadow-xl shadow-white/10"
                  >
                    <Play className="h-4 w-4 fill-black" />
                    Watch Now
                  </motion.button>
                </Link>

                <Link href={href}>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="play-button-outline text-sm px-6 py-3"
                  >
                    <Info className="h-4 w-4" />
                    More Info
                  </motion.button>
                </Link>

                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 border border-white/20 backdrop-blur-sm hover:bg-white/20 transition-all"
                >
                  <Plus className="h-5 w-5 text-white" />
                </motion.button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-10 right-6 z-20 flex items-center gap-3">
        {/* Mute toggle */}
        {trailer && (
          <button
            onClick={() => setMuted(!muted)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
          >
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        )}

        {/* Arrow controls */}
        {items.length > 1 && (
          <>
            <button
              onClick={goPrev}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={goNext}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Dot indicators */}
      {items.length > 1 && (
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
          {items.slice(0, 8).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'w-6 bg-primary' : 'w-1.5 bg-white/30'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
