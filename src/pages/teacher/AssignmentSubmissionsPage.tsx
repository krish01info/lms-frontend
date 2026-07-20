import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, FileCheck2, Paperclip } from 'lucide-react'
import { toast } from 'sonner'
import { PageShell } from '@/components/common/PageShell'
import { PageSkeleton } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { useAssignment, useSubmissions, useGradeSubmission } from '@/hooks/useAssignmentData'
import type { ApiAssignmentSubmission } from '@/types'

// One row's local editable state — grade/feedback are only sent to the server
// when the teacher hits "Save", not on every keystroke.
function SubmissionRow({
  submission,
  onSave,
  isSaving,
}: {
  submission: ApiAssignmentSubmission
  onSave: (grade: number, feedback: string) => void
  isSaving: boolean
}) {
  const [grade, setGrade] = useState(submission.grade?.toString() ?? '')
  const [feedback, setFeedback] = useState(submission.feedback ?? '')

  const isGraded = submission.grade !== null
  const gradeNum = Number(grade)
  const gradeValid = grade !== '' && Number.isInteger(gradeNum) && gradeNum >= 0 && gradeNum <= 100

  return (
    <Card>
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-medium">{submission.user.name}</p>
            <p className="text-xs text-muted-foreground">
              Submitted {new Date(submission.createdAt).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isGraded ? (
              <Badge variant="success">Graded · {submission.grade}/100</Badge>
            ) : (
              <Badge variant="warning">Ungraded</Badge>
            )}
            {submission.fileUrl && (
              <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">
                  <Paperclip className="mr-1.5 h-3.5 w-3.5" />
                  View file
                </Button>
              </a>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-[120px_1fr_auto] items-end">
          <div className="space-y-1.5">
            <Label className="text-xs">Grade (0-100)</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              placeholder="—"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Feedback (optional)</Label>
            <Input
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Nice work, but check part 2..."
            />
          </div>
          <Button
            size="sm"
            disabled={!gradeValid || isSaving}
            onClick={() => onSave(gradeNum, feedback)}
          >
            {isSaving ? 'Saving…' : isGraded ? 'Update grade' : 'Save grade'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function AssignmentSubmissionsPage() {
  const { assignmentId } = useParams<{ assignmentId: string }>()

  const assignmentQuery = useAssignment(assignmentId)
  const submissionsQuery = useSubmissions(assignmentId)
  const gradeSubmission = useGradeSubmission(assignmentId!)

  const assignment = assignmentQuery.data
  const submissions = submissionsQuery.data ?? []

  const handleSave = (submissionId: string, grade: number, feedback: string) => {
    gradeSubmission.mutate(
      { submissionId, payload: { grade, feedback: feedback || undefined } },
      {
        onSuccess: () => toast.success('Grade saved.'),
        onError: () => toast.error('Could not save the grade. Please try again.'),
      }
    )
  }

  const isLoading = assignmentQuery.isLoading || submissionsQuery.isLoading
  const isError = assignmentQuery.isError || submissionsQuery.isError

  const gradedCount = submissions.filter((s) => s.grade !== null).length

  return (
    <PageShell
      title={assignment ? assignment.title : 'Submissions'}
      description={
        assignment
          ? `${assignment.course.title} · ${gradedCount}/${submissions.length} graded`
          : 'Review and grade student submissions'
      }
      actions={
        <Link to="/teacher/assignments">
          <Button variant="outline" size="sm">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to assignments
          </Button>
        </Link>
      }
    >
      {isLoading ? (
        <PageSkeleton />
      ) : isError ? (
        <ErrorState
          message="Could not load submissions. Please try again."
          onRetry={() => submissionsQuery.refetch()}
        />
      ) : submissions.length === 0 ? (
        <EmptyState
          icon={FileCheck2}
          title="No submissions yet"
          description="Nobody has submitted this assignment yet."
        />
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => (
            <SubmissionRow
              key={submission.id}
              submission={submission}
              isSaving={gradeSubmission.isPending}
              onSave={(grade, feedback) => handleSave(submission.id, grade, feedback)}
            />
          ))}
        </div>
      )}
    </PageShell>
  )
}
