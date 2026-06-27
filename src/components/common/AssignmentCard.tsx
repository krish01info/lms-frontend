import { format, parseISO } from 'date-fns'
import { Calendar, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { Assignment } from '@/types'
import { cn } from '@/utils/cn'

const statusConfig = {
  pending: { label: 'Pending', variant: 'warning' as const },
  submitted: { label: 'Submitted', variant: 'secondary' as const },
  graded: { label: 'Graded', variant: 'success' as const },
  overdue: { label: 'Overdue', variant: 'destructive' as const },
}

interface AssignmentCardProps {
  assignment: Assignment
  onView?: () => void
}

export function AssignmentCard({ assignment, onView }: AssignmentCardProps) {
  const status = statusConfig[assignment.status]

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="font-semibold">{assignment.title}</h3>
              <p className="text-sm text-muted-foreground">{assignment.course}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5" />
                Due {format(parseISO(assignment.dueDate), 'MMM d, yyyy')}
              </div>
            </div>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        {assignment.grade !== undefined && (
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Grade:</span>
            <span className={cn('text-lg font-bold', assignment.grade >= 80 ? 'text-emerald-600' : 'text-amber-600')}>
              {assignment.grade}/{assignment.maxGrade}
            </span>
          </div>
        )}
        {onView && (
          <Button variant="outline" size="sm" className="mt-4" onClick={onView}>
            View Details
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
