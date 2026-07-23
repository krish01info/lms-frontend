import api from './api'
import type { ApiNotification } from '@/types'

interface NotificationsListResponse {
  notifications: ApiNotification[]
  unreadCount: number
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

// GET /notifications/me?unreadOnly=
export async function getMyNotifications(unreadOnly = false) {
  const { data } = await api.get('/notifications/me', { params: { unreadOnly } })
  return data.data as NotificationsListResponse
}

// GET /notifications/unread-count
export async function getUnreadCount() {
  const { data } = await api.get('/notifications/unread-count')
  return data.data as { count: number }
}

// PATCH /notifications/:id/read
export async function markAsRead(id: string) {
  const { data } = await api.patch(`/notifications/${id}/read`)
  return data.data.notification as ApiNotification
}

// PATCH /notifications/read-all
export async function markAllAsRead() {
  const { data } = await api.patch('/notifications/read-all')
  return data.data as { count: number }
}
