import api from './api'
import type { ApiCourseSummary } from '@/types'

// GET /courses/my (INSTRUCTOR/ADMIN) — courses owned by the logged-in instructor
export async function getMyCourses() {
  const { data } = await api.get('/courses/my')
  return data.data.courses as ApiCourseSummary[]
}

// GET /courses/:id — single course detail
export async function getCourseById(id: string) {
  const { data } = await api.get(`/courses/${id}`)
  return data.data.course as ApiCourseSummary & { lessons?: unknown[] }
}

// POST /courses (INSTRUCTOR/ADMIN) — create a new course owned by the logged-in instructor
export async function createCourse(payload: {
  title: string
  description: string
  category?: string
  price?: number
  status?: 'DRAFT' | 'PUBLISHED'
}) {
  const { data } = await api.post('/courses', payload)
  return data.data.course as ApiCourseSummary
}

// PATCH /courses/:id (INSTRUCTOR/ADMIN) — update course fields (all optional)
export async function updateCourse(
  id: string,
  payload: Partial<{
    title: string
    description: string
    category: string
    price: number
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  }>
) {
  const { data } = await api.patch(`/courses/${id}`, payload)
  return data.data.course as ApiCourseSummary
}
