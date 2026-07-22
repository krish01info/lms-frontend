import api from './api'
import type { ApiResource } from '@/types'

// GET /courses/:courseId/resources — instructor (owns course) or enrolled student
export async function getResources(courseId: string) {
  const { data } = await api.get(`/courses/${courseId}/resources`)
  return data.data.resources as ApiResource[]
}

// POST /courses/:courseId/resources (INSTRUCTOR/ADMIN) — upload up to 10 files at once
export async function uploadResources(courseId: string, files: File[]) {
  const formData = new FormData()
  files.forEach((file) => formData.append('resources', file))
  // The shared `api` instance sets a default 'Content-Type: application/json'
  // header. For a FormData body we need the browser to set its own
  // multipart boundary instead — explicitly unsetting it here forces that,
  // rather than relying on axios to auto-detect FormData (which doesn't
  // reliably override an instance-level default header).
  const { data } = await api.post(`/courses/${courseId}/resources`, formData, {
    headers: { 'Content-Type': undefined },
  })
  return data.data.resources as ApiResource[]
}

// DELETE /courses/:courseId/resources/:id (INSTRUCTOR/ADMIN)
export async function deleteResource(courseId: string, resourceId: string) {
  const { data } = await api.delete(`/courses/${courseId}/resources/${resourceId}`)
  return data.data as { id: string }
}
