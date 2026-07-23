import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getLessons,
  getLessonById,
  createLesson,
  updateLesson,
  deleteLesson,
  reorderLessons,
} from '../services/lessons.api'

// ─── Queries ──────────────────────────────────────────────────────────────────

// INSTRUCTOR/ADMIN or enrolled student — all lessons for a course
export function useLessons(courseId: string | undefined) {
  const query = useQuery({
    queryKey: ['lessons', courseId],
    queryFn: () => getLessons(courseId!),
    enabled: !!courseId,
  })

  useEffect(() => {
    if (query.isError) {
      console.error('Failed to load lessons', query.error)
      toast.error('Could not load lessons. Please try again.')
    }
  }, [query.isError, query.error])

  return query
}

// Single lesson detail
export function useLesson(courseId: string | undefined, lessonId: string | undefined) {
  const query = useQuery({
    queryKey: ['lesson', courseId, lessonId],
    queryFn: () => getLessonById(courseId!, lessonId!),
    enabled: !!courseId && !!lessonId,
  })

  useEffect(() => {
    if (query.isError) {
      console.error('Failed to load lesson', query.error)
      toast.error('Could not load lesson details.')
    }
  }, [query.isError, query.error])

  return query
}

// ─── Mutations ────────────────────────────────────────────────────────────────

// INSTRUCTOR/ADMIN — create a new lesson in a course
export function useCreateLesson(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof createLesson>[1]) => createLesson(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] })
      queryClient.invalidateQueries({ queryKey: ['course', courseId] }) // lessonCount changed
    },
  })
}

// INSTRUCTOR/ADMIN — update a lesson
export function useUpdateLesson(courseId: string, lessonId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateLesson>[2]) => updateLesson(courseId, lessonId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] })
      queryClient.invalidateQueries({ queryKey: ['lesson', courseId, lessonId] })
    },
  })
}

// INSTRUCTOR/ADMIN — delete a lesson (auto re-orders remaining)
export function useDeleteLesson(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (lessonId: string) => deleteLesson(courseId, lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] })
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
    },
  })
}

// INSTRUCTOR/ADMIN — batch reorder lessons
export function useReorderLessons(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (orderedIds: string[]) => reorderLessons(courseId, orderedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lessons', courseId] })
    },
  })
}
