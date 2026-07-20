import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, useParams, Link } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { toast } from 'sonner'
import { PageShell } from '@/components/common/PageShell'
import { PageSkeleton } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useCourse, useUpdateCourse } from '@/hooks/useCourseData'

const schema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  description: z.string().trim().optional(),
  category: z.string().min(1, 'Select a category'),
  price: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
})
type EditCourseValues = z.infer<typeof schema>

export function CourseEditPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()

  const courseQuery = useCourse(courseId)
  const updateCourse = useUpdateCourse(courseId!)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<EditCourseValues>({ resolver: zodResolver(schema) })

  const course = courseQuery.data

  // Populate form once the course data loads
  useEffect(() => {
    if (!course) return
    reset({
      title: course.title,
      description: course.description || '',
      category: course.category?.name || '',
      price: course.price ? String(course.price) : '',
      status: course.status as EditCourseValues['status'],
    })
  }, [course, reset])

  const onSubmit = (values: EditCourseValues) => {
    updateCourse.mutate(
      {
        title: values.title,
        description: values.description,
        category: values.category,
        price: values.price ? Number(values.price) : 0,
        status: values.status,
      },
      {
        onSuccess: () => {
          toast.success('Course updated!')
          navigate('/teacher/courses')
        },
        onError: () => {
          toast.error('Could not update the course. Please check the details and try again.')
        },
      }
    )
  }

  if (courseQuery.isLoading) {
    return (
      <PageShell title="Edit Course" description="Loading course details...">
        <PageSkeleton />
      </PageShell>
    )
  }

  if (courseQuery.isError || !course) {
    return (
      <PageShell title="Edit Course" description="Could not load course details">
        <ErrorState
          message="We couldn't find this course. It may have been deleted or you may not have permission to edit it."
          onRetry={() => courseQuery.refetch()}
        />
      </PageShell>
    )
  }

  const currentStatus = watch('status')

  return (
    <PageShell
      title="Edit Course"
      description={`Updating "${course.title}"`}
      actions={
        <Button variant="outline" size="sm" asChild>
          <Link to="/teacher/courses">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to courses
          </Link>
        </Button>
      }
    >
      <Card>
        <CardContent className="p-6 space-y-5">
          <div className="flex items-center gap-3 rounded-2xl bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
            <span>Status:</span>
            <span className={`font-medium ${currentStatus === 'PUBLISHED' ? 'text-emerald-600' : currentStatus === 'DRAFT' ? 'text-amber-600' : 'text-muted-foreground'}`}>
              {currentStatus === 'PUBLISHED' ? 'Published' : currentStatus === 'DRAFT' ? 'Draft' : 'Archived'}
            </span>
            <span className="text-muted-foreground">·</span>
            <span>{course.enrollmentCount} enrolled student{course.enrollmentCount === 1 ? '' : 's'}</span>
            <span className="text-muted-foreground">·</span>
            <span>{course.lessonCount} lesson{course.lessonCount === 1 ? '' : 's'}</span>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label>Course Title</Label>
              <Input placeholder="Introduction to Data Science" {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <textarea
                className="flex min-h-24 w-full rounded-2xl border border-input bg-card px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/50"
                placeholder="Course description..."
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={watch('category')}
                  onValueChange={(v) => setValue('category', v, { shouldValidate: true })}
                >
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Mathematics">Mathematics</SelectItem>
                    <SelectItem value="Science">Science</SelectItem>
                    <SelectItem value="Technology">Technology</SelectItem>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Arts">Arts</SelectItem>
                    <SelectItem value="Business">Business</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Price ($, optional)</Label>
                <Input type="number" min="0" step="0.01" placeholder="0" {...register('price')} />
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={currentStatus}
                  onValueChange={(v) => setValue('status', v as EditCourseValues['status'], { shouldValidate: true })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PUBLISHED">Published</SelectItem>
                    <SelectItem value="DRAFT">Draft</SelectItem>
                    <SelectItem value="ARCHIVED">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={updateCourse.isPending}>
                <Save className="mr-2 h-4 w-4" />
                {updateCourse.isPending ? 'Saving…' : 'Save Changes'}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link to="/teacher/courses">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  )
}
