import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getGradebook } from '../services/gradebook.api'

// INSTRUCTOR/ADMIN — full gradebook for one course
export function useGradebook(courseId: string | undefined) {
  const query = useQuery({
    queryKey: ['gradebook', courseId],
    queryFn: () => getGradebook(courseId!),
    enabled: !!courseId,
  })

  useEffect(() => {
    if (query.isError) {
      console.error('Failed to load gradebook', query.error)
      toast.error('Could not load the gradebook. Please try again.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error])

  return query
}
