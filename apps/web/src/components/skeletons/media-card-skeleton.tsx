import { cn } from '../../lib/utils'

interface MediaCardSkeletonProps {
  size?: 'sm' | 'md' | 'lg'
  layout?: 'poster' | 'backdrop'
}

export function MediaCardSkeleton({ size = 'md', layout = 'poster' }: MediaCardSkeletonProps) {
  const sizeClasses = {
    sm: 'w-[140px]',
    md: 'w-[180px]',
    lg: 'w-[220px]',
  }

  return (
    <div
      className={cn(
        'flex-shrink-0 rounded-lg overflow-hidden',
        layout === 'poster' && 'aspect-poster',
        layout === 'backdrop' && 'aspect-backdrop',
        sizeClasses[size],
        'shimmer'
      )}
    />
  )
}

export function HeroSkeleton() {
  return (
    <div className="relative h-[85vh] bg-muted">
      <div className="shimmer absolute inset-0" />
      <div className="absolute inset-0 hero-overlay flex items-end pb-24 px-8">
        <div className="space-y-4 max-w-xl">
          <div className="shimmer h-4 w-32 rounded" />
          <div className="shimmer h-10 w-80 rounded" />
          <div className="shimmer h-4 w-64 rounded" />
          <div className="shimmer h-4 w-56 rounded" />
          <div className="flex gap-3 mt-6">
            <div className="shimmer h-12 w-32 rounded-lg" />
            <div className="shimmer h-12 w-36 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}

export function DetailPageSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="shimmer h-[60vh] w-full" />
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="shimmer h-8 w-64 rounded" />
        <div className="shimmer h-4 w-full max-w-2xl rounded" />
        <div className="shimmer h-4 w-full max-w-xl rounded" />
        <div className="flex gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="shimmer h-6 w-20 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  )
}

export function MediaGridSkeleton({ count = 20 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="aspect-poster shimmer rounded-lg" />
      ))}
    </div>
  )
}
