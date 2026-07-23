import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getSubmissions,
  gradeSubmission,
} from '../services/assignments.api'

// ─── Assignments ──────────────────────────────────────────────────────────────

// courseId omitted => all assignments across the caller's own courses
// (instructor/admin) or enrolled courses (student) — the backend fans this
// out server-side, no client-side per-course fan-out needed.
export function useAssignmentList(courseId?: string) {
  const query = useQuery({
    queryKey: ['assignments', courseId ?? 'all'],
    queryFn: () => getAssignments(courseId),
  })

  useEffect(() => {
    if (query.isError) {
      console.error('Failed to load assignment list', query.error)
      toast.error('Could not load assignments. Please try again.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error])

  return query
}

export function useAssignment(assignmentId: string | undefined) {
  const query = useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () => getAssignmentById(assignmentId!),
    enabled: !!assignmentId,
  })

  useEffect(() => {
    if (query.isError) {
      console.error('Failed to load assignment', query.error)
      toast.error('Could not load assignment details. Please try again.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error])

  return query
}

// INSTRUCTOR/ADMIN — create a new assignment on one of their courses
export function useCreateAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

// INSTRUCTOR/ADMIN — edit an assignment's title/description/dueDate
export function useUpdateAssignment(assignmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateAssignment>[1]) => updateAssignment(assignmentId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] })
    },
  })
}

// INSTRUCTOR/ADMIN — delete an assignment
export function useDeleteAssignment() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteAssignment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

// ─── Submissions ──────────────────────────────────────────────────────────────

// STUDENT — submit or resubmit (before the due date) a single file
export function useSubmitAssignment(assignmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => submitAssignment(assignmentId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] })
    },
  })
}

// INSTRUCTOR/ADMIN — every student's submission for one assignment
export function useSubmissions(assignmentId: string | undefined) {
  const query = useQuery({
    queryKey: ['submissions', assignmentId],
    queryFn: () => getSubmissions(assignmentId!),
    enabled: !!assignmentId,
  })

  useEffect(() => {
    if (query.isError) {
      console.error('Failed to load submissions', query.error)
      toast.error('Could not load submissions for this assignment. Please try again.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error])

  return query
}

// INSTRUCTOR/ADMIN — grade + optional feedback on one submission
export function useGradeSubmission(assignmentId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { submissionId: string; payload: Parameters<typeof gradeSubmission>[1] }) =>
      gradeSubmission(vars.submissionId, vars.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['submissions', assignmentId] })
    },
  })
}
