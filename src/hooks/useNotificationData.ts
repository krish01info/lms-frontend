import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getMyNotifications, getUnreadCount, markAsRead, markAllAsRead } from '../services/notifications.api'

export function useMyNotifications(unreadOnly = false) {
  const query = useQuery({
    queryKey: ['notifications', unreadOnly],
    queryFn: () => getMyNotifications(unreadOnly),
  })

  useEffect(() => {
    if (query.isError) {
      console.error('Failed to load notifications', query.error)
      toast.error('Could not load notifications. Please try again.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error])

  return query
}

// Lightweight poll for the navbar bell badge — cheap endpoint, safe to refetch often.
export function useUnreadCount() {
  return useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: getUnreadCount,
    refetchInterval: 30000,
  })
}

export function useMarkAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })
}

export function useMarkAllAsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] })
    },
  })
}
