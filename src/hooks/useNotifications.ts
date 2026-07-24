import { useEffect } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import api from '@/services/api'
import type { ApiNotification } from '@/types'

const TOKEN_KEY = 'learnflow_access_token'
let socket: Socket | null = null

export function useNotifications() {
  const { isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  const listQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications', { params: { limit: 50 } })
      return data.data as { items: ApiNotification[]; unreadCount: number }
    },
    enabled: isAuthenticated,
  })

  const unreadQuery = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: async () => {
      const { data } = await api.get('/notifications/unread-count')
      return data.data.unreadCount as number
    },
    enabled: isAuthenticated,
  })

  // Socket connect + live push
  useEffect(() => {
    if (!isAuthenticated) return
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) return

    if (!socket?.connected) {
      const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'
      socket = io(socketUrl, { auth: { token }, withCredentials: true })
    }

    const handleNew = (notification: ApiNotification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
      toast(notification.title, { description: notification.message })
    }

    socket.on('notification:new', handleNew)
    return () => {
      socket?.off('notification:new', handleNew)
    }
  }, [isAuthenticated, queryClient])

  useEffect(() => {
    if (!isAuthenticated) {
      socket?.disconnect()
      socket = null
    }
  }, [isAuthenticated])

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const markAllAsReadMutation = useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/notifications/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  return {
    notifications: listQuery.data?.items ?? [],
    unreadCount: unreadQuery.data ?? 0,
    isLoading: listQuery.isLoading,
    isError: listQuery.isError,
    refetch: listQuery.refetch,
    markAsRead: markAsReadMutation.mutate,
    isMarkingAsRead: markAsReadMutation.isPending,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    remove: deleteMutation.mutate,
  }
}