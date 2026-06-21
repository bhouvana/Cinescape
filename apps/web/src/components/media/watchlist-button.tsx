'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, Loader2 } from 'lucide-react'
import { useWatchlist } from '../../hooks/use-watchlist'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { cn } from '../../lib/utils'

interface WatchlistButtonProps {
  tmdbId: number
  mediaType: 'movie' | 'tv'
  size?: 'sm' | 'md'
  className?: string
}

export function WatchlistButton({ tmdbId, mediaType, size = 'md', className }: WatchlistButtonProps) {
  const { isSignedIn } = useAuth()
  const { isInWatchlist, toggle, isMutating } = useWatchlist()
  const inList = isInWatchlist(tmdbId, mediaType)

  if (!isSignedIn) {
    return (
      <Link
        href="/sign-in"
        title="Sign in to add to My List"
        className={cn(
          'flex items-center justify-center rounded-full bg-white/10 border border-white/20 hover:bg-white/20 transition-all',
          size === 'md' ? 'h-12 w-12' : 'h-9 w-9',
          className
        )}
      >
        <Plus className={cn('text-white', size === 'md' ? 'h-5 w-5' : 'h-4 w-4')} />
      </Link>
    )
  }

  return (
    <motion.button
      onClick={() => toggle(tmdbId, mediaType)}
      disabled={isMutating}
      whileTap={{ scale: 0.88 }}
      whileHover={{ scale: 1.05 }}
      title={inList ? 'Remove from My List' : 'Add to My List'}
      className={cn(
        'flex items-center justify-center rounded-full border transition-colors',
        inList
          ? 'bg-primary/20 border-primary/50 hover:bg-primary/30'
          : 'bg-white/10 border-white/20 hover:bg-white/20',
        size === 'md' ? 'h-12 w-12' : 'h-9 w-9',
        isMutating && 'pointer-events-none',
        className
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isMutating ? (
          <motion.span
            key="loading"
            initial={{ opacity: 0, rotate: -90 }}
            animate={{ opacity: 1, rotate: 0 }}
            exit={{ opacity: 0 }}
          >
            <Loader2
              className={cn('animate-spin text-white/60', size === 'md' ? 'h-5 w-5' : 'h-4 w-4')}
            />
          </motion.span>
        ) : inList ? (
          <motion.span
            key="check"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Check className={cn('text-primary', size === 'md' ? 'h-5 w-5' : 'h-4 w-4')} />
          </motion.span>
        ) : (
          <motion.span
            key="plus"
            initial={{ opacity: 0, scale: 0.4 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
          >
            <Plus className={cn('text-white', size === 'md' ? 'h-5 w-5' : 'h-4 w-4')} />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
