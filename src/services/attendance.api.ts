import api from './api'
import type { ApiAttendanceRosterEntry, ApiAttendanceSummaryEntry } from '@/types'

// GET /attendance/roster?courseId=&date=  (date as 'YYYY-MM-DD')
export async function getRoster(courseId: string, date: string) {
  const { data } = await api.get('/attendance/roster', { params: { courseId, date } })
  return data.data.roster as ApiAttendanceRosterEntry[]
}

export interface MarkAttendancePayload {
  courseId: string
  date: string // 'YYYY-MM-DD'
  records: { userId: string; status: 'PRESENT' | 'ABSENT' }[]
}

// POST /attendance/mark
export async function markAttendance(payload: MarkAttendancePayload) {
  const { data } = await api.post('/attendance/mark', payload)
  return data.data as { date: string; count: number }
}

// GET /attendance/summary?courseId=
export async function getAttendanceSummary(courseId: string) {
  const { data } = await api.get('/attendance/summary', { params: { courseId } })
  return data.data as { totalMarkedDays: number; summary: ApiAttendanceSummaryEntry[] }
}
