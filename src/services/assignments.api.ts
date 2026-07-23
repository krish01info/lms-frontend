import api from './api'
import type { ApiAssignment, ApiAssignmentSubmission } from '@/types'

interface AssignmentsListResponse {
  assignments: ApiAssignment[]
  pagination: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}

// GET /assignments?courseId=&page=&limit=
// courseId omitted => all assignments across the caller's own courses
// (instructor/admin) or all enrolled courses (student).
export async function getAssignments(courseId?: string) {
  const { data } = await api.get('/assignments', { params: courseId ? { courseId } : undefined })
  return data.data as AssignmentsListResponse
}

// GET /assignments/:id
export async function getAssignmentById(id: string) {
  const { data } = await api.get(`/assignments/${id}`)
  return data.data.assignment as ApiAssignment
}

// POST /assignments (INSTRUCTOR/ADMIN)
export interface CreateAssignmentPayload {
  title: string
  courseId: string
  description?: string
  dueDate?: string | null
}
export async function createAssignment(payload: CreateAssignmentPayload) {
  const { data } = await api.post('/assignments', payload)
  return data.data.assignment as ApiAssignment
}

// PATCH /assignments/:id (INSTRUCTOR owner/ADMIN)
export interface UpdateAssignmentPayload {
  title?: string
  description?: string
  dueDate?: string | null
}
export async function updateAssignment(id: string, payload: UpdateAssignmentPayload) {
  const { data } = await api.patch(`/assignments/${id}`, payload)
  return data.data.assignment as ApiAssignment
}

// DELETE /assignments/:id (INSTRUCTOR owner/ADMIN)
export async function deleteAssignment(id: string) {
  const { data } = await api.delete(`/assignments/${id}`)
  return data.data as { id: string }
}

// POST /assignments/:assignmentId/submit (STUDENT) — file only, resubmission
// before the due date overwrites the previous file.
export async function submitAssignment(assignmentId: string, file: File) {
  const formData = new FormData()
  formData.append('submission', file)
  // Same reasoning as resources.api.ts's uploadResources — let the browser
  // set its own multipart boundary instead of the instance's default
  // 'Content-Type: application/json'.
  const { data } = await api.post(`/assignments/${assignmentId}/submit`, formData, {
    headers: { 'Content-Type': undefined },
  })
  return data.data.submission as ApiAssignmentSubmission
}

// GET /assignments/:assignmentId/submissions (INSTRUCTOR owner/ADMIN)
export async function getSubmissions(assignmentId: string) {
  const { data } = await api.get(`/assignments/${assignmentId}/submissions`)
  return data.data.submissions as ApiAssignmentSubmission[]
}

// GET /assignments/submissions/:submissionId
export async function getSubmissionById(submissionId: string) {
  const { data } = await api.get(`/assignments/submissions/${submissionId}`)
  return data.data.submission as ApiAssignmentSubmission
}

// PATCH /assignments/submissions/:submissionId/grade (INSTRUCTOR owner/ADMIN)
export interface GradeSubmissionPayload {
  grade: number
  feedback?: string
}
export async function gradeSubmission(submissionId: string, payload: GradeSubmissionPayload) {
  const { data } = await api.patch(`/assignments/submissions/${submissionId}/grade`, payload)
  return data.data.submission as ApiAssignmentSubmission
}
