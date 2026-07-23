import api from './api'
import type { ApiUserProfile, TeachingStats } from '@/types'

// GET /users/me — full profile (adds isVerified, createdAt, enrolledCount, coursesCount
// on top of the bare User the auth endpoints return)
export async function getMyProfile() {
  const { data } = await api.get('/users/me')
  return data.data.user as ApiUserProfile
}

// GET /users/me/teaching-stats (INSTRUCTOR/ADMIN) — aggregate teaching
// activity: students taught, course breakdown, quiz performance, etc.
export async function getMyTeachingStats() {
  const { data } = await api.get('/users/me/teaching-stats')
  return data.data.stats as TeachingStats
}

// PATCH /users/me — update name and/or avatar URL
export async function updateMyProfile(payload: { name?: string; avatar?: string }) {
  const { data } = await api.patch('/users/me', payload)
  return data.data.user as ApiUserProfile
}

// PATCH /users/me/avatar — upload a new avatar image (multipart/form-data)
export async function uploadMyAvatar(file: File) {
  const formData = new FormData()
  formData.append('avatar', file)
  // The shared `api` instance sets a default 'Content-Type: application/json'
  // header, which wins over axios's automatic FormData detection. Explicitly
  // unsetting it here forces the browser to set its own multipart boundary
  // instead — without this, the request silently gets sent as JSON and the
  // backend receives no file at all (same bug found in resources.api.ts).
  const { data } = await api.patch('/users/me/avatar', formData, {
    headers: { 'Content-Type': undefined },
  })
  return data.data.user as ApiUserProfile
}
