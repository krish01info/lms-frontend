import api from './api'
import type { ApiLesson } from '@/types'

// GET /courses/:courseId/lessons — enrolled students or instructor/admin
export async function getLessons(courseId: string) {
  const { data } = await api.get(`/courses/${courseId}/lessons`)
  return data.data.lessons as ApiLesson[]
}

// GET /courses/:courseId/lessons/:lessonId
export async function getLessonById(courseId: string, lessonId: string) {
  const { data } = await api.get(`/courses/${courseId}/lessons/${lessonId}`)
  return data.data.lesson as ApiLesson
}

// POST /courses/:courseId/lessons (INSTRUCTOR/ADMIN)
export interface CreateLessonPayload {
  title: string
  description?: string | null
  type?: 'VIDEO' | 'TEXT' | 'QUIZ' | 'ASSIGNMENT'
  videoUrl?: string | null
  content?: string | null
  duration?: number | null
  order?: number
  isPreview?: boolean
}
export async function createLesson(courseId: string, payload: CreateLessonPayload) {
  const { data } = await api.post(`/courses/${courseId}/lessons`, payload)
  return data.data.lesson as ApiLesson
}

// PATCH /courses/:courseId/lessons/:lessonId (INSTRUCTOR/ADMIN)
export type UpdateLessonPayload = Partial<CreateLessonPayload>
export async function updateLesson(courseId: string, lessonId: string, payload: UpdateLessonPayload) {
  const { data } = await api.patch(`/courses/${courseId}/lessons/${lessonId}`, payload)
  return data.data.lesson as ApiLesson
}

// DELETE /courses/:courseId/lessons/:lessonId (INSTRUCTOR/ADMIN)
export async function deleteLesson(courseId: string, lessonId: string) {
  const { data } = await api.delete(`/courses/${courseId}/lessons/${lessonId}`)
  return data.data as { id: string }
}

// POST /courses/:courseId/lessons/reorder (INSTRUCTOR/ADMIN) — batch update order
export async function reorderLessons(courseId: string, orderedIds: string[]) {
  const { data } = await api.post(`/courses/${courseId}/lessons/reorder`, { orderedIds })
  return data.data as { reordered: number }
}
