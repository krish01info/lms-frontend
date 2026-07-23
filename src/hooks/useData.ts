import { useQuery } from '@tanstack/react-query'
import {
  mockAssignments,
  mockAttendance,
  mockCalendarEvents,
  mockConversations,
  mockCourses,
  mockNotifications,
  mockPayments,
  mockQuizzes,
} from '@/constants/mockData'

const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms))

export function useCourses() {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      await delay()
      return mockCourses
    },
  })
}

export function useAssignments() {
  return useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      await delay()
      return mockAssignments
    },
  })
}

export function useQuizzes() {
  return useQuery({
    queryKey: ['quizzes'],
    queryFn: async () => {
      await delay()
      return mockQuizzes
    },
  })
}

export function useAttendance() {
  return useQuery({
    queryKey: ['attendance'],
    queryFn: async () => {
      await delay()
      return mockAttendance
    },
  })
}

export function useCalendarEvents() {
  return useQuery({
    queryKey: ['calendar'],
    queryFn: async () => {
      await delay()
      return mockCalendarEvents
    },
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      await delay()
      return mockNotifications
    },
  })
}

export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: async () => {
      await delay()
      return mockPayments
    },
  })
}

export function useConversations() {
  return useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      await delay()
      return mockConversations
    },
  })
}
