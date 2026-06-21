import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Star, Clock, Calendar, ArrowLeft } from 'lucide-react'
import { moviesApi } from '../../../../lib/api-client'
import { buildBackdropUrl, buildPosterUrl, buildProfileUrl, formatRuntime, formatDate, formatVoteAverage, formatCurrency, getTrailer, ratingToColor } from '../../../../lib/utils'
import { MediaRow } from '../../../../components/media/media-row'
import { WatchlistButton } from '../../../../components/media/watchlist-button'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  try {
    const movie = await moviesApi.getDetails(Number(id))
    return {
      title: movie.title,
      description: movie.overview ?? undefined,
      openGraph: {
        title: movie.title,
        description: movie.overview ?? undefined,
        images: movie.backdrop_path
          ? [{ url: buildBackdropUrl(movie.backdrop_path, 'w780') ?? '' }]
          : undefined,
      },
    }
  } catch {
    return { title: 'Movie Not Found' }
  }
}

export default async function MoviePage({ params }: PageProps) {
  const { id } = await params

  let movie
  try {
    movie = await moviesApi.getDetails(Number(id))
  } catch {
    notFound()
  }

  const trailer = movie.videos?.results ? getTrailer(movie.videos.results) : null
  const cast = movie.credits?.cast.slice(0, 12) ?? []
  const director = movie.credits?.crew.find((c) => c.job === 'Director')
  const backdropUrl = buildBackdropUrl(movie.backdrop_path, 'original')
  const posterUrl = buildPosterUrl(movie.poster_path, 'w500')
  const ratingColor = ratingToColor(movie.vote_average)

  return (
    <div className="min-h-screen">
      {/* Hero Backdrop */}
      <div className="relative h-[70vh] overflow-hidden">
        {backdropUrl && (
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            className="object-cover object-top"
            priority
            sizes="100vw"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />

        {/* Back button */}
        <div className="absolute top-24 left-6 z-10">
          <Link
            href="/movies"
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-white/70 hover:text-white hover:bg-white/20 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="relative -mt-[30vh] z-10 mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8 pb-20">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Poster */}
          <div className="flex-shrink-0 w-48 md:w-64 mx-auto lg:mx-0">
            <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              {posterUrl ? (
                <Image src={posterUrl} alt={movie.title} fill className="object-cover" sizes="256px" />
              ) : (
                <div className="h-full w-full bg-muted flex items-center justify-center text-6xl">🎬</div>
              )}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h1 className="text-3xl md:text-5xl font-black text-white mb-2 leading-tight">
              {movie.title}
            </h1>
            {movie.tagline && (
              <p className="text-lg text-white/40 italic mb-4">&ldquo;{movie.tagline}&rdquo;</p>
            )}

            {/* Meta badges */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <span className={`flex items-center gap-1.5 text-lg font-black ${ratingColor}`}>
                <Star className="h-5 w-5 fill-current" />
                {formatVoteAverage(movie.vote_average)}
                <span className="text-xs font-normal text-white/30">
                  ({movie.vote_count.toLocaleString()})
                </span>
              </span>

              <span className="flex items-center gap-1 text-sm text-white/50">
                <Calendar className="h-4 w-4" />
                {formatDate(movie.release_date)}
              </span>

              {movie.runtime && (
                <span className="flex items-center gap-1 text-sm text-white/50">
                  <Clock className="h-4 w-4" />
                  {formatRuntime(movie.runtime)}
                </span>
              )}

              <span className="px-2 py-0.5 rounded border border-white/20 text-xs text-white/50 uppercase">
                {movie.original_language}
              </span>

              {movie.status && (
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                  movie.status === 'Released'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                    : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                }`}>
                  {movie.status}
                </span>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/movies?genre=${genre.id}`}
                  className="genre-pill"
                >
                  {genre.name}
                </Link>
              ))}
            </div>

            {/* Overview */}
            <p className="text-base text-white/70 leading-relaxed mb-8 max-w-2xl">
              {movie.overview}
            </p>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Link href={`/watch/movie/${movie.id}`}>
                <button className="play-button px-8 py-3 text-base shadow-xl shadow-primary/20">
                  <Play className="h-5 w-5 fill-black" />
                  Watch Now
                </button>
              </Link>

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

              <WatchlistButton tmdbId={movie.id} mediaType="movie" />
            </div>

            {/* Details grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {director && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Director</p>
                  <p className="text-sm font-medium text-white">{director.name}</p>
                </div>
              )}
              {movie.budget > 0 && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Budget</p>
                  <p className="text-sm font-medium text-white">{formatCurrency(movie.budget)}</p>
                </div>
              )}
              {movie.revenue > 0 && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Revenue</p>
                  <p className="text-sm font-medium text-white">{formatCurrency(movie.revenue)}</p>
                </div>
              )}
              {movie.production_countries.length > 0 && (
                <div>
                  <p className="text-xs text-white/30 uppercase tracking-wider mb-1">Country</p>
                  <p className="text-sm font-medium text-white">
                    {movie.production_countries.map((c) => c.name).join(', ')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

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
        {movie.recommendations?.results?.length > 0 && (
          <div className="mt-16">
            <MediaRow
              title="More Like This"
              items={movie.recommendations.results}
              mediaType="movie"
            />
          </div>
        )}
      </div>
    </div>
  )
}
