'use client'

import { useAuth } from '@clerk/nextjs'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { watchlistApi } from '../lib/api-client'
import { toast } from 'sonner'

interface WatchlistItem {
  id: string
  tmdbId: number
  mediaType: string
}

interface Watchlist {
  id: string
  name: string
  isPinned?: boolean
}

export function useWatchlist() {
  const { getToken, isSignedIn } = useAuth()
  const queryClient = useQueryClient()

  const { data: watchlists } = useQuery({
    queryKey: ['watchlists'],
    queryFn: async () => {
      const token = await getToken()
      if (!token) return [] as Watchlist[]
      return watchlistApi.getAll(token) as Promise<Watchlist[]>
    },
    enabled: !!isSignedIn,
    staleTime: 1000 * 60 * 5,
  })

  const lists = (watchlists as Watchlist[] | undefined) ?? []
  const defaultList = lists[0]

  const { data: items } = useQuery({
    queryKey: ['watchlist-items', 'hook', defaultList?.id],
    queryFn: async () => {
      const token = await getToken()
      if (!token || !defaultList) return [] as WatchlistItem[]
      return watchlistApi.getItems(token, defaultList.id) as Promise<WatchlistItem[]>
    },
    enabled: !!isSignedIn && !!defaultList,
    staleTime: 1000 * 30,
  })

  const listItems = (items as WatchlistItem[] | undefined) ?? []

  const ensureDefaultList = async (): Promise<Watchlist> => {
    const token = await getToken()
    if (!token) throw new Error('Not signed in')
    if (defaultList) return defaultList

    const created = await watchlistApi.create(token, {
      name: 'My List',
      isPublic: false,
    }) as Watchlist
    // Refresh watchlists so defaultList becomes defined
    await queryClient.invalidateQueries({ queryKey: ['watchlists'] })
    return created
  }

  const addMutation = useMutation({
    mutationFn: async ({ tmdbId, mediaType }: { tmdbId: number; mediaType: 'movie' | 'tv' }) => {
      const list = await ensureDefaultList()
      const token = await getToken()
      if (!token) throw new Error('Not signed in')
      return watchlistApi.addItem(token, list.id, tmdbId, mediaType)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist-items'] })
      queryClient.invalidateQueries({ queryKey: ['watchlists'] })
      toast.success('Added to My List')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to add to watchlist')
    },
  })

  const removeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const token = await getToken()
      if (!token) throw new Error('Not signed in')
      const list = defaultList ?? lists[0]
      if (!list) throw new Error('No watchlist found')
      return watchlistApi.removeItem(token, list.id, itemId)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist-items'] })
      toast.success('Removed from My List')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to remove from watchlist')
    },
  })

  function isInWatchlist(tmdbId: number, mediaType: string) {
    return listItems.some((item) => item.tmdbId === tmdbId && item.mediaType === mediaType)
  }

  function toggle(tmdbId: number, mediaType: 'movie' | 'tv') {
    if (!isSignedIn) return
    const existing = listItems.find(
      (item) => item.tmdbId === tmdbId && item.mediaType === mediaType
    )
    if (existing) {
      removeMutation.mutate(existing.id)
    } else {
      addMutation.mutate({ tmdbId, mediaType })
    }
  }

  return {
    isSignedIn: !!isSignedIn,
    isInWatchlist,
    toggle,
    isMutating: addMutation.isPending || removeMutation.isPending,
    defaultListId: defaultList?.id,
  }
}
