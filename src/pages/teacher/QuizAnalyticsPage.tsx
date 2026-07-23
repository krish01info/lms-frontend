// src/pages/teacher/QuizAnalyticsPage.tsx
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { PageShell } from '@/components/common/PageShell';
import { PageSkeleton } from '@/components/common/Skeleton';
import { ErrorState } from '@/components/common/ErrorState';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { useQuizAttempts, useQuiz } from '@/hooks/useQuizData';

type StatusFilter = 'all' | 'passed' | 'failed';

export function QuizAnalyticsPage() {
  const { quizId } = useParams<{ quizId: string }>();
  const quizQuery = useQuiz(quizId);
  const attemptsQuery = useQuizAttempts(quizId);
  const [filter, setFilter] = useState<StatusFilter>('all');

  if (quizQuery.isLoading || attemptsQuery.isLoading) return <PageSkeleton />;
  if (quizQuery.isError || attemptsQuery.isError) {
    toast.error('Failed to load analytics data');
    return <ErrorState title="Analytics unavailable" message="Could not fetch attempts or quiz details." />;
  }

  const quiz = quizQuery.data!;
  const attempts = attemptsQuery.data?.attempts ?? [];

  const total = attempts.length;
  const passed = attempts.filter((a) => a.passed).length;
  const avgScore = total ? (attempts.reduce((sum, a) => sum + a.score, 0) / total).toFixed(1) : 0;

  const visibleAttempts = attempts.filter((a) => {
    if (filter === 'passed') return a.passed;
    if (filter === 'failed') return !a.passed;
    return true;
  });

  return (
    <PageShell
      title={`Analytics – ${quiz.title}`}
      description={`Overview of student attempts for "${quiz.title}"`}
      actions={
        <Button asChild>
          <Link to={`/teacher/quiz-builder/${quiz.id}`}>Manage Questions</Link>
        </Button>
      }
    >
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Total Attempts</p>
            <p className="text-2xl font-bold">{total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Pass Rate</p>
            <p className="text-2xl font-bold">{total ? ((passed / total) * 100).toFixed(0) : 0}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Average Score</p>
            <p className="text-2xl font-bold">{avgScore}%</p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Attempt Details</h2>
          {total > 0 && (
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={filter === 'all' ? 'default' : 'outline'}
                onClick={() => setFilter('all')}
              >
                All ({total})
              </Button>
              <Button
                type="button"
                size="sm"
                variant={filter === 'passed' ? 'default' : 'outline'}
                onClick={() => setFilter('passed')}
              >
                Passed ({passed})
              </Button>
              <Button
                type="button"
                size="sm"
                variant={filter === 'failed' ? 'default' : 'outline'}
                onClick={() => setFilter('failed')}
              >
                Failed ({total - passed})
              </Button>
            </div>
          )}
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Score</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleAttempts.map((a) => (
              <TableRow key={a.attemptId}>
                <TableCell>{a.student?.name}</TableCell>
                <TableCell>{a.score}%</TableCell>
                <TableCell>{new Date(a.submittedAt).toLocaleDateString()}</TableCell>
                <TableCell>
                  <Badge variant={a.passed ? 'default' : 'destructive'}>
                    {a.passed ? 'Passed' : 'Failed'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {total === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">No attempts recorded yet.</p>
        )}
        {total > 0 && visibleAttempts.length === 0 && (
          <p className="mt-4 text-sm text-muted-foreground">No attempts match this filter.</p>
        )}
      </div>
    </PageShell>
  );
}
