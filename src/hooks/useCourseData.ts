import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getMyCourses, getCourseById, createCourse, updateCourse } from '@/services/courses.api'

// INSTRUCTOR/ADMIN — courses the logged-in instructor owns
export function useMyCourses() {
  return useQuery({
    queryKey: ['my-courses'],
    queryFn: getMyCourses,
  })
}

// INSTRUCTOR/ADMIN — single course detail (for the edit page)
export function useCourse(courseId: string | undefined) {
  return useQuery({
    queryKey: ['course', courseId],
    queryFn: () => getCourseById(courseId!),
    enabled: !!courseId,
  })
}

// INSTRUCTOR/ADMIN — create a new course owned by the logged-in instructor
export function useCreateCourse() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      // So the new course shows up immediately anywhere useMyCourses is used
      // (e.g. the Quiz Builder's course picker) without needing a refresh.
      queryClient.invalidateQueries({ queryKey: ['my-courses'] })
    },
  })
}

// INSTRUCTOR/ADMIN — update a course (all fields optional)
export function useUpdateCourse(courseId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateCourse>[1]) => updateCourse(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-courses'] })
      queryClient.invalidateQueries({ queryKey: ['course', courseId] })
    },
  })
}
