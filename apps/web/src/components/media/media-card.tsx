'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Play, Plus, Check, Star, Calendar, Clock } from 'lucide-react'
import { cn, buildPosterUrl, buildBackdropUrl, formatVoteAverage, formatYear, formatRuntime, truncateText } from '../../lib/utils'
import { useWatchlist } from '../../hooks/use-watchlist'
import type { TMDBMovie, TMDBTVShow } from '@watchblitz/types'

type MediaItem = (TMDBMovie | TMDBTVShow) & {
  media_type?: 'movie' | 'tv'
  runtime?: number
}

interface MediaCardProps {
  item: MediaItem
  mediaType?: 'movie' | 'tv'
  layout?: 'poster' | 'backdrop' | 'horizontal'
  size?: 'sm' | 'md' | 'lg'
  showOverlay?: boolean
  priority?: boolean
}

export function MediaCard({
  item,
  mediaType,
  layout = 'poster',
  size = 'md',
  showOverlay = true,
  priority = false,
}: MediaCardProps) {
  const [imageError, setImageError] = useState(false)
  const [hovered, setHovered] = useState(false)
  const { isSignedIn, isInWatchlist, toggle } = useWatchlist()

  const resolvedType = mediaType ?? (item.media_type === 'movie' ? 'movie' : 'tv') ?? 'movie'
  const inList = isInWatchlist(item.id, resolvedType)
  const title = 'title' in item ? item.title : item.name
  const date = 'release_date' in item ? item.release_date : item.first_air_date
  const href = resolvedType === 'movie' ? `/movie/${item.id}` : `/tv/${item.id}`

  const posterUrl = imageError ? null : buildPosterUrl(item.poster_path, layout === 'poster' ? 'w342' : 'w185')
  const backdropUrl = buildBackdropUrl(item.backdrop_path, 'w780')

  const imageSrc = layout === 'backdrop' ? backdropUrl : posterUrl

  const sizeClasses = {
    sm: 'w-[140px]',
    md: 'w-[180px]',
    lg: 'w-[220px]',
  }

  return (
    <Link href={href} className="block">
      <motion.div
        className={cn(
          'media-card flex-shrink-0',
          layout === 'poster' && 'aspect-poster',
          layout === 'backdrop' && 'aspect-backdrop',
          sizeClasses[size]
        )}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        whileHover={{ scale: 1.05, zIndex: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        style={{ zIndex: hovered ? 10 : 1 }}
      >
        {/* Image */}
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-muted">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={title ?? 'Media'}
              fill
              sizes={`(max-width: 768px) 140px, ${size === 'sm' ? '140px' : size === 'md' ? '180px' : '220px'}`}
              className="object-cover transition-transform duration-500"
              style={{ transform: hovered ? 'scale(1.05)' : 'scale(1)' }}
              onError={() => setImageError(true)}
              priority={priority}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted">
              <div className="text-center p-4">
                <div className="text-4xl mb-2">🎬</div>
                <p className="text-xs text-white/40 text-center line-clamp-2">{title}</p>
              </div>
            </div>
          )}

          {/* Rating badge */}
          {item.vote_average > 0 && (
            <div className="absolute top-2 left-2 flex items-center gap-1 rounded-md bg-black/80 px-1.5 py-0.5 backdrop-blur-sm">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-white">{formatVoteAverage(item.vote_average)}</span>
            </div>
          )}

          {/* Overlay on hover */}
          {showOverlay && (
            <motion.div
              className="absolute inset-0 card-gradient"
              initial={{ opacity: 0 }}
              animate={{ opacity: hovered ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="absolute bottom-0 left-0 right-0 p-3">
                {/* Title */}
                <p className="text-xs font-bold text-white line-clamp-2 mb-1">
                  {truncateText(title ?? '', 40)}
                </p>

                {/* Meta */}
                <div className="flex items-center gap-2 text-[10px] text-white/60 mb-2">
                  {date && (
                    <span className="flex items-center gap-0.5">
                      <Calendar className="h-2.5 w-2.5" />
                      {formatYear(date)}
                    </span>
                  )}
                  {'runtime' in item && item.runtime && (
                    <span className="flex items-center gap-0.5">
                      <Clock className="h-2.5 w-2.5" />
                      {formatRuntime(item.runtime)}
                    </span>
                  )}
                </div>

                {/* Quick actions */}
                <div className="flex items-center gap-2">
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: hovered ? 1 : 0.8, opacity: hovered ? 1 : 0 }}
                    transition={{ delay: 0.05 }}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-lg"
                  >
                    <Play className="h-3.5 w-3.5 fill-black text-black ml-0.5" />
                  </motion.div>
                  {isSignedIn && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: hovered ? 1 : 0.8, opacity: hovered ? 1 : 0 }}
                      transition={{ delay: 0.08 }}
                      className={cn(
                        'flex h-8 w-8 items-center justify-center rounded-full border transition-colors',
                        inList
                          ? 'bg-primary/30 border-primary/50'
                          : 'bg-white/20 border-white/30 hover:bg-primary/20 hover:border-primary/40'
                      )}
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggle(item.id, resolvedType as 'movie' | 'tv')
                      }}
                      title={inList ? 'Remove from My List' : 'Add to My List'}
                    >
                      {inList
                        ? <Check className="h-3.5 w-3.5 text-primary" />
                        : <Plus className="h-3.5 w-3.5 text-white" />
                      }
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </Link>
  )
}
