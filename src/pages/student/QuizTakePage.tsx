import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Clock, Flag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { mockQuizQuestions } from '@/constants/mockData'
import { cn } from '@/utils/cn'

export function QuizTakePage() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [timeLeft, setTimeLeft] = useState(45 * 60)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (submitted) return
    const timer = setInterval(() => setTimeLeft((t) => (t > 0 ? t - 1 : 0)), 1000)
    return () => clearInterval(timer)
  }, [submitted])

  const question = mockQuizQuestions[current]
  const minutes = Math.floor(timeLeft / 60)
  const seconds = timeLeft % 60
  const progress = ((current + 1) / mockQuizQuestions.length) * 100

  const handleSubmit = () => {
    setSubmitted(true)
    const score = mockQuizQuestions.reduce((acc, q, i) => acc + (answers[i] === q.correctAnswer ? 1 : 0), 0)
    setTimeout(() => navigate('/student/quizzes', { state: { score } }), 2000)
  }

  if (submitted) {
    const score = mockQuizQuestions.reduce((acc, q, i) => acc + (answers[i] === q.correctAnswer ? 1 : 0), 0)
    const pct = Math.round((score / mockQuizQuestions.length) * 100)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <div className="mb-4 text-6xl font-bold text-primary">{pct}%</div>
          <h2 className="text-2xl font-bold">Quiz Complete!</h2>
          <p className="mt-2 text-muted-foreground">You scored {score}/{mockQuizQuestions.length}</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Integration Techniques" description="Answer all questions before time runs out">
        <Badge variant="warning" className="gap-1">
          <Clock className="h-3.5 w-3.5" />
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </Badge>
      </PageHeader>

      <Progress value={progress} className="h-2" />

      <div className="flex gap-2 flex-wrap">
        {mockQuizQuestions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={cn(
              'flex h-9 w-9 items-center justify-center rounded-xl text-sm font-medium transition-colors',
              i === current ? 'bg-primary text-white' : answers[i] !== undefined ? 'bg-emerald-500/10 text-emerald-600' : 'bg-muted text-muted-foreground'
            )}
          >
            {i + 1}
          </button>
        ))}
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Flag className="h-4 w-4" />
            Question {current + 1} of {mockQuizQuestions.length}
          </div>
          <h2 className="mb-6 text-lg font-semibold sm:text-xl">{question.question}</h2>
          <div className="space-y-3">
            {question.options.map((option, i) => (
              <button
                key={i}
                onClick={() => setAnswers({ ...answers, [current]: i })}
                className={cn(
                  'flex w-full items-center gap-3 rounded-2xl border p-4 text-left transition-all',
                  answers[current] === i ? 'border-primary bg-primary/5 shadow-sm' : 'border-border hover:border-primary/30 hover:bg-muted/50'
                )}
              >
                <span className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-sm font-medium',
                  answers[current] === i ? 'bg-primary text-white' : 'bg-muted'
                )}>
                  {String.fromCharCode(65 + i)}
                </span>
                <span className="text-sm">{option}</span>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setCurrent(Math.max(0, current - 1))} disabled={current === 0}>
          <ChevronLeft className="mr-1 h-4 w-4" /> Previous
        </Button>
        {current < mockQuizQuestions.length - 1 ? (
          <Button onClick={() => setCurrent(current + 1)}>
            Next <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleSubmit}>Submit Quiz</Button>
        )}
      </div>
    </div>
  )
}
