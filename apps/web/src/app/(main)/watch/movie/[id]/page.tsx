'use client'

import { use, useState, useRef, useCallback, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Info,
  Plus,
  Share2,
  Maximize2,
  Star,
} from 'lucide-react'
import { VideoPlayer } from '../../../../../components/player/video-player'
import { MediaRow } from '../../../../../components/media/media-row'
import { moviesApi, providerApi } from '../../../../../lib/api-client'
import { buildBackdropUrl, buildPosterUrl, formatRuntime, formatVoteAverage } from '../../../../../lib/utils'
import { usePlayerStore } from '../../../../../store/player-store'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function WatchMoviePage({ params }: PageProps) {
  const { id } = use(params)
  const tmdbId = Number(id)
  const [isFullscreen, setIsFullscreen] = useState(false)
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

  const { accentColor } = usePlayerStore()

  const { data: movie } = useQuery({
    queryKey: ['movie-details', tmdbId],
    queryFn: () => moviesApi.getDetails(tmdbId),
    staleTime: 1000 * 60 * 30,
  })

  const { data: providerData } = useQuery({
    queryKey: ['provider-movie', tmdbId, accentColor],
    queryFn: () => providerApi.getMovieUrl(tmdbId, {
      color: accentColor,
      autoPlay: true,
    }),
    staleTime: Infinity,
  })

  if (!providerData?.embedUrl) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  const backdropUrl = buildBackdropUrl(movie?.backdrop_path, 'w780')
  const posterUrl = buildPosterUrl(movie?.poster_path, 'w342')

  return (
    <div className="min-h-screen bg-background pt-16">
      {/* Top bar */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-16 left-0 right-0 z-30 flex items-center justify-between px-4 sm:px-6 py-3 bg-background/80 backdrop-blur-xl border-b border-white/5"
      >
        <div className="flex items-center gap-3">
          <Link
            href={`/movie/${tmdbId}`}
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
          {movie && (
            <span className="text-sm font-medium text-white truncate max-w-xs">
              {movie.title}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-white/50 hover:text-white hover:bg-white/10 transition-all"
            title="Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Player */}
      <div ref={playerContainerRef} className="relative w-full bg-black">
        <VideoPlayer
          embedUrl={providerData.embedUrl}
          providers={providerData.providers}
          tmdbId={tmdbId}
          mediaType="movie"
          title={movie?.title}
          className={isFullscreen ? 'h-screen' : 'aspect-video'}
        />
      </div>

      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {movie && (
              <>
                <div className="flex items-start justify-between gap-4 mb-6">
                  <div className="flex-1 min-w-0">
                    <h1 className="text-2xl md:text-3xl font-black text-white mb-2">
                      {movie.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-white/50">
                      {movie.release_date && (
                        <span>{new Date(movie.release_date).getFullYear()}</span>
                      )}
                      {movie.runtime && <span>{formatRuntime(movie.runtime)}</span>}
                      {movie.vote_average > 0 && (
                        <span className="flex items-center gap-1 text-yellow-400 font-bold">
                          <Star className="h-3.5 w-3.5 fill-current" />
                          {formatVoteAverage(movie.vote_average)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-white/60 bg-white/5 hover:bg-white/10 hover:text-white border border-white/10 transition-all">
                      <Plus className="h-4 w-4" /> Watchlist
                    </button>
                    <button className="p-2 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-all border border-white/10">
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Overview */}
                <p className="text-sm text-white/60 leading-relaxed mb-6 max-w-2xl">
                  {movie.overview}
                </p>

                {/* Genres */}
                <div className="flex flex-wrap gap-2 mb-8">
                  {movie.genres.map((g) => (
                    <span key={g.id} className="genre-pill text-xs">{g.name}</span>
                  ))}
                </div>
              </>
            )}

            {/* Recommendations */}
            {movie?.recommendations?.results?.length > 0 && (
              <MediaRow
                title="More Like This"
                items={movie.recommendations.results}
                mediaType="movie"
              />
            )}
          </div>

          {/* Sidebar poster */}
          {movie && posterUrl && (
            <div className="hidden xl:block w-48 flex-shrink-0">
              <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-xl">
                <Image src={posterUrl} alt={movie.title} fill className="object-cover" sizes="192px" />
              </div>
              <Link
                href={`/movie/${tmdbId}`}
                className="flex items-center justify-center gap-2 mt-3 px-4 py-2 rounded-lg text-sm text-white/60 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                <Info className="h-4 w-4" /> Details
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
