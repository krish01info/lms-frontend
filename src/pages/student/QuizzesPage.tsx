import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Clock, HelpCircle, PenTool, Trophy } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/common/Skeleton'
import { EmptyState } from '@/components/common/EmptyState'
import { useMyQuizList } from '@/hooks/useQuizData'
import { useMyAttempt } from '@/hooks/useQuizData'
import type { ApiQuiz } from '@/types'

export function QuizzesPage() {
  const { data, isLoading, isError } = useMyQuizList()
  const quizzes = data?.quizzes ?? []
  const available = quizzes.length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Quizzes" description="Test your knowledge and track your scores" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Quizzes" description="Test your knowledge and track your scores" />
        <EmptyState
          icon={HelpCircle}
          title="Could not load quizzes"
          description="Something went wrong. Please try again later."
          action={<Button onClick={() => window.location.reload()}>Retry</Button>}
        />
      </div>
    )
  }

  if (quizzes.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Quizzes" description="Test your knowledge and track your scores" />
        <EmptyState
          icon={PenTool}
          title="No quizzes available"
          description="You don't have any quizzes in your enrolled courses yet."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Quizzes" description="Test your knowledge and track your scores" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Available Quizzes" value={available} icon={PenTool} />
        <StatCard label="Courses" value={new Set(quizzes.map((q) => q.courseId)).size} icon={HelpCircle} />
        <StatCard
          label="Status"
          value="Active"
          change={quizzes.length > 0 ? `${quizzes.filter(q => q.status === 'ACTIVE').length} active` : 'No quizzes'}
          trend="up"
          icon={Trophy}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {quizzes.map((quiz, i) => (
          <QuizCard key={quiz.id} quiz={quiz} index={i} />
        ))}
      </div>
    </div>
  )
}

function QuizCard({ quiz, index }: { quiz: ApiQuiz; index: number }) {
  const { data: attempt } = useMyAttempt(quiz.id)
  const isCompleted = !!attempt
  const scorePct = attempt ? (attempt.score / (attempt.totalQuestions || 1)) * 100 : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="h-full transition-shadow hover:shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                {isCompleted ? (
                  <Trophy className="h-6 w-6 text-emerald-600" />
                ) : (
                  <PenTool className="h-6 w-6 text-primary" />
                )}
              </div>
              <div>
                <h3 className="font-semibold">{quiz.title}</h3>
                <p className="text-sm text-muted-foreground">{quiz.course.title}</p>
              </div>
            </div>
            <Badge variant={isCompleted ? 'secondary' : 'default'}>
              {isCompleted ? 'Completed' : 'Available'}
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4" />
              {quiz.questionCount} questions
            </span>
            {quiz.timeLimit && (
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                {quiz.timeLimit} min
              </span>
            )}
            <span className="text-xs">Pass mark: {quiz.passMark}%</span>
          </div>

          {isCompleted && attempt && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Your score</span>
                <span className={`font-semibold ${attempt.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                  {attempt.score}/{attempt.totalQuestions}
                </span>
              </div>
              <Progress value={scorePct} />
            </div>
          )}

          <div className="mt-6">
            {isCompleted ? (
              <Button variant="outline" className="w-full" asChild>
                <Link to={`/student/quizzes/${quiz.id}/results`}>View Results</Link>
              </Button>
            ) : (
              <Button className="w-full" asChild>
                <Link to={`/student/quizzes/take/${quiz.id}`}>Start Quiz</Link>
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
