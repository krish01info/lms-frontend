import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  Film,
  FileText,
  HelpCircle,
  ClipboardList,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
} from 'lucide-react'
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
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCourse } from '@/hooks/useCourseData'
import {
  useLessons,
  useCreateLesson,
  useUpdateLesson,
  useDeleteLesson,
  useReorderLessons,
} from '@/hooks/useLessonData'
import type { ApiLesson, LessonType } from '@/types'

const lessonSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().max(2000).optional(),
  type: z.enum(['VIDEO', 'TEXT', 'QUIZ', 'ASSIGNMENT']),
  duration: z.string().optional(),
  isPreview: z.boolean().optional(),
})
type LessonFormValues = z.infer<typeof lessonSchema>

const TYPE_ICONS: Record<LessonType, React.ElementType> = {
  VIDEO: Film,
  TEXT: FileText,
  QUIZ: HelpCircle,
  ASSIGNMENT: ClipboardList,
}

const TYPE_LABELS: Record<LessonType, string> = {
  VIDEO: 'Video',
  TEXT: 'Text / Article',
  QUIZ: 'Quiz',
  ASSIGNMENT: 'Assignment',
}

const TYPE_BADGE_VARIANTS: Record<LessonType, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  VIDEO: 'default',
  TEXT: 'secondary',
  QUIZ: 'outline',
  ASSIGNMENT: 'destructive',
}

