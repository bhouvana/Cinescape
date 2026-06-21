'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { WatchProgress } from '@watchblitz/types'

interface PlayerState {
  progress: Record<string, WatchProgress>
  accentColor: string
  theaterMode: boolean
  autoPlayNext: boolean
  currentMedia: {
    tmdbId: number
    mediaType: 'movie' | 'tv'
    season?: number
    episode?: number
    title?: string
  } | null

  setProgress: (key: string, progress: WatchProgress) => void
  getProgress: (tmdbId: number, mediaType: 'movie' | 'tv', season?: number, episode?: number) => WatchProgress | null
  clearProgress: (key: string) => void
  setAccentColor: (color: string) => void
  setTheaterMode: (enabled: boolean) => void
  setAutoPlayNext: (enabled: boolean) => void
  setCurrentMedia: (media: PlayerState['currentMedia']) => void
}

function buildProgressKey(
  tmdbId: number,
  mediaType: 'movie' | 'tv',
  season?: number,
  episode?: number
): string {
  if (mediaType === 'tv' && season && episode) {
    return `${mediaType}:${tmdbId}:${season}:${episode}`
  }
  return `${mediaType}:${tmdbId}`
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      progress: {},
      accentColor: 'e50914',
      theaterMode: false,
      autoPlayNext: true,
      currentMedia: null,

      setProgress: (key, progress) =>
        set((state) => ({ progress: { ...state.progress, [key]: progress } })),

      getProgress: (tmdbId, mediaType, season, episode) => {
        const key = buildProgressKey(tmdbId, mediaType, season, episode)
        return get().progress[key] ?? null
      },

      clearProgress: (key) =>
        set((state) => {
          const { [key]: _, ...rest } = state.progress
          return { progress: rest }
        }),

      setAccentColor: (accentColor) => set({ accentColor }),
      setTheaterMode: (theaterMode) => set({ theaterMode }),
      setAutoPlayNext: (autoPlayNext) => set({ autoPlayNext }),
      setCurrentMedia: (currentMedia) => set({ currentMedia }),
    }),
    {
      name: 'watchblitz-player',
      partialize: (state) => ({
        progress: state.progress,
        accentColor: state.accentColor,
        autoPlayNext: state.autoPlayNext,
      }),
    }
  )
)
