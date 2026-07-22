import api from './api'
import type {
  ApiQuiz,
  ApiQuestionSafe,
  ApiQuestionFull,
  QuizAttemptResult,
  QuizAttemptsListResponse,
  SubmitAttemptPayload,
} from '@/types'

// ─── Quizzes ──────────────────────────────────────────────────────────────────

// GET /quizzes?courseId=&page=&limit=
export async function getQuizzes(courseId?: string) {
  const { data } = await api.get('/quizzes', { params: courseId ? { courseId } : {} })
  return data.data as { quizzes: ApiQuiz[]; pagination: { total: number; page: number; limit: number; totalPages: number } }
}

// GET /quizzes/my — quizzes from ALL courses the logged-in student is enrolled in
export async function getMyQuizzes() {
  const { data } = await api.get('/quizzes/my')
  return data.data as { quizzes: ApiQuiz[] }
}

// GET /quizzes/:id
export async function getQuizById(quizId: string) {
  const { data } = await api.get(`/quizzes/${quizId}`)
  return data.data.quiz as ApiQuiz
}

// POST /quizzes (INSTRUCTOR/ADMIN only)
export async function createQuiz(payload: {
  title: string
  courseId: string
  timeLimit?: number | null
  passMark?: number
}) {
  const { data } = await api.post('/quizzes', payload)
  return data.data.quiz as ApiQuiz
}

// PATCH /quizzes/:id (INSTRUCTOR/ADMIN only) — all fields optional, send only what changed
export async function updateQuiz(
  quizId: string,
  payload: Partial<{ title: string; timeLimit: number | null; passMark: number }>
) {
  const { data } = await api.patch(`/quizzes/${quizId}`, payload)
  return data.data.quiz as ApiQuiz
}

// DELETE /quizzes/:id (INSTRUCTOR/ADMIN only) — soft-delete, archives the quiz
export async function deleteQuiz(quizId: string) {
  const { data } = await api.delete(`/quizzes/${quizId}`)
  return data.data as { id: string } | null
}

// ─── Questions ────────────────────────────────────────────────────────────────
// The backend strips the `answer` field for STUDENT role automatically, so
// the same endpoint can return either shape depending on who's logged in.
// Callers that know they're an instructor can cast to ApiQuestionFull[].

// GET /quizzes/:quizId/questions
export async function getQuizQuestions(quizId: string) {
  const { data } = await api.get(`/quizzes/${quizId}/questions`)
  return data.data.questions as ApiQuestionSafe[] | ApiQuestionFull[]
}

// POST /quizzes/:quizId/questions (INSTRUCTOR/ADMIN only)
export async function createQuestion(
  quizId: string,
  payload: { text: string; options: string[]; answer: string; order: number }
) {
  const { data } = await api.post(`/quizzes/${quizId}/questions`, payload)
  return data.data.question as ApiQuestionFull
}

// PATCH /questions/:id (INSTRUCTOR/ADMIN only) — all fields optional, send only what changed
export async function updateQuestion(
  questionId: string,
  payload: Partial<{ text: string; options: string[]; answer: string; order: number }>
) {
  const { data } = await api.patch(`/questions/${questionId}`, payload)
  return data.data.question as ApiQuestionFull
}

// DELETE /questions/:id (INSTRUCTOR/ADMIN only)
export async function deleteQuestion(questionId: string) {
  const { data } = await api.delete(`/questions/${questionId}`)
  return data.data as { id: string } | null
}

// ─── Attempts ─────────────────────────────────────────────────────────────────

// POST /quizzes/:quizId/attempts (STUDENT only)
// Throws a 409 (via axios error) if the student already attempted this quiz —
// callers should catch that specifically to show "already attempted" UI
// instead of a generic error toast.
export async function submitQuizAttempt(quizId: string, payload: SubmitAttemptPayload) {
  const { data } = await api.post(`/quizzes/${quizId}/attempts`, payload)
  return data.data as QuizAttemptResult
}

// GET /quizzes/:quizId/attempts/me (STUDENT)
// Throws a 404 (via axios error) if the student hasn't attempted this quiz yet —
// callers should catch that to show a "take the quiz" prompt instead of an error.
export async function getMyAttempt(quizId: string) {
  const { data } = await api.get(`/quizzes/${quizId}/attempts/me`)
  return data.data as QuizAttemptResult
}

// GET /quizzes/:quizId/attempts (INSTRUCTOR/ADMIN)
export async function getQuizAttempts(quizId: string) {
  const { data } = await api.get(`/quizzes/${quizId}/attempts`)
  return data.data as QuizAttemptsListResponse
}
