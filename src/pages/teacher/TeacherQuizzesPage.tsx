import { useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Clock, HelpCircle, ListChecks, PenTool, Pencil, Target, Trash2, Users } from 'lucide-react'
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useMyCourses } from '@/hooks/useCourseData'
import { useCreateQuiz, useUpdateQuiz, useDeleteQuiz } from '@/hooks/useQuizData'
import { getQuizzes } from '@/services/quizzes.api'
import type { ApiQuiz } from '@/types'

const quizSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(150),
  courseId: z.string().uuid('Select a course'),
  timeLimit: z.string().optional(), // minutes, empty = untimed
  passMark: z.string().optional(), // percent, empty = backend default (70)
})
type QuizFormValues = z.infer<typeof quizSchema>

// Editing a quiz doesn't allow moving it to a different course, so this
// form only covers the fields PATCH /quizzes/:id actually accepts.
const editQuizSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(150),
  timeLimit: z.string().optional(),
  passMark: z.string().optional(),
})
type EditQuizFormValues = z.infer<typeof editQuizSchema>

export function QuizBuilderPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  const coursesQuery = useMyCourses()
  const courses = coursesQuery.data ?? []

  // The backend has no "all my quizzes across my courses" endpoint — only
  // GET /quizzes?courseId=. So fan out one list request per owned course,
  // same pattern as the student QuizzesPage's per-quiz attempt lookups.
  const quizListQueries = useQueries({
    queries: courses.map((course) => ({
      queryKey: ['quizzes', course.id],
      queryFn: () => getQuizzes(course.id),
      enabled: courses.length > 0,
    })),
  })

  const quizzesLoading = coursesQuery.isLoading || quizListQueries.some((q) => q.isLoading)
  const quizzesError = coursesQuery.isError || quizListQueries.some((q) => q.isError)
  const quizzes: ApiQuiz[] = quizListQueries.flatMap((q) => q.data?.quizzes ?? [])

  const createQuiz = useCreateQuiz()
  const deleteQuiz = useDeleteQuiz()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<QuizFormValues>({ resolver: zodResolver(quizSchema) })

  const onSubmit = (values: QuizFormValues) => {
    createQuiz.mutate(
      {
        title: values.title,
        courseId: values.courseId,
        timeLimit: values.timeLimit ? Number(values.timeLimit) : null,
        passMark: values.passMark ? Number(values.passMark) : undefined,
      },
      {
        onSuccess: () => {
          toast.success('Quiz created! Add some questions to it next.')
          reset()
          setDialogOpen(false)
        },
        onError: () => {
          toast.error('Could not create the quiz. Please check the details and try again.')
        },
      }
    )
  }

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [quizToDelete, setQuizToDelete] = useState<ApiQuiz | null>(null);

  const openDeleteDialog = (quiz: ApiQuiz) => {
    setQuizToDelete(quiz);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (!quizToDelete) return;
    deleteQuiz.mutate(quizToDelete.id, {
      onSuccess: () => {
        toast.success('Quiz deleted.');
        setDeleteDialogOpen(false);
        setQuizToDelete(null);
      },
      onError: () => {
        toast.error('Could not delete the quiz.');
      },
    });
  };

  const cancelDelete = () => {
    setDeleteDialogOpen(false);
    setQuizToDelete(null);
  };

  // ─── Edit quiz ──────────────────────────────────────────────────────────
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [quizToEdit, setQuizToEdit] = useState<ApiQuiz | null>(null)
  const updateQuiz = useUpdateQuiz(quizToEdit?.id ?? '')

  const {
    register: registerEdit,
    handleSubmit: handleEditSubmit,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<EditQuizFormValues>({ resolver: zodResolver(editQuizSchema) })

  const openEditDialog = (quiz: ApiQuiz) => {
    setQuizToEdit(quiz)
    resetEdit({
      title: quiz.title,
      timeLimit: quiz.timeLimit !== null ? String(quiz.timeLimit) : '',
      passMark: String(quiz.passMark),
    })
    setEditDialogOpen(true)
  }

  const onEditSubmit = (values: EditQuizFormValues) => {
    if (!quizToEdit) return
    updateQuiz.mutate(
      {
        title: values.title,
        timeLimit: values.timeLimit ? Number(values.timeLimit) : null,
        passMark: values.passMark ? Number(values.passMark) : undefined,
      },
      {
        onSuccess: () => {
          toast.success('Quiz updated.')
          setEditDialogOpen(false)
          setQuizToEdit(null)
        },
        onError: () => {
          toast.error('Could not update the quiz. Please check the details and try again.')
        },
      }
    )
  }

  return (
    <PageShell
      title="Quiz Builder"
      description="Create quizzes and manage their questions"
      actions={
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <Button onClick={() => setDialogOpen(true)} disabled={courses.length === 0}>
            Create Quiz
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Quiz</DialogTitle>
              <DialogDescription>Set the basics — you'll add questions on the next screen.</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label>Quiz Title</Label>
                <Input placeholder="Chapter 7 Quiz" {...register('title')} />
                {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Course</Label>
                <Select onValueChange={(v) => setValue('courseId', v, { shouldValidate: true })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.courseId && <p className="text-xs text-destructive">{errors.courseId.message}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Time Limit (minutes)</Label>
                  <Input type="number" min={1} placeholder="Untimed" {...register('timeLimit')} />
                </div>
                <div className="space-y-2">
                  <Label>Pass Mark (%)</Label>
                  <Input type="number" min={0} max={100} placeholder="70" {...register('passMark')} />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={createQuiz.isPending}>
                {createQuiz.isPending ? 'Creating...' : 'Create Quiz'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      }
    >
      {coursesQuery.isSuccess && courses.length === 0 && (
        <EmptyState
          icon={PenTool}
          title="Create a course first"
          description="Quizzes belong to a course. Create a course before you can build a quiz for it."
        />
      )}

      {courses.length > 0 && quizzesLoading && <PageSkeleton />}

      {courses.length > 0 && !quizzesLoading && quizzesError && (
        <ErrorState message="We couldn't load your quizzes. Please try again." />
      )}

      {courses.length > 0 && !quizzesLoading && !quizzesError && quizzes.length === 0 && (
        <EmptyState
          icon={PenTool}
          title="No quizzes yet"
          description="Create your first quiz to start testing your students."
          actionLabel="Create Quiz"
          onAction={() => setDialogOpen(true)}
        />
      )}

      {!quizzesLoading && !quizzesError && quizzes.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} className="transition-shadow hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold">{quiz.title}</h3>
                    <p className="text-sm text-muted-foreground">{quiz.course.title}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <Badge variant={quiz.status === 'ARCHIVED' ? 'destructive' : 'outline'}>
                      {quiz.status === 'ARCHIVED' ? 'Archived' : quiz.status}
                    </Badge>
                    {quiz.questionCount === 0 && (
                      <Badge variant="warning">Not launchable</Badge>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4" />
                    {quiz.questionCount} questions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    {quiz.timeLimit ? `${quiz.timeLimit} min` : 'Untimed'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Target className="h-4 w-4" />
                    Pass at {quiz.passMark}%
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Users className="h-4 w-4" />
                    {quiz.attemptCount} attempt{quiz.attemptCount === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="mt-6 flex gap-2">
                  <Button className="flex-1 gap-2" asChild>
                    <Link to={`/teacher/quiz-builder/${quiz.id}`}>
                      <ListChecks className="h-4 w-4" />
                      Manage Questions
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openEditDialog(quiz)}
                    aria-label="Edit quiz"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => openDeleteDialog(quiz)}
                    disabled={deleteQuiz.isPending || quiz.status === 'ARCHIVED'}
                    aria-label="Archive quiz"
                    title={quiz.status === 'ARCHIVED' ? 'Already archived' : 'Archive quiz'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    asChild
                  >
                    <Link to={`/teacher/quiz-builder/${quiz.id}/analytics`}>Analytics</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
          <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Archive Quiz</DialogTitle>
                <DialogDescription>
                  Are you sure you want to archive "{quizToDelete?.title}"? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end space-x-2 mt-4">
                <Button variant="outline" onClick={cancelDelete}>Cancel</Button>
                <Button variant="destructive" onClick={confirmDelete}>Archive</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Dialog
            open={editDialogOpen}
            onOpenChange={(open) => {
              setEditDialogOpen(open)
              if (!open) setQuizToEdit(null)
            }}
          >
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Quiz</DialogTitle>
                <DialogDescription>Update the title, time limit, or pass mark.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleEditSubmit(onEditSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label>Quiz Title</Label>
                  <Input placeholder="Chapter 7 Quiz" {...registerEdit('title')} />
                  {editErrors.title && <p className="text-xs text-destructive">{editErrors.title.message}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Time Limit (minutes)</Label>
                    <Input type="number" min={1} placeholder="Untimed" {...registerEdit('timeLimit')} />
                  </div>
                  <div className="space-y-2">
                    <Label>Pass Mark (%)</Label>
                    <Input type="number" min={0} max={100} placeholder="70" {...registerEdit('passMark')} />
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={updateQuiz.isPending}>
                  {updateQuiz.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
    </PageShell>
  )
}
