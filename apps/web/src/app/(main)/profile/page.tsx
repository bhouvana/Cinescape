'use client'

import { useQuery } from '@tanstack/react-query'
import { useAuth, useUser } from '@clerk/nextjs'
import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import {
  Film,
  Tv,
  Clock,
  Star,
  Heart,
  Bookmark,
  Settings,
  TrendingUp,
} from 'lucide-react'
import { userApi, watchHistoryApi } from '../../../lib/api-client'

export default function ProfilePage() {
  const { getToken } = useAuth()
  const { user } = useUser()

  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) return null
      return userApi.getStats(token)
    },
  })

  const { data: continueWatching } = useQuery({
    queryKey: ['continue-watching'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) return []
      return watchHistoryApi.getContinueWatching(token)
    },
  })

  const statCards = [
    {
      icon: Clock,
      label: 'Watch Time',
      value: stats ? fmtWatchTime(stats.totalWatchTime) : '—',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      icon: Film,
      label: 'Movies',
      value: stats?.moviesWatched?.toString() ?? '—',
      color: 'text-purple-400',
      bg: 'bg-purple-500/10 border-purple-500/20',
    },
    {
      icon: Tv,
      label: 'TV Episodes',
      value: stats?.showsWatched?.toString() ?? '—',
      color: 'text-green-400',
      bg: 'bg-green-500/10 border-green-500/20',
    },
    {
      icon: Heart,
      label: 'Favorites',
      value: stats?.favorites?.toString() ?? '—',
      color: 'text-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
    },
  ]

  const quickLinks = [
    { href: '/watchlist', icon: Bookmark, label: 'My Watchlist' },
    { href: '/settings', icon: Settings, label: 'Settings' },
  ]

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="mx-auto max-w-[1400px] px-4 sm:px-6 lg:px-8">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <div className="relative h-40 rounded-2xl overflow-hidden bg-gradient-to-r from-primary/30 via-purple-500/20 to-blue-500/30 mb-6">
            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4 -mt-16 px-6">
            <div className="relative">
              {user?.imageUrl ? (
                <Image
                  src={user.imageUrl}
                  alt={user.fullName ?? 'User'}
                  width={96}
                  height={96}
                  className="rounded-2xl ring-4 ring-background object-cover w-24 h-24"
                />
              ) : (
                <div className="w-24 h-24 rounded-2xl ring-4 ring-background bg-primary/20 flex items-center justify-center text-3xl">
                  👤
                </div>
              )}
            </div>

            <div className="flex-1">
              <h1 className="text-2xl font-black text-white">
                {user?.fullName ?? user?.username ?? 'Anonymous'}
              </h1>
              <p className="text-sm text-white/40">{user?.primaryEmailAddress?.emailAddress}</p>
            </div>

            <div className="flex gap-2">
              {quickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-white/10 border border-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              className={`rounded-2xl border p-6 ${stat.bg}`}
            >
              <stat.icon className={`h-6 w-6 ${stat.color} mb-3`} />
              <div className="text-2xl font-black text-white mb-1">{stat.value}</div>
              <div className="text-sm text-white/50">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Continue Watching */}
        {continueWatching && (continueWatching as unknown[]).length > 0 && (
          <section className="mb-12">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold text-white">Continue Watching</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {(continueWatching as unknown[]).map((item, i) => {
                const cwItem = item as {
                  tmdbId: number
                  mediaType: string
                  progress: number
                  season?: number
                  episode?: number
                }
                const href =
                  cwItem.mediaType === 'movie'
                    ? `/watch/movie/${cwItem.tmdbId}`
                    : `/watch/tv/${cwItem.tmdbId}/${cwItem.season ?? 1}/${cwItem.episode ?? 1}`

                return (
                  <Link key={i} href={href}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group relative aspect-poster rounded-xl overflow-hidden bg-muted cursor-pointer hover:scale-105 transition-transform duration-300"
                    >
                      {/* Progress bar */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20 z-10">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${cwItem.progress}%` }}
                        />
                      </div>
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-500/20 text-4xl">
                        {cwItem.mediaType === 'movie' ? '🎬' : '📺'}
                      </div>
                    </motion.div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Achievement badges placeholder */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <Star className="h-5 w-5 text-yellow-400" />
            <h2 className="text-xl font-bold text-white">Achievements</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[
              { emoji: '🎬', label: 'First Watch', earned: true },
              { emoji: '🔥', label: 'Binge Master', earned: (stats?.showsWatched ?? 0) >= 5 },
              { emoji: '⭐', label: 'Movie Buff', earned: (stats?.moviesWatched ?? 0) >= 10 },
              { emoji: '❤️', label: 'Favorite Fan', earned: (stats?.favorites ?? 0) >= 5 },
              { emoji: '🏆', label: 'Top Watcher', earned: (stats?.totalWatchTime ?? 0) >= 36000 },
              { emoji: '🎭', label: 'Genre Explorer', earned: false },
            ].map((badge) => (
              <div
                key={badge.label}
                className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
                  badge.earned
                    ? 'bg-yellow-500/10 border-yellow-500/30'
                    : 'bg-white/5 border-white/10 opacity-50 grayscale'
                }`}
              >
                <span className="text-3xl">{badge.emoji}</span>
                <span className="text-xs font-medium text-white/70 text-center">{badge.label}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

function fmtWatchTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
