import { useEffect } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import axios from 'axios'
import {
  getQuizzes,
  getMyQuizzes,
  getQuizById,
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getQuizQuestions,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  submitQuizAttempt,
  getMyAttempt,
  getQuizAttempts,
} from '@/services/quizzes.api'
import type { SubmitAttemptPayload } from '@/types'

// ─── Quizzes ──────────────────────────────────────────────────────────────────

// Fetches quizzes for ALL courses the logged-in student is enrolled in.
// Used by the student QuizzesPage — shows a unified list of available quizzes.
export function useMyQuizList() {
  const query = useQuery({
    queryKey: ['my-quizzes'],
    queryFn: () => getMyQuizzes(),
  })

  useEffect(() => {
    if (query.isError) {
      console.error('Failed to load my quizzes', query.error)
      toast.error('Could not load quizzes. Please try again.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error])

  return query
}

export function useQuizList(courseId?: string) {
  const query = useQuery({
    queryKey: ['quizzes', courseId ?? 'all'],
    queryFn: () => getQuizzes(courseId),
  })

  useEffect(() => {
    if (query.isError) {
      console.error('Failed to load quiz list', query.error)
      toast.error('Could not load quizzes. Please try again.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error])

  return query
}

export function useQuiz(quizId: string | undefined) {
  const query = useQuery({
    queryKey: ['quiz', quizId],
    queryFn: () => getQuizById(quizId!),
    enabled: !!quizId,
  })

  useEffect(() => {
    if (query.isError) {
      console.error('Failed to load quiz', query.error)
      toast.error('Could not load quiz details. Please try again.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error])

  return query
}

// INSTRUCTOR/ADMIN — create a new quiz on one of their courses
export function useCreateQuiz() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },

  })
}

// INSTRUCTOR/ADMIN — edit a quiz's title/timeLimit/passMark
export function useUpdateQuiz(quizId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof updateQuiz>[1]) => updateQuiz(quizId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
      queryClient.invalidateQueries({ queryKey: ['quiz', quizId] })
    },

  })
}

// INSTRUCTOR/ADMIN — archive a quiz
export function useDeleteQuiz() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteQuiz,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },

  })
}

// ─── Questions ────────────────────────────────────────────────────────────────
// Returns ApiQuestionSafe[] for students, ApiQuestionFull[] for instructor/admin —
// the backend decides which shape based on the caller's role.

export function useQuizQuestions(quizId: string | undefined) {
  const query = useQuery({
    queryKey: ['quiz-questions', quizId],
    queryFn: () => getQuizQuestions(quizId!),
    enabled: !!quizId,
  })

  useEffect(() => {
    if (query.isError) {
      console.error('Failed to load quiz questions', query.error)
      toast.error('Could not load quiz questions. Please try again.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error])

  return query
}

// INSTRUCTOR/ADMIN — add a question to a quiz
export function useCreateQuestion(quizId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: Parameters<typeof createQuestion>[1]) => createQuestion(quizId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', quizId] })
      queryClient.invalidateQueries({ queryKey: ['quizzes'] }) // questionCount changed
    },

  })
}

// INSTRUCTOR/ADMIN — edit a question
export function useUpdateQuestion(quizId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (vars: { questionId: string; payload: Parameters<typeof updateQuestion>[1] }) =>
      updateQuestion(vars.questionId, vars.payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', quizId] })
    },

  })
}

// INSTRUCTOR/ADMIN — remove a question
export function useDeleteQuestion(quizId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (questionId: string) => deleteQuestion(questionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quiz-questions', quizId] })
      queryClient.invalidateQueries({ queryKey: ['quizzes'] }) // questionCount changed
    },

  })
}

// ─── Attempts ─────────────────────────────────────────────────────────────────

// A student's own attempt for one quiz. 404 just means "hasn't attempted yet" —
// callers should treat that as normal, not as an error state.
export function useMyAttempt(quizId: string | undefined) {
  const query = useQuery({
    queryKey: ['my-attempt', quizId],
    queryFn: () => getMyAttempt(quizId!),
    enabled: !!quizId,
    retry: false,
  })

  useEffect(() => {
    // 404 just means "hasn't attempted yet" — that's handled by the UI,
    // not an error. Only surface a toast for genuine failures.
    if (query.isError && !(axios.isAxiosError(query.error) && query.error.response?.status === 404)) {
      console.error('Failed to load my attempt', query.error)
      toast.error('Could not load your quiz attempt. Please try again.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error])

  return query
}

export function useSubmitAttempt(quizId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: SubmitAttemptPayload) => submitQuizAttempt(quizId, payload),
    onSuccess: (result) => {
      // Seed the "my attempt" cache directly so the results page doesn't
      // need to re-fetch, and invalidate the list so status badges update.
      queryClient.setQueryData(['my-attempt', quizId], result)
      queryClient.invalidateQueries({ queryKey: ['quizzes'] })
    },
  })
}

// Instructor/admin summary list of everyone's attempts on one quiz
export function useQuizAttempts(quizId: string | undefined) {
  const query = useQuery({
    queryKey: ['quiz-attempts', quizId],
    queryFn: () => getQuizAttempts(quizId!),
    enabled: !!quizId,
  })

  useEffect(() => {
    if (query.isError) {
      console.error('Failed to load quiz attempts', query.error)
      toast.error('Could not load attempts for this quiz. Please try again.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query.isError, query.error])

  return query
}
