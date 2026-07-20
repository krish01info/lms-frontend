import { useMutation, useQueryClient } from '@tanstack/react-query'
// import { deleteResource, uploadResources } from '@/services/resources.api'
import { deleteResource, uploadResources } from '../services/resources.api'

// INSTRUCTOR/ADMIN — upload one or more files to a course
export function useUploadResources() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ courseId, files }: { courseId: string; files: File[] }) => uploadResources(courseId, files),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resources', variables.courseId] })
    },
  })
}

// INSTRUCTOR/ADMIN — delete a single resource
export function useDeleteResource() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ courseId, resourceId }: { courseId: string; resourceId: string }) =>
      deleteResource(courseId, resourceId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['resources', variables.courseId] })
    },
  })
}
