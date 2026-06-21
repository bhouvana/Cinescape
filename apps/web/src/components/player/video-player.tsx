'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useWatchProgress } from '../../hooks/use-watch-progress'
import type { PlayerEventData } from '@watchblitz/types'
import type { ProviderEntry } from '../../lib/api-client'

interface VideoPlayerProps {
  embedUrl: string
  providers?: ProviderEntry[]
  tmdbId: number
  mediaType: 'movie' | 'tv'
  season?: number
  episode?: number
  title?: string
  className?: string
}

// How long to try each provider before auto-switching
const FALLBACK_TIMEOUT_MS = 7_000

const ALLOWED_ORIGINS = [
  'https://vidsrc.me',
  'https://www.2embed.cc',
  'https://moviesapi.club',
  'https://player.autoembed.cc',
  'https://autoembed.cc',
  'https://multiembed.mov',
]

export function VideoPlayer({
  embedUrl,
  providers,
  tmdbId,
  mediaType,
  season,
  episode,
  title,
  className = '',
}: VideoPlayerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const { handlePlayerEvent } = useWatchProgress({ tmdbId, mediaType, season, episode })

  const activeProviders: ProviderEntry[] =
    providers && providers.length > 0 ? providers : [{ id: 'default', name: 'Server 1', embedUrl }]

  const [providerIndex, setProviderIndex] = useState(0)
  const [isSwitching, setIsSwitching] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const hasPlayedRef = useRef(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const tryNextRef = useRef<(() => void) | null>(null)

  // Reset when the media itself changes
  useEffect(() => {
    setProviderIndex(0)
    setIsLoading(true)
    hasPlayedRef.current = false
    setIsSwitching(false)
  }, [tmdbId, season, episode])

  const tryNextProvider = useCallback(() => {
    setProviderIndex((prev) => {
      if (prev >= activeProviders.length - 1) {
        // All providers exhausted — reveal whatever the last iframe loaded
        setIsLoading(false)
        return prev
      }
      hasPlayedRef.current = false
      setIsLoading(true)
      setIsSwitching(true)
      setTimeout(() => setIsSwitching(false), 700)
      return prev + 1
    })
  }, [activeProviders.length])

  // Keep a stable ref so the timeout closure always calls the latest version
  useEffect(() => { tryNextRef.current = tryNextProvider }, [tryNextProvider])

  // Start fallback timer immediately whenever the provider index changes.
  // This fires even on first mount, so connection resets are caught without
  // waiting for onLoad (which may not fire at all for TCP-level failures).
  useEffect(() => {
    if (hasPlayedRef.current) return
    if (providerIndex >= activeProviders.length - 1) return

    timerRef.current = setTimeout(() => {
      if (!hasPlayedRef.current) tryNextRef.current?.()
    }, FALLBACK_TIMEOUT_MS)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [providerIndex, activeProviders.length])

  const clearFallbackTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }, [])

  // postMessage handler — only vidking.net sends these, but keep origins broad
  const handleMessage = useCallback(
    (event: MessageEvent) => {
      if (!ALLOWED_ORIGINS.includes(event.origin)) return
      try {
        let data: PlayerEventData | null = null
        if (typeof event.data === 'string') {
          const parsed = JSON.parse(event.data) as { type?: string; data?: PlayerEventData }
          if (parsed.type === 'PLAYER_EVENT' && parsed.data) data = parsed.data
        } else if (typeof event.data === 'object' && event.data !== null) {
          const msg = event.data as { type?: string; data?: PlayerEventData }
          if (msg.type === 'PLAYER_EVENT' && msg.data) data = msg.data
        }
        if (data) {
          if (data.event === 'play' || data.event === 'timeupdate') {
            hasPlayedRef.current = true
            clearFallbackTimer()
            setIsLoading(false)
          }
          handlePlayerEvent(data)
        }
      } catch { }
    },
    [handlePlayerEvent, clearFallbackTimer]
  )

  useEffect(() => {
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [handleMessage])

  const currentProvider = activeProviders[providerIndex]!

  const currentUrl = currentProvider.embedUrl

  // Once the iframe loads anything at all, the provider responded — cancel the
  // fallback timer so buffering pauses never trigger a server switch.
  // Auto-switch only fires if onLoad never comes (connection reset / DNS failure).
  const handleLoad = useCallback(() => {
    setIsLoading(false)
    clearFallbackTimer()
  }, [clearFallbackTimer])

  const isLastProvider = providerIndex >= activeProviders.length - 1

  return (
    <div className={`relative w-full bg-black ${className}`}>
      {/* Loading / switching overlay */}
      {(isLoading || isSwitching) && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 bg-black">
          <div className="h-8 w-8 rounded-full border-2 border-primary/40 border-t-primary animate-spin" />
          <p className="text-sm text-white/50">
            {isSwitching
              ? `Trying ${currentProvider.name}…`
              : isLastProvider
                ? 'Loading…'
                : `Connecting to ${currentProvider.name}…`}
          </p>
        </div>
      )}

      {/* Server pills — tap to switch manually */}
      {activeProviders.length > 1 && !isLoading && !isSwitching && (
        <div className="absolute top-2 right-2 z-10 flex gap-1">
          {activeProviders.map((p, i) => (
            <button
              key={p.id}
              onClick={() => {
                if (i === providerIndex) return
                clearFallbackTimer()
                hasPlayedRef.current = false
                setIsLoading(true)
                setIsSwitching(true)
                setTimeout(() => {
                  setProviderIndex(i)
                  setIsSwitching(false)
                }, 300)
              }}
              title={p.name}
              className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                i === providerIndex
                  ? 'bg-primary text-white shadow-lg shadow-primary/30'
                  : 'bg-black/60 text-white/40 hover:text-white/70 hover:bg-black/80'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      <iframe
        key={currentUrl}
        ref={iframeRef}
        src={currentUrl}
        title={title ?? 'WatchBlitz Player'}
        className="w-full h-full"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer"
        onLoad={handleLoad}
      />
    </div>
  )
}
