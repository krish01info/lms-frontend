import api from './api'
import type { ApiAnnouncement } from '@/types'

interface AnnouncementsListResponse {
  announcements: ApiAnnouncement[]
  pagination: { total: number; page: number; limit: number; totalPages: number }
}

// GET /announcements?courseId= — courseId omitted = all announcements visible to the caller
export async function getAnnouncements(courseId?: string) {
  const { data } = await api.get('/announcements', { params: courseId ? { courseId } : undefined })
  return data.data as AnnouncementsListResponse
}

export interface CreateAnnouncementPayload {
  title: string
  body: string
  courseId?: string | null // omitted/null = broadcast to all of the instructor's courses
}

// POST /announcements (INSTRUCTOR/ADMIN)
export async function createAnnouncement(payload: CreateAnnouncementPayload) {
  const { data } = await api.post('/announcements', payload)
  return data.data.announcement as ApiAnnouncement
}

// PATCH /announcements/:id (INSTRUCTOR owner/ADMIN)
export async function updateAnnouncement(id: string, payload: { title?: string; body?: string }) {
  const { data } = await api.patch(`/announcements/${id}`, payload)
  return data.data.announcement as ApiAnnouncement
}

// DELETE /announcements/:id (INSTRUCTOR owner/ADMIN)
export async function deleteAnnouncement(id: string) {
  const { data } = await api.delete(`/announcements/${id}`)
  return data.data as { id: string }
}
