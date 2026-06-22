'use client'

import { useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { MediaCard } from './media-card'
import { MediaCardSkeleton } from '../skeletons/media-card-skeleton'
import type { TMDBMovie, TMDBTVShow } from '@watchblitz/types'

type MediaItem = TMDBMovie | TMDBTVShow
type SafeMediaItem = (TMDBMovie | TMDBTVShow) & { media_type?: 'movie' | 'tv' }

interface MediaRowProps {
  title: string
  subtitle?: string
  items: MediaItem[]
  isLoading?: boolean
  mediaType?: 'movie' | 'tv'
  viewAllHref?: string
  cardSize?: 'sm' | 'md' | 'lg'
}

export function MediaRow({
  title,
  subtitle,
  items,
  isLoading,
  mediaType,
  viewAllHref,
  cardSize = 'md',
}: MediaRowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    const container = scrollRef.current
    if (!container) return
    const scrollAmount = container.clientWidth * 0.8
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <motion.section
      className="relative group/row"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4 px-4 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-xl font-bold text-white">{title}</h2>
          {subtitle && <p className="text-sm text-white/40 mt-0.5">{subtitle}</p>}
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className="flex items-center gap-1 text-sm font-medium text-white/60 hover:text-white transition-colors group"
          >
            See all
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        )}
      </div>

      {/* Scroll container */}
      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 border border-white/10 text-white shadow-2xl backdrop-blur-sm opacity-0 group-hover/row:opacity-100 hover:bg-white/20 transition-all duration-200 -translate-x-2 hover:scale-110"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>

        {/* Cards */}
        <div
          ref={scrollRef}
          className="scroll-row px-4 sm:px-6 lg:px-8"
          style={{ scrollbarWidth: 'none' }}
        >
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => (
                <MediaCardSkeleton key={i} size={cardSize} />
              ))
            : items.map((item) => (
                <MediaCard
                  key={item.id}
                  item={item as SafeMediaItem}
                  mediaType={mediaType ?? (('title' in item) ? 'movie' : 'tv')}
                  size={cardSize}
                />
              ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-background/90 border border-white/10 text-white shadow-2xl backdrop-blur-sm opacity-0 group-hover/row:opacity-100 hover:bg-white/20 transition-all duration-200 translate-x-2 hover:scale-110"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </motion.section>
  )
}
