'use client'

import Link from 'next/link'
import { useEffect } from 'react'

export default function TVError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-6xl mb-6">📺</div>
        <h2 className="text-2xl font-black text-white mb-3">Couldn&apos;t load this show</h2>
        <p className="text-white/50 text-sm mb-8">
          The TV show details couldn&apos;t be fetched right now. Please try again.
        </p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={reset}
            className="px-6 py-2.5 bg-primary text-black rounded-lg font-semibold text-sm hover:bg-primary/90 transition-colors"
          >
            Try again
          </button>
          <Link
            href="/tv"
            className="px-6 py-2.5 bg-white/10 text-white rounded-lg font-semibold text-sm hover:bg-white/20 transition-colors"
          >
            Browse TV shows
          </Link>
        </div>
      </div>
    </div>
  )
}
