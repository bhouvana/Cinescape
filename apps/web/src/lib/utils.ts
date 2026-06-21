import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function buildImageUrl(path: string | null, size = 'original'): string | null {
  if (!path) return null
  return `https://image.tmdb.org/t/p/${size}${path}`
}

export function buildPosterUrl(path: string | null, size = 'w342'): string | null {
  return buildImageUrl(path, size)
}

export function buildBackdropUrl(path: string | null, size = 'w1280'): string | null {
  return buildImageUrl(path, size)
}

export function buildProfileUrl(path: string | null, size = 'w185'): string | null {
  return buildImageUrl(path, size)
}

export function getYouTubeEmbedUrl(key: string): string {
  return `https://www.youtube.com/embed/${key}?autoplay=1&mute=1&controls=0&loop=1&playlist=${key}&modestbranding=1&rel=0`
}

export function getYouTubeThumbnail(key: string): string {
  return `https://img.youtube.com/vi/${key}/maxresdefault.jpg`
}

export function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes) return 'N/A'
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  if (m === 0) return `${h}h`
  return `${h}h ${m}m`
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return 'N/A'
  }
}

export function formatYear(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A'
  try {
    return new Date(dateString).getFullYear().toString()
  } catch {
    return 'N/A'
  }
}

export function formatVoteAverage(vote: number | null | undefined): string {
  if (vote == null) return 'N/A'
  return vote.toFixed(1)
}

export function formatCurrency(amount: number): string {
  if (!amount) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)
}

export function formatProgress(currentTime: number, duration: number): number {
  if (!duration) return 0
  return Math.min(Math.round((currentTime / duration) * 100), 100)
}

export function truncateText(text: string, maxLength: number): string {
  if (!text || text.length <= maxLength) return text ?? ''
  return `${text.slice(0, maxLength).trimEnd()}...`
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getMediaTitle(item: { title?: string; name?: string }): string {
  return item.title ?? item.name ?? 'Unknown'
}

export function getMediaDate(item: { release_date?: string; first_air_date?: string }): string {
  return item.release_date ?? item.first_air_date ?? ''
}

export function getTrailer(videos: Array<{ type: string; site: string; key: string }>): { key: string } | null {
  return (
    videos.find((v) => v.type === 'Trailer' && v.site === 'YouTube') ??
    videos.find((v) => v.site === 'YouTube') ??
    null
  )
}

export function ratingToColor(rating: number): string {
  if (rating >= 7.5) return 'text-green-400'
  if (rating >= 6.0) return 'text-yellow-400'
  if (rating >= 4.0) return 'text-orange-400'
  return 'text-red-400'
}

export function ratingToPercent(rating: number): number {
  return (rating / 10) * 100
}

export function generateAccentCssVar(hexColor: string): string {
  const r = parseInt(hexColor.slice(0, 2), 16)
  const g = parseInt(hexColor.slice(2, 4), 16)
  const b = parseInt(hexColor.slice(4, 6), 16)
  const [h, s, l] = rgbToHsl(r, g, b)
  return `${Math.round(h)} ${Math.round(s)}% ${Math.round(l)}%`
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255
  g /= 255
  b /= 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return [h * 360, s * 100, l * 100]
}
