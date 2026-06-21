'use client'

import { use, useState, useRef, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  List,
  Star,
  Maximize2,
  Play,
} from 'lucide-react'
import Image from 'next/image'
import { VideoPlayer } from '../../../../../../../components/player/video-player'
import { tvApi, providerApi } from '../../../../../../../lib/api-client'
import { buildPosterUrl, buildProfileUrl, formatVoteAverage } from '../../../../../../../lib/utils'
import { usePlayerStore } from '../../../../../../../store/player-store'
import { cn } from '../../../../../../../lib/utils'

interface PageProps {
  params: Promise<{ id: string; season: string; episode: string }>
}

export default function WatchTVPage({ params }: PageProps) {
  const { id, season, episode } = use(params)
  const tmdbId = Number(id)
  const seasonNum = Number(season)
  const episodeNum = Number(episode)

  const router = useRouter()
  const { accentColor, autoPlayNext } = usePlayerStore()
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showEpisodeList, setShowEpisodeList] = useState(false)
  const playerContainerRef = useRef<HTMLDivElement>(null)

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await playerContainerRef.current?.requestFullscreen()
    } else {
      await document.exitFullscreen()
    }
  }, [])

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  const { data: show } = useQuery({
    queryKey: ['tv-details', tmdbId],
    queryFn: () => tvApi.getDetails(tmdbId),
    staleTime: 1000 * 60 * 30,
  })

  const { data: seasonData } = useQuery({
    queryKey: ['tv-season', tmdbId, seasonNum],
    queryFn: () => tvApi.getSeason(tmdbId, seasonNum),
    staleTime: 1000 * 60 * 30,
  })

  const { data: providerData } = useQuery({
    queryKey: ['provider-tv', tmdbId, seasonNum, episodeNum, accentColor],
    queryFn: () => providerApi.getTvUrl(tmdbId, seasonNum, episodeNum, {
      color: accentColor,
      autoPlay: true,
    }),
    staleTime: Infinity,
  })

  const currentEpisode = seasonData?.episodes?.find(
    (e) => e.episode_number === episodeNum
  )

  const nextEpisode = seasonData?.episodes?.find(
    (e) => e.episode_number === episodeNum + 1
  )

  const goToEpisode = (s: number, e: number) => {
    router.push(`/watch/tv/${tmdbId}/${s}/${e}`)
  }

  const goToPrev = () => {
    if (episodeNum > 1) {
      goToEpisode(seasonNum, episodeNum - 1)
    } else if (seasonNum > 1) {
      goToEpisode(seasonNum - 1, 1)
    }
  }

  const goToNext = () => {
    if (nextEpisode) {
      goToEpisode(seasonNum, episodeNum + 1)
    } else if (show && seasonNum < show.number_of_seasons) {
      goToEpisode(seasonNum + 1, 1)
    }
  }

  const seasons = show?.seasons?.filter((s) => s.season_number > 0) ?? []

  if (!providerData?.embedUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-16 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-background/80 backdrop-blur-xl border-b border-white/5"
      >
        <div className="flex items-center gap-3 min-w-0">
          <Link
            href={`/tv/${tmdbId}`}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors flex-shrink-0"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          {show && (
            <div className="min-w-0">
              <span className="text-sm font-medium text-white truncate block">{show.name}</span>
              <span className="text-xs text-white/40">
                S{seasonNum} E{episodeNum}
                {currentEpisode && ` · ${currentEpisode.name}`}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowEpisodeList(!showEpisodeList)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all border',
              showEpisodeList
                ? 'bg-primary/20 text-primary border-primary/30'
                : 'text-white/60 hover:text-white bg-white/5 border-white/10 hover:bg-white/10'
            )}
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Episodes</span>
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      <div className="flex flex-col lg:flex-row">
        {/* Player */}
        <div ref={playerContainerRef} className="flex-1 min-w-0 bg-black">
          <VideoPlayer
            embedUrl={providerData.embedUrl}
            providers={providerData.providers}
            tmdbId={tmdbId}
            mediaType="tv"
            season={seasonNum}
            episode={episodeNum}
            title={`${show?.name ?? ''} - S${seasonNum} E${episodeNum}`}
            className={isFullscreen ? 'h-screen' : 'aspect-video'}
          />
        </div>

        {/* Episode sidebar */}
        {showEpisodeList && (
          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-full lg:w-80 xl:w-96 flex-shrink-0 border-l border-white/10 bg-background/50 backdrop-blur-xl max-h-[calc(100vh-8rem)] overflow-y-auto"
          >
            {/* Season selector */}
            <div className="p-4 border-b border-white/10 sticky top-0 bg-background/90 backdrop-blur-xl z-10">
              <select
                className="w-full bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary"
                value={seasonNum}
                onChange={(e) => goToEpisode(Number(e.target.value), 1)}
              >
                {seasons.map((s) => (
                  <option key={s.id} value={s.season_number} className="bg-background">
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Episodes list */}
            <div className="p-2">
              {seasonData?.episodes?.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => goToEpisode(seasonNum, ep.episode_number)}
                  className={cn(
                    'w-full flex gap-3 rounded-lg p-2 text-left transition-all mb-1',
                    ep.episode_number === episodeNum
                      ? 'bg-primary/20 border border-primary/30'
                      : 'hover:bg-white/10 border border-transparent'
                  )}
                >
                  {/* Still */}
                  <div className="relative h-14 w-24 flex-shrink-0 rounded overflow-hidden bg-muted">
                    {ep.still_path ? (
                      <Image
                        src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                        alt={ep.name}
                        fill
                        className="object-cover"
                        sizes="96px"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-xl">📺</div>
                    )}
                    {ep.episode_number === episodeNum && (
                      <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                        <Play className="h-4 w-4 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0 py-0.5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[10px] font-bold text-white/40">E{ep.episode_number}</span>
                      <p className="text-xs font-medium text-white truncate">{ep.name}</p>
                    </div>
                    <p className="text-[10px] text-white/40 line-clamp-2">{ep.overview}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.aside>
        )}
      </div>

      {/* Bottom controls */}
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-6">
          {/* Episode info */}
          {currentEpisode && (
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white mb-1">
                E{currentEpisode.episode_number}: {currentEpisode.name}
              </h2>
              {currentEpisode.vote_average > 0 && (
                <div className="flex items-center gap-1 text-sm text-yellow-400 mb-3">
                  <Star className="h-4 w-4 fill-current" />
                  <span className="font-bold">{formatVoteAverage(currentEpisode.vote_average)}</span>
                </div>
              )}
              <p className="text-sm text-white/60 leading-relaxed max-w-2xl">
                {currentEpisode.overview}
              </p>
            </div>
          )}

          {/* Prev/Next navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={goToPrev}
              disabled={seasonNum === 1 && episodeNum === 1}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white/70 border border-white/10 hover:bg-white/20 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous Episode
            </button>

            {nextEpisode ? (
              <button
                onClick={goToNext}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Next Episode
                <ChevronRight className="h-4 w-4" />
              </button>
            ) : (
              show && seasonNum < show.number_of_seasons && (
                <button
                  onClick={goToNext}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold bg-primary text-white hover:bg-primary/90 transition-all"
                >
                  Next Season
                  <ChevronRight className="h-4 w-4" />
                </button>
              )
            )}
          </div>
        </div>
    </div>
  )
}
