import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Clock, HelpCircle, Lock, PenTool, Trophy } from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { mockQuizzes } from '@/constants/mockData'
import { cn } from '@/utils/cn'

const statusConfig = {
  available: { label: 'Available', variant: 'success' as const, icon: PenTool },
  completed: { label: 'Completed', variant: 'secondary' as const, icon: Trophy },
  locked: { label: 'Locked', variant: 'outline' as const, icon: Lock },
}

export function QuizzesPage() {
  const available = mockQuizzes.filter((q) => q.status === 'available').length
  const completed = mockQuizzes.filter((q) => q.status === 'completed').length
  const avgScore =
    mockQuizzes
      .filter((q) => q.score !== undefined)
      .reduce((acc, q) => acc + (q.score ?? 0), 0) /
    (completed || 1)

  return (
    <div className="space-y-6">
      <PageHeader title="Quizzes" description="Test your knowledge and track your scores" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Available" value={available} icon={PenTool} />
        <StatCard label="Completed" value={completed} icon={Trophy} iconClassName="bg-emerald-500/10" />
        <StatCard
          label="Average Score"
          value={`${Math.round(avgScore)}%`}
          change="Across completed quizzes"
          trend="up"
          icon={HelpCircle}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {mockQuizzes.map((quiz, i) => {
          const config = statusConfig[quiz.status]
          const Icon = config.icon
          const scorePct = quiz.score !== undefined ? (quiz.score / quiz.maxScore) * 100 : 0

          return (
            <motion.div
              key={quiz.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <Card className={cn('h-full transition-shadow hover:shadow-lg', quiz.status === 'locked' && 'opacity-75')}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{quiz.title}</h3>
                        <p className="text-sm text-muted-foreground">{quiz.course}</p>
                      </div>
                    </div>
                    <Badge variant={config.variant}>{config.label}</Badge>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <HelpCircle className="h-4 w-4" />
                      {quiz.questions} questions
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {quiz.duration} min
                    </span>
                  </div>

                  {quiz.status === 'completed' && quiz.score !== undefined && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Your score</span>
                        <span className="font-semibold text-emerald-600">
                          {quiz.score}/{quiz.maxScore}
                        </span>
                      </div>
                      <Progress value={scorePct} />
                    </div>
                  )}

                  <div className="mt-6">
                    {quiz.status === 'available' ? (
                      <Button className="w-full" asChild>
                        <Link to="/student/quizzes/take">Start Quiz</Link>
                      </Button>
                    ) : quiz.status === 'completed' ? (
                      <Button variant="outline" className="w-full" asChild>
                        <Link to="/student/quizzes/take">Review Answers</Link>
                      </Button>
                    ) : (
                      <Button variant="outline" className="w-full" disabled>
                        Complete prerequisites to unlock
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}