export function LessonManagerPage() {
  const { courseId } = useParams<{ courseId: string }>()

  const courseQuery = useCourse(courseId)
  const lessonsQuery = useLessons(courseId)
  const createLesson = useCreateLesson(courseId!)
  const deleteLesson = useDeleteLesson(courseId!)
  const reorderLessons = useReorderLessons(courseId!)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<ApiLesson | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<ApiLesson | null>(null)

  const course = courseQuery.data
  const lessons = lessonsQuery.data ?? []

  const updateLessonHook = useUpdateLesson(courseId!, editingLesson?.id ?? '')

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<LessonFormValues>({
    resolver: zodResolver(lessonSchema),
    defaultValues: { title: '', description: '', type: 'VIDEO', duration: '', isPreview: false },
  })

  const openCreateDialog = () => {
    setEditingLesson(null)
    reset({ title: '', description: '', type: 'VIDEO', duration: '', isPreview: false })
    setDialogOpen(true)
  }

  const openEditDialog = (lesson: ApiLesson) => {
    setEditingLesson(lesson)
    reset({
      title: lesson.title,
      description: lesson.description ?? '',
      type: lesson.type,
      duration: lesson.duration ? String(lesson.duration) : '',
      isPreview: lesson.isPreview,
    })
    setDialogOpen(true)
  }

  const onSubmit = (values: LessonFormValues) => {
    const payload = {
      title: values.title,
      description: values.description || null,
      type: values.type,
      duration: values.duration ? Number(values.duration) : null,
      isPreview: values.isPreview ?? false,
    }

    if (editingLesson) {
      updateLessonHook.mutate(payload, {
        onSuccess: () => {
          toast.success('Lesson updated.')
          setDialogOpen(false)
          setEditingLesson(null)
        },
        onError: () => toast.error('Could not update the lesson.'),
      })
    } else {
      createLesson.mutate(payload, {
        onSuccess: () => {
          toast.success('Lesson added!')
          setDialogOpen(false)
        },
        onError: () => toast.error('Could not create the lesson.'),
      })
    }
  }

  const handleDelete = () => {
    if (!deleteConfirm) return
    deleteLesson.mutate(deleteConfirm.id, {
      onSuccess: () => {
        toast.success('Lesson deleted.')
        setDeleteConfirm(null)
      },
      onError: () => toast.error('Could not delete the lesson.'),
    })
  }

  const moveLesson = (index: number, direction: 'up' | 'down') => {
    const newOrder = [...lessons]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newOrder.length) return

    // Swap the order fields
    const temp = newOrder[index].order
    newOrder[index] = { ...newOrder[index], order: newOrder[swapIndex].order }
    newOrder[swapIndex] = { ...newOrder[swapIndex], order: temp }

    // Re-sort by the new order
    newOrder.sort((a, b) => a.order - b.order)

    reorderLessons.mutate(newOrder.map((l) => l.id), {
      onSuccess: () => toast.success('Lessons reordered.'),
      onError: () => toast.error('Could not reorder lessons.'),
    })
  }

  const isLoading = courseQuery.isLoading || lessonsQuery.isLoading
  const isError = courseQuery.isError || lessonsQuery.isError

  if (isLoading) {
    return (
      <PageShell title="Lessons" description="Loading lesson content...">
        <PageSkeleton />
      </PageShell>
    )
  }

  if (isError || !course) {
    return (
      <PageShell title="Lessons" description="Could not load course details">
        <ErrorState
          message="We couldn't load this course's lessons. Please try again."
          onRetry={() => { courseQuery.refetch(); lessonsQuery.refetch() }}
        />
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Lesson Management"
      description={`${course.title} — ${lessons.length} lesson${lessons.length === 1 ? '' : 's'}`}
      actions={
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/teacher/courses/${courseId}/edit`}>
              <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
              Back to course
            </Link>
          </Button>
          <Button onClick={openCreateDialog} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Lesson
          </Button>
        </div>
      }
    >
      {lessons.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No lessons yet"
          description="Add your first lesson to start building course content."
          actionLabel="Add Lesson"
          onAction={openCreateDialog}
        />
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson, index) => {
            const TypeIcon = TYPE_ICONS[lesson.type]
            return (
              <Card key={lesson.id} className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-4 p-4">
                  {/* Drag handle / order indicator */}
                  <div className="flex shrink-0 flex-col items-center gap-0.5">
                    <button
                      type="button"
                      onClick={() => moveLesson(index, 'up')}
                      disabled={index === 0 || reorderLessons.isPending}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                      aria-label="Move up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <span className="text-xs font-medium text-muted-foreground">{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => moveLesson(index, 'down')}
                      disabled={index === lessons.length - 1 || reorderLessons.isPending}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                      aria-label="Move down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Lesson type icon */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10">
                    <TypeIcon className="h-5 w-5 text-primary" />
                  </div>

                  {/* Lesson info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-medium">{lesson.title}</p>
                      <Badge variant={TYPE_BADGE_VARIANTS[lesson.type]}>
                        {TYPE_LABELS[lesson.type]}
                      </Badge>
                      {lesson.isPreview && (
                        <Badge variant="outline" className="gap-1">
                          <Eye className="h-3 w-3" /> Preview
                        </Badge>
                      )}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {lesson.description || 'No description'}
                      {lesson.duration && ` · ${Math.floor(lesson.duration / 60)}:${String(lesson.duration % 60).padStart(2, '0')}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(lesson)}
                      aria-label="Edit lesson"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setDeleteConfirm(lesson)}
                      disabled={deleteLesson.isPending}
                      aria-label="Delete lesson"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add/Edit dialog */}
      <Dialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setEditingLesson(null)
        }}
      >
        <DialogContent className="max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingLesson ? 'Edit Lesson' : 'Add Lesson'}</DialogTitle>
            <DialogDescription>
              {editingLesson
                ? 'Update the lesson title, description, or settings.'
                : 'Create a new lesson — video, text, quiz, or assignment.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Lesson Title</Label>
              <Input placeholder="Introduction to Variables" {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Description (optional)</Label>
              <textarea
                className="flex min-h-20 w-full rounded-2xl border border-input bg-card px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/50"
                placeholder="What will students learn in this lesson?"
                {...register('description')}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Lesson Type</Label>
                <Select
                  value={watch('type')}
                  onValueChange={(v) => setValue('type', v as LessonType, { shouldValidate: true })}
                >
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VIDEO">Video</SelectItem>
                    <SelectItem value="TEXT">Text / Article</SelectItem>
                    <SelectItem value="QUIZ">Quiz</SelectItem>
                    <SelectItem value="ASSIGNMENT">Assignment</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Duration (seconds, optional)</Label>
                <Input type="number" min={0} placeholder="600" {...register('duration')} />
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border p-4">
              <Switch
                checked={watch('isPreview') ?? false}
                onCheckedChange={(v) => setValue('isPreview', v)}
                id="is-preview"
              />
              <Label htmlFor="is-preview" className="cursor-pointer">
                <div className="flex items-center gap-2">
                  {watch('isPreview') ? (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span>Allow preview without enrollment</span>
                </div>
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={createLesson.isPending || updateLessonHook.isPending}>
              {(createLesson.isPending || updateLessonHook.isPending)
                ? 'Saving…'
                : editingLesson
                  ? 'Save Changes'
                  : 'Add Lesson'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteConfirm} onOpenChange={(open) => !open && setDeleteConfirm(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete lesson?</DialogTitle>
            <DialogDescription>
              {deleteConfirm && (
                <>
                  Are you sure you want to delete <strong>"{deleteConfirm.title}"</strong>?
                  This will also remove any student progress on this lesson. This action cannot be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLesson.isPending}>
              {deleteLesson.isPending ? 'Deleting…' : 'Delete'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
