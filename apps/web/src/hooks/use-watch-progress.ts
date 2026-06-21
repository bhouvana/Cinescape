'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'
import { usePlayerStore } from '../store/player-store'
import { watchHistoryApi } from '../lib/api-client'
import { formatProgress } from '../lib/utils'
import type { PlayerEventData } from '@watchblitz/types'

interface UseWatchProgressOptions {
  tmdbId: number
  mediaType: 'movie' | 'tv'
  season?: number
  episode?: number
}

export function useWatchProgress({ tmdbId, mediaType, season, episode }: UseWatchProgressOptions) {
  const { getToken } = useAuth()
  const { setProgress, getProgress } = usePlayerStore()
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedRef = useRef<number>(0)

  const progressKey =
    mediaType === 'tv' && season && episode
      ? `${mediaType}:${tmdbId}:${season}:${episode}`
      : `${mediaType}:${tmdbId}`

  const savedProgress = getProgress(tmdbId, mediaType, season, episode)

  const handlePlayerEvent = useCallback(
    async (data: PlayerEventData) => {
      const { event, currentTime, duration } = data

      // Update local store immediately
      setProgress(progressKey, {
        tmdbId,
        mediaType,
        currentTime,
        duration,
        progress: formatProgress(currentTime, duration),
        season,
        episode,
        lastUpdated: Date.now(),
      })

      // Debounce API save — only every 15 seconds or on pause/end
      const shouldSaveNow = event === 'pause' || event === 'ended'
      const timeSinceLastSave = Date.now() - lastSavedRef.current

      if (shouldSaveNow || timeSinceLastSave > 15000) {
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current)

        saveTimerRef.current = setTimeout(async () => {
          try {
            const token = await getToken()
            if (token && duration > 0) {
              await watchHistoryApi.saveProgress(token, {
                tmdbId,
                mediaType,
                season,
                episode,
                currentTime,
                duration,
              })
              lastSavedRef.current = Date.now()
            }
          } catch {
            // Silently fail — we have local state
          }
        }, shouldSaveNow ? 0 : 500)
      }
    },
    [tmdbId, mediaType, season, episode, progressKey, setProgress, getToken]
  )

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [])

  return {
    savedProgress,
    handlePlayerEvent,
    initialProgress: savedProgress?.currentTime ?? 0,
  }
}
