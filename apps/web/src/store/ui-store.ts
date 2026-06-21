'use client'

import { create } from 'zustand'

interface UIState {
  searchOpen: boolean
  aiOpen: boolean
  mobileMenuOpen: boolean
  heroVideoMuted: boolean
  heroVideoPlaying: boolean

  setSearchOpen: (open: boolean) => void
  setAiOpen: (open: boolean) => void
  setMobileMenuOpen: (open: boolean) => void
  toggleHeroMute: () => void
  setHeroVideoPlaying: (playing: boolean) => void
}

export const useUIStore = create<UIState>((set) => ({
  searchOpen: false,
  aiOpen: false,
  mobileMenuOpen: false,
  heroVideoMuted: true,
  heroVideoPlaying: false,

  setSearchOpen: (searchOpen) => set({ searchOpen }),
  setAiOpen: (aiOpen) => set({ aiOpen }),
  setMobileMenuOpen: (mobileMenuOpen) => set({ mobileMenuOpen }),
  toggleHeroMute: () => set((state) => ({ heroVideoMuted: !state.heroVideoMuted })),
  setHeroVideoPlaying: (heroVideoPlaying) => set({ heroVideoPlaying }),
}))
