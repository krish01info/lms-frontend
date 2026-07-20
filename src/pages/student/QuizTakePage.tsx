import { useEffect, useRef, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, Flag, Loader2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { EmptyState } from '@/components/common/EmptyState'
import { Skeleton } from '@/components/common/Skeleton'
import { useQuiz, useQuizQuestions, useSubmitAttempt } from '@/hooks/useQuizData'
import { cn } from '@/utils/cn'
import type { ApiQuestionSafe } from '@/types'

export function QuizTakePage() {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()

  const { data: quiz, isLoading: quizLoading, isError: quizError } = useQuiz(quizId)
  const {
    data: questions,
    isLoading: questionsLoading,
    isError: questionsError,
  } = useQuizQuestions(quizId)

  const submitMutation = useSubmitAttempt(quizId ?? '')
  const questionsList = (questions ?? []) as ApiQuestionSafe[]

  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [submitted, setSubmitted] = useState(false)

  // Ref to avoid stale closure in the timer effect
  const handleSubmitRef = useRef<() => void>(() => {})

  // Initialize timer from quiz timeLimit
  useEffect(() => {
    if (quiz?.timeLimit && timeLeft === null) {
      setTimeLeft(quiz.timeLimit * 60)
    }
  }, [quiz?.timeLimit, timeLeft])

  // Countdown — uses handleSubmitRef to avoid stale closure issues
  useEffect(() => {
    if (submitted || timeLeft === null) return
    if (timeLeft <= 0) {
      handleSubmitRef.current()
      return
    }
    const timer = setInterval(() => setTimeLeft((t) => (t !== null && t > 0 ? t - 1 : 0)), 1000)
    return () => clearInterval(timer)
  }, [submitted, timeLeft])

  const handleSubmit = useCallback(() => {
    if (submitted) return
    setSubmitted(true)

    const payload = {
      answers: questionsList.map((q, i) => ({
        questionId: q.id,
        selectedAnswer: answers[i] ?? '',
      })),
    }

    submitMutation.mutate(payload, {
      onSuccess: () => {
        navigate(`/student/quizzes/${quizId}/results`)
      },
      onError: () => {
        setSubmitted(false)
        toast.error('Failed to submit quiz. Please try again.')
      },
    })
  }, [submitted, questionsList, answers, submitMutation, navigate, quizId])

  // Keep the ref in sync
  handleSubmitRef.current = handleSubmit

  // Loading state
  if (quizLoading || questionsLoading) {
    return (
      <div className="mx-auto max-w-3xl space-y-6">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-2 w-full rounded-full" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    )
  }

  // Error states
  if (quizError || questionsError || !quiz) {
    return (
      <EmptyState
        icon={Loader2}
        title="Could not load quiz"
        description="Something went wrong loading this quiz. Please try again."
        actionLabel="Retry"
        onAction={() => window.location.reload()}
      />
    )
  }

  if (questionsList.length === 0) {
    return (
      <EmptyState
        icon={Flag}
        title="No questions"
        description="This quiz doesn't have any questions yet."
        actionLabel="Back to Quizzes"
        onAction={() => navigate('/student/quizzes')}
      />
    )
  }

  const question = questionsList[current]
  const minutes = Math.floor((timeLeft ?? 0) / 60)
  const seconds = (timeLeft ?? 0) % 60
  const progress = ((current + 1) / questionsList.length) * 100
  const answeredCount = Object.keys(answers).length

  // Submission in progress
  if (submitted) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
          <h2 className="text-2xl font-bold">Submitting your answers...</h2>
          <p className="mt-2 text-muted-foreground">Please wait while we process your quiz.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title={quiz.title} description="Answer all questions before time runs out">
        {timeLeft !== null && (
          <Badge
            variant={timeLeft < 120 ? 'destructive' : 'warning'}
            className="gap-1"
          >
            <Clock className="h-3.5 w-3.5" />
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </Badge>
        )}
      </PageHeader>

      <Progress value={progress} className="h-2" />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {current + 1} of {questionsList.length}</span>
        <span>{answeredCount}/{questionsList.length} answered</span>
      </div>

      {/* Question navigator */}
      <div className="flex gap-2 flex-wrap">
        {questionsList.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-colors',
              i === current
                ? 'bg-primary text-white'
                : answers[i] !== undefined
                  ? 'bg-emerald-500/10 text-emerald-600'
                  : 'bg-muted text-muted-foreground'
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Question card */}
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Flag className="h-4 w-4" />
            Question {current + 1} of {questionsList.length}
          </div>
          <h2 className="mb-6 text-lg font-semibold sm:text-xl">{question.text}</h2>
          <div className="space-y-3">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => setAnswers((prev) => ({ ...prev, [current]: option }))}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all',
                  answers[current] === option
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border hover:border-primary/30 hover:bg-muted/50'
                )}
              >
                <span
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-medium',
                    answers[current] === option ? 'bg-primary text-white' : 'bg-muted'
                  )}
                >
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm">{option}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
        >
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>

        {current < questionsList.length - 1 ? (
          <Button onClick={() => setCurrent(current + 1)}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={submitMutation.isPending}
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              'Submit Quiz'
            )}
          </Button>
        )}
      </div>
    </div>
  )
}
