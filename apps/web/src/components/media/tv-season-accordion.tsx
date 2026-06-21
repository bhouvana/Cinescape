'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Play } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { tvApi } from '../../lib/api-client'
import { buildPosterUrl } from '../../lib/utils'
import type { TMDBSeason } from '@watchblitz/types'

interface TVSeasonAccordionProps {
  tvId: number
  seasons: TMDBSeason[]
}

export function TVSeasonAccordion({ tvId, seasons }: TVSeasonAccordionProps) {
  const [openSeason, setOpenSeason] = useState<number | null>(seasons[0]?.season_number ?? null)

  return (
    <div className="space-y-2">
      {seasons.map((season) => (
        <SeasonItem
          key={season.id}
          tvId={tvId}
          season={season}
          isOpen={openSeason === season.season_number}
          onToggle={() =>
            setOpenSeason(openSeason === season.season_number ? null : season.season_number)
          }
        />
      ))}
    </div>
  )
}

function SeasonItem({
  tvId,
  season,
  isOpen,
  onToggle,
}: {
  tvId: number
  season: TMDBSeason
  isOpen: boolean
  onToggle: () => void
}) {
  const { data: details, isLoading } = useQuery({
    queryKey: ['tv', tvId, 'season', season.season_number],
    queryFn: () => tvApi.getSeason(tvId, season.season_number),
    enabled: isOpen,
    staleTime: 1000 * 60 * 30,
  })

  const posterUrl = buildPosterUrl(season.poster_path, 'w185')

  return (
    <div className="rounded-xl border border-white/10 overflow-hidden bg-white/5 backdrop-blur-sm">
      {/* Season header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-white/5 transition-colors"
      >
        {/* Mini poster */}
        <div className="relative h-14 w-10 flex-shrink-0 rounded overflow-hidden bg-muted">
          {posterUrl ? (
            <Image src={posterUrl} alt={season.name} fill className="object-cover" sizes="40px" />
          ) : (
            <div className="h-full w-full flex items-center justify-center text-lg">📺</div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-bold text-white">{season.name}</p>
          <p className="text-sm text-white/40">
            {season.episode_count} Episodes
            {season.air_date && ` · ${new Date(season.air_date).getFullYear()}`}
          </p>
        </div>

        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-5 w-5 text-white/40" />
        </motion.div>
      </button>

      {/* Episodes */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 p-4 space-y-2">
              {isLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-16 w-28 shimmer rounded flex-shrink-0" />
                      <div className="flex-1 space-y-2 py-1">
                        <div className="shimmer h-3 w-2/3 rounded" />
                        <div className="shimmer h-2 w-full rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                details?.episodes?.map((episode) => (
                  <Link
                    key={episode.id}
                    href={`/watch/tv/${tvId}/${season.season_number}/${episode.episode_number}`}
                    className="flex gap-3 rounded-lg p-2 hover:bg-white/10 transition-colors group"
                  >
                    {/* Episode still */}
                    <div className="relative h-16 w-28 flex-shrink-0 rounded overflow-hidden bg-muted">
                      {episode.still_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w300${episode.still_path}`}
                          alt={episode.name}
                          fill
                          className="object-cover"
                          sizes="112px"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-2xl bg-muted/50">📺</div>
                      )}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Play className="h-6 w-6 text-white fill-white" />
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-white/40">
                          E{episode.episode_number}
                        </span>
                        <p className="text-sm font-medium text-white truncate">{episode.name}</p>
                      </div>
                      <p className="text-xs text-white/40 line-clamp-2">{episode.overview}</p>
                      {episode.runtime && (
                        <p className="text-xs text-white/30 mt-1">{episode.runtime}m</p>
                      )}
                    </div>

                    {episode.vote_average > 0 && (
                      <div className="flex-shrink-0 text-xs font-bold text-yellow-400 py-1">
                        ★ {episode.vote_average.toFixed(1)}
                      </div>
                    )}
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
