import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Star, Calendar, ArrowLeft, Tv } from 'lucide-react'
import { tvApi } from '../../../../lib/api-client'
import { buildBackdropUrl, buildPosterUrl, buildProfileUrl, formatDate, formatVoteAverage, getTrailer, ratingToColor } from '../../../../lib/utils'
import { MediaRow } from '../../../../components/media/media-row'
import { TVSeasonAccordion } from '../../../../components/media/tv-season-accordion'
import { WatchlistButton } from '../../../../components/media/watchlist-button'

export const revalidate = 3600 // cache each TV page for 1 hour

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  try {
    const show = await tvApi.getDetails(Number(id))
    return {
      title: show.name,
      description: show.overview,
      openGraph: {
        title: show.name,
        description: show.overview,
        images: show.backdrop_path
          ? [{ url: buildBackdropUrl(show.backdrop_path, 'w780') ?? '' }]
          : undefined,
      },
    }
  } catch {
    return { title: 'TV Show Not Found' }
  }
}

export default async function TVPage({ params }: PageProps) {
  const { id } = await params

  let show
  try {
    show = await tvApi.getDetails(Number(id))
  } catch {
    notFound()
  }

  const trailer = show.videos?.results ? getTrailer(show.videos.results) : null
  const cast = show.credits?.cast.slice(0, 12) ?? []
  const backdropUrl = buildBackdropUrl(show.backdrop_path, 'original')
  const posterUrl = buildPosterUrl(show.poster_path, 'w500')
  const ratingColor = ratingToColor(show.vote_average)

  // First season to watch (skip specials)
  const firstSeason = show.seasons?.find((s) => s.season_number > 0)

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative h-[70vh] overflow-hidden">
        {backdropUrl && (
          <Image src={backdropUrl} alt={show.name} fill className="object-cover object-top" priority sizes="100vw" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        <div className="absolute top-24 left-6 z-10">
          <Link
            href="/tv"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-white/70 hover:text-white hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </Link>
        </div>
      </div>

      <div className="relative -mt-[30vh] z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 w-48 md:w-64 mx-auto lg:mx-0">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              {posterUrl ? (
                <Image src={posterUrl} alt={show.name} fill className="object-cover" sizes="256px" />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center text-6xl">📺</div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">
              {show.name}
            </h1>
            {show.tagline && (
              <p className="text-lg text-white/40 italic mb-4">&ldquo;{show.tagline}&rdquo;</p>
            )}

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={`flex items-center gap-1.5 text-lg font-black ${ratingColor}`}>
                <Star className="h-5 w-5 fill-current" />
                {formatVoteAverage(show.vote_average)}
                <span className="text-xs font-normal text-white/30">
                  ({show.vote_count.toLocaleString()})
                </span>
              </span>

              <span className="flex items-center gap-1 text-sm text-white/50">
                <Calendar className="h-4 w-4" />
                {formatDate(show.first_air_date)}
              </span>

              <span className="flex items-center gap-1 text-sm text-white/50">
                <Tv className="h-4 w-4" />
                {show.number_of_seasons} Season{show.number_of_seasons !== 1 ? 's' : ''}
              </span>

              <span className="text-sm text-white/50">
                {show.number_of_episodes} Episodes
              </span>

              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                show.status === 'Returning Series'
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                  : show.status === 'Ended'
                  ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {show.status}
              </span>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {show.genres.map((genre) => (
                <Link key={genre.id} href={`/tv?genre=${genre.id}`} className="genre-pill">
                  {genre.name}
                </Link>
              ))}
            </div>

            <p className="text-base text-white/70 leading-relaxed mb-8 max-w-2xl">
              {show.overview}
            </p>

            <div className="flex flex-wrap items-center gap-3 mb-8">
              {firstSeason && (
                <Link href={`/watch/tv/${show.id}/1/1`}>
                  <button className="play-button px-8 py-3 text-base shadow-xl shadow-primary/20">
                    <Play className="h-5 w-5 fill-black" />
                    Watch S1 E1
                  </button>
                </Link>
              )}

              {trailer && (
                <a
                  href={`https://youtube.com/watch?v=${trailer.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="play-button-outline px-6 py-3"
                >
                  ▶ Trailer
                </a>
              )}

              <WatchlistButton tmdbId={show.id} mediaType="tv" />
            </div>

            {/* Show info */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {show.created_by.length > 0 && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Created By</p>
                  <p className="text-sm font-medium text-white">
                    {show.created_by.map((c) => c.name).join(', ')}
                  </p>
                </div>
              )}
              {show.networks.length > 0 && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Network</p>
                  <p className="text-sm font-medium text-white">
                    {show.networks.map((n) => n.name).join(', ')}
                  </p>
                </div>
              )}
              {show.type && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Type</p>
                  <p className="text-sm font-medium text-white">{show.type}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Seasons & Episodes */}
        {show.seasons && show.seasons.filter((s) => s.season_number > 0).length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold text-white mb-6">Seasons & Episodes</h2>
            <TVSeasonAccordion
              tvId={show.id}
              seasons={show.seasons.filter((s) => s.season_number > 0)}
            />
          </section>
        )}

        {/* Cast */}
        {cast.length > 0 && (
          <section className="mt-16">
            <h2 className="text-xl font-bold text-white mb-6">Cast</h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-12 gap-4">
              {cast.map((member) => {
                const profile = buildProfileUrl(member.profile_path, 'w185')
                return (
                  <div key={member.id} className="text-center group cursor-pointer">
                    <div className="relative mb-2 mx-auto h-16 w-16 overflow-hidden rounded-full bg-muted ring-2 ring-transparent group-hover:ring-primary/50 transition-all">
                      {profile ? (
                        <Image src={profile} alt={member.name} fill className="object-cover" sizes="64px" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-2xl">👤</div>
                      )}
                    </div>
                    <p className="text-xs font-medium text-white truncate">{member.name}</p>
                    <p className="text-[10px] text-white/40 truncate">{member.character}</p>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Recommendations */}
        {show.recommendations?.results?.length > 0 && (
          <div className="mt-16">
            <MediaRow title="More Like This" items={show.recommendations.results} mediaType="tv" />
          </div>
        )}
      </div>
    </div>
  )
}
