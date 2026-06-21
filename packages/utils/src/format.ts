import { format, formatDistanceToNow, parseISO, differenceInMinutes } from 'date-fns'

export function formatRuntime(minutes: number | null | undefined): string {
  if (!minutes) return 'N/A'
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (hours === 0) return `${mins}m`
  if (mins === 0) return `${hours}h`
  return `${hours}h ${mins}m`
}

export function formatDate(dateString: string | null | undefined, fmt = 'MMM d, yyyy'): string {
  if (!dateString) return 'N/A'
  try {
    return format(parseISO(dateString), fmt)
  } catch {
    return 'N/A'
  }
}

export function formatYear(dateString: string | null | undefined): string {
  if (!dateString) return 'N/A'
  try {
    return format(parseISO(dateString), 'yyyy')
  } catch {
    return 'N/A'
  }
}

export function formatRelativeTime(dateString: string | Date): string {
  try {
    const date = typeof dateString === 'string' ? parseISO(dateString) : dateString
    return formatDistanceToNow(date, { addSuffix: true })
  } catch {
    return 'Unknown'
  }
}

export function formatVoteAverage(vote: number | null | undefined): string {
  if (vote == null) return 'N/A'
  return vote.toFixed(1)
}

export function formatPopularity(popularity: number): string {
  if (popularity >= 1000) return `${(popularity / 1000).toFixed(1)}K`
  return popularity.toFixed(0)
}

export function formatProgress(currentTime: number, duration: number): number {
  if (duration === 0) return 0
  return Math.min(Math.round((currentTime / duration) * 100), 100)
}

export function formatWatchTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
  return num.toString()
}

export function formatCurrency(amount: number): string {
  if (amount === 0) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)
}

export function calculateTimeLeft(
  currentTime: number,
  duration: number
): { minutes: number; percentage: number } {
  const remaining = Math.max(0, duration - currentTime)
  const minutes = Math.ceil(remaining / 60)
  const percentage = duration > 0 ? Math.round((currentTime / duration) * 100) : 0
  return { minutes, percentage }
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength).trimEnd()}...`
}

export function capitalizeFirst(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}
