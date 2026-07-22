import api from './api'
import type { ApiGradebook } from '@/types'

// GET /gradebook/:courseId
export async function getGradebook(courseId: string) {
  const { data } = await api.get(`/gradebook/${courseId}`)
  return data.data as ApiGradebook
}
