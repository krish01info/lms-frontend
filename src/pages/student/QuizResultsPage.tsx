import axios from 'axios'
import { motion } from 'framer-motion'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CheckCircle2, PenTool, Trophy, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { PageSkeleton } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useMyAttempt } from '@/hooks/useQuizData'
import { cn } from '@/utils/cn'

export function QuizResultsPage() {
  const { quizId } = useParams<{ quizId: string }>()
  const navigate = useNavigate()
  const { data: attempt, isLoading, isError, error } = useMyAttempt(quizId)

  if (isLoading) return <PageSkeleton />

  if (isError) {
    const status = axios.isAxiosError(error) ? error.response?.status : undefined

    if (status === 404) {
      return (
        <EmptyState
          icon={PenTool}
          title="No attempt yet"
          description="You haven't taken this quiz yet, so there's nothing to show here."
          actionLabel="Take the quiz"
          onAction={() => navigate(`/student/quizzes/${quizId}/take`)}
        />
      )
    }

    return (
      <ErrorState
        title="Couldn't load your results"
        message="Something went wrong fetching this attempt. Please try again."
      />
    )
  }

  if (!attempt) return null

  return (
    <div className="space-y-6">
      <PageHeader title={attempt.quizTitle} description="Your quiz results and answer breakdown">
        <Badge variant={attempt.passed ? 'success' : 'destructive'} className="gap-1.5 text-sm">
          {attempt.passed ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
          {attempt.passed ? 'Passed' : 'Not passed'}
        </Badge>
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Score" value={`${attempt.score}%`} icon={Trophy} iconClassName="bg-emerald-500/10" />
        <StatCard
          label="Correct answers"
          value={`${attempt.correctCount}/${attempt.totalQuestions}`}
          icon={CheckCircle2}
        />
        <StatCard
          label="Submitted"
          value={new Date(attempt.submittedAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          })}
          icon={PenTool}
        />
      </div>

      <div className="space-y-3">
        {attempt.questions.map((q, i) => (
          <motion.div
            key={q.questionId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
          >
            <Card className={cn('border-l-4', q.isCorrect ? 'border-l-emerald-500' : 'border-l-destructive')}>
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  {q.isCorrect ? (
                    <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
                  )}
                  <div className="flex-1 space-y-2">
                    <p className="font-medium">
                      {i + 1}. {q.questionText}
                    </p>
                    <div className="grid gap-1 text-sm sm:grid-cols-2">
                      <p className="text-muted-foreground">
                        Your answer:{' '}
                        <span className={cn('font-medium', q.isCorrect ? 'text-emerald-600' : 'text-destructive')}>
                          {q.selectedAnswer ?? '(no answer)'}
                        </span>
                      </p>
                      {!q.isCorrect && (
                        <p className="text-muted-foreground">
                          Correct answer: <span className="font-medium text-emerald-600">{q.correctAnswer}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button variant="outline" asChild>
          <Link to="/student/quizzes">Back to Quizzes</Link>
        </Button>
      </div>
    </div>
  )
}
