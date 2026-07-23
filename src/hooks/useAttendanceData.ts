import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { getRoster, markAttendance, getAttendanceSummary, getAutoRoster } from '../services/attendance.api'

// INSTRUCTOR/ADMIN — roster for one course + date, with each student's
// current status (null = unmarked)
export function useRoster(courseId: string | undefined, date: string) {
  const query = useQuery({
    queryKey: ['attendance-roster', courseId, date],
    queryFn: () => getRoster(courseId!, date),
    enabled: !!courseId && !!date,
  })

  useEffect(() => {
    if (query.isError) {
      console.error('Failed to load attendance roster', query.error)
      toast.error('Could not load the class roster. Please try again.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error])

  return query
}

// INSTRUCTOR/ADMIN — batch-save the whole roster for one course + date
export function useMarkAttendance(courseId: string, date: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAttendance,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['attendance-roster', courseId, date] })
      queryClient.invalidateQueries({ queryKey: ['attendance-summary', courseId] })
    },
  })
}

// INSTRUCTOR/ADMIN — per-student % across every date ever marked
export function useAttendanceSummary(courseId: string | undefined) {
  const query = useQuery({
    queryKey: ['attendance-summary', courseId],
    queryFn: () => getAttendanceSummary(courseId!),
    enabled: !!courseId,
  })

  useEffect(() => {
    if (query.isError) {
      console.error('Failed to load attendance summary', query.error)
      toast.error('Could not load the attendance summary. Please try again.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error])

  return query
}

// INSTRUCTOR/ADMIN — auto-computed roster from lesson completion
export function useAutoRoster(courseId: string | undefined, date: string) {
  const query = useQuery({
    queryKey: ['attendance-auto-roster', courseId, date],
    queryFn: () => getAutoRoster(courseId!, date),
    enabled: !!courseId && !!date,
  })

  useEffect(() => {
    if (query.isError) {
      console.error('Failed to load auto attendance roster', query.error)
      toast.error('Could not load the auto-attendance data. Please try again.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error])

  return query
}
