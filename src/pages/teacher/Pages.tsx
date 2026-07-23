import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import {
  BookOpen,
  CheckCircle2,
  FileText,
  GraduationCap,
  Megaphone,
  Pencil,
  Play,
  Users,
  X,
} from 'lucide-react'
import { PageShell } from '@/components/common/PageShell'
import { PageSkeleton } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { useCreateCourse, useMyCourses } from '@/hooks/useCourseData'
import { useAssignmentList, useCreateAssignment } from '@/hooks/useAssignmentData'
import { useAutoRoster } from '@/hooks/useAttendanceData'
import { useGradebook } from '@/hooks/useGradebookData'
import { useAnnouncementList, useCreateAnnouncement } from '@/hooks/useAnnouncementData'
import type { ApiAssignment, ApiAnnouncement } from '@/types'


const schema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters'),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  category: z.string().min(1, 'Select a category'),
  price: z.string().optional(), // empty = free (0)
})
type CreateCourseValues = z.infer<typeof schema>

export function CreateCoursePage() {
  const navigate = useNavigate()

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CreateCourseValues>({ resolver: zodResolver(schema) })
  const createCourse = useCreateCourse()




  const onSubmit = (values: CreateCourseValues) => {
    createCourse.mutate(
      {
        title: values.title,
        description: values.description,
        category: values.category,
        price: values.price ? Number(values.price) : 0,
        status: 'PUBLISHED',
      },
      {
        onSuccess: () => {
          toast.success('Course created!')
          navigate('/teacher/courses')
        },
        onError: () => {
          toast.error('Could not create the course. Please check the details and try again.')
        },
      }
    )
  }

  return (
    <PageShell title="Create Course" description="Set up a new course for your students">
      <Card>
        <CardContent className="p-6 space-y-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2"><Label>Course Title</Label><Input placeholder="Introduction to Data Science" {...register('title')} />{errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}</div>
            <div className="space-y-2"><Label>Description</Label><Input placeholder="Course description..." {...register('description')} />{errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Category</Label>
                <Select onValueChange={(v) => setValue('category', v, { shouldValidate: true })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="Mathematics">Mathematics</SelectItem><SelectItem value="Science">Science</SelectItem><SelectItem value="Technology">Technology</SelectItem></SelectContent>
                </Select>
                {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
              </div>
              <div className="space-y-2"><Label>Price ($, optional)</Label><Input type="number" min="0" step="0.01" placeholder="0" {...register('price')} /></div>
            </div>
            <Button type="submit" disabled={createCourse.isPending}>
              {createCourse.isPending ? 'Creating…' : 'Create Course'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  )
}

export function TeacherCoursesPage() {
  const coursesQuery = useMyCourses()
  const courses = coursesQuery.data ?? []

  if (coursesQuery.isLoading) {
    return (
      <PageShell title="Manage Courses" description="View and manage your courses">
        <PageSkeleton />
      </PageShell>
    )
  }

  if (coursesQuery.isError) {
    return (
      <PageShell title="Manage Courses" description="View and manage your courses">
        <ErrorState message="Could not load your courses. Please try again." onRetry={() => coursesQuery.refetch()} />
      </PageShell>
    )
  }

  return (
    <PageShell title="Manage Courses" description="View and manage your courses" searchable searchPlaceholder="Search courses...">
      {courses.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No courses yet"
          description="Create your first course to get started."
        />
      ) : (
        <div className="grid gap-4">
          {courses.map((course) => (
            <Card key={course.id}><CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="font-semibold">{course.title}</p>
                <p className="text-sm text-muted-foreground">{course.enrollmentCount ?? 0} students · {course.lessonCount ?? 0} lessons</p>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/teacher/courses/${course.id}/edit`}>
                  <Pencil className="mr-1.5 h-3.5 w-3.5" />
                  Edit
                </Link>
              </Button>
            </CardContent></Card>
          ))}
        </div>
      )}
    </PageShell>
  )
}

const assignmentSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(150),
  courseId: z.string().uuid('Select a course'),
  description: z.string().trim().max(2000).optional(),
  dueDate: z.string().optional(), // empty = no due date
})
type AssignmentFormValues = z.infer<typeof assignmentSchema>

export function TeacherAssignmentsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [courseFilter, setCourseFilter] = useState<string>('all')

  const coursesQuery = useMyCourses()
  const courses = coursesQuery.data ?? []

  // Global list with a client-side course filter — the backend already
  // returns "all my assignments across my courses" when no courseId is passed.
  const assignmentsQuery = useAssignmentList(courseFilter === 'all' ? undefined : courseFilter)
  const assignments = assignmentsQuery.data?.assignments ?? []

  const createAssignment = useCreateAssignment()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AssignmentFormValues>({ resolver: zodResolver(assignmentSchema) })

  const onSubmit = (values: AssignmentFormValues) => {
    createAssignment.mutate(
      {
        title: values.title,
        courseId: values.courseId,
        description: values.description || undefined,
        dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
      },
      {
        onSuccess: () => {
          toast.success('Assignment created!')
          reset()
          setDialogOpen(false)
        },
        onError: () => {
          toast.error('Could not create the assignment. Please check the details and try again.')
        },
      }
    )
  }

  const isLoading = coursesQuery.isLoading || assignmentsQuery.isLoading
  const isError = coursesQuery.isError || assignmentsQuery.isError

  return (
    <PageShell
      title="Assignments"
      description="Create and manage assignments"
      actions={<Button onClick={() => setDialogOpen(true)}>Create Assignment</Button>}
    >
      <div className="mb-4 max-w-xs">
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger><SelectValue placeholder="Filter by course" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All courses</SelectItem>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <PageSkeleton />
      ) : isError ? (
        <ErrorState message="Could not load assignments. Please try again." onRetry={() => assignmentsQuery.refetch()} />
      ) : assignments.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No assignments yet"
          description="Create your first assignment to get started."
        />
      ) : (
        <div className="space-y-3">
          {assignments.map((assignment: ApiAssignment) => (
            <Card key={assignment.id}><CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="font-medium">{assignment.title}</p>
                <p className="text-sm text-muted-foreground">
                  {assignment.course.title} · {assignment.submissionCount} submission{assignment.submissionCount === 1 ? '' : 's'}
                  {assignment.dueDate && ` · Due ${new Date(assignment.dueDate).toLocaleDateString()}`}
                </p>
              </div>
              <Link to={`/teacher/assignments/${assignment.id}/submissions`}>
                <Button variant="outline" size="sm">Grade</Button>
              </Link>
            </CardContent></Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Assignment</DialogTitle>
            <DialogDescription>Set a title, optional instructions, and an optional due date.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Problem Set #6" {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Course</Label>
              <Select onValueChange={(v) => setValue('courseId', v, { shouldValidate: true })}>
                <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.courseId && <p className="text-xs text-destructive">{errors.courseId.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Description / instructions (optional)</Label>
              <textarea
                className="flex min-h-24 w-full rounded-2xl border border-input bg-card px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/50"
                placeholder="What should students do for this assignment?"
                {...register('description')}
              />
            </div>
            <div className="space-y-2">
              <Label>Due date (optional)</Label>
              <Input type="date" {...register('dueDate')} />
            </div>
            <Button type="submit" disabled={createAssignment.isPending}>
              {createAssignment.isPending ? 'Creating…' : 'Create Assignment'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}

function toIsoDate(d: Date) {
  return d.toISOString().split('T')[0]
}

export function TeacherAttendancePage() {
  const [courseId, setCourseId] = useState<string>('')
  const [date, setDate] = useState<string>(toIsoDate(new Date()))

  const coursesQuery = useMyCourses()
  const courses = coursesQuery.data ?? []

  // Default to the first course once courses load, if none picked yet.
  if (!courseId && courses.length > 0) setCourseId(courses[0].id)

  // ── Auto attendance (from lesson completion) ────────────────────────────
  const autoRosterQuery = useAutoRoster(courseId || undefined, date)
  const autoRoster = autoRosterQuery.data?.roster ?? []
  const autoLessons = autoRosterQuery.data?.lessons ?? []

  return (
    <PageShell
      title="Attendance"
      description="Auto-tracked from lesson completion"
    >
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="max-w-xs flex-1">
          <Select value={courseId} onValueChange={setCourseId}>
            <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
            <SelectContent>
              {courses.map((course) => (
                <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Input
          type="date"
          value={date}
          max={toIsoDate(new Date())}
          onChange={(e) => setDate(e.target.value)}
          className="max-w-[180px]"
        />
      </div>

      <div className="space-y-4">
        {autoLessons.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {autoLessons.length} lesson{autoLessons.length === 1 ? '' : 's'} on this date:
            </span>
            {autoLessons.map((lesson: any) => (
              <Badge key={lesson.id} variant="secondary" className="gap-1.5">
                <Play className="h-3 w-3" />
                {lesson.title}
              </Badge>
            ))}
          </div>
        )}

        {autoRosterQuery.isLoading ? (
          <PageSkeleton />
        ) : autoRosterQuery.isError ? (
          <ErrorState message="Could not load attendance. Please try again." onRetry={() => autoRosterQuery.refetch()} />
        ) : autoLessons.length === 0 ? (
          <EmptyState
            icon={Play}
            title="No lessons on this date"
            description="No lessons were created on this date. Try a different date when a lesson was uploaded."
          />
        ) : autoRoster.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No enrolled students"
            description="This course has no active enrollments yet."
          />
        ) : (
          <Card><CardContent className="p-0">
            <table className="w-full">
              <thead><tr className="border-b"><th className="p-4 text-left text-sm font-medium">Student</th><th className="p-4 text-left text-sm font-medium">Status</th></tr></thead>
              <tbody>
                {autoRoster.map((student: any) => {
                  const isPresent = student.status === 'PRESENT'
                  return (
                    <tr key={student.userId} className="border-b">
                      <td className="p-4 text-sm">{student.name}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {isPresent ? (
                            <span className="flex items-center gap-1.5 text-sm text-emerald-600">
                              <CheckCircle2 className="h-4 w-4" />
                              Present — Completed lesson
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-sm text-destructive">
                              <X className="h-4 w-4" />
                              Absent — Not completed yet
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <div className="border-t px-4 py-3 text-xs text-muted-foreground">
              Attendance is auto-computed from lesson completion. Students who completed any lesson on this date are marked Present.
            </div>
          </CardContent></Card>
        )}
      </div>
    </PageShell>
  )
}

export function GradebookPage() {
  const [courseId, setCourseId] = useState<string>('')

  const coursesQuery = useMyCourses()
  const courses = coursesQuery.data ?? []
  if (!courseId && courses.length > 0) setCourseId(courses[0].id)

  const gradebookQuery = useGradebook(courseId || undefined)
  const gradebook = gradebookQuery.data

  const isLoading = coursesQuery.isLoading || gradebookQuery.isLoading

  return (
    <PageShell title="Gradebook" description="View and manage student grades">
      <div className="mb-4 max-w-xs">
        <Select value={courseId} onValueChange={setCourseId}>
          <SelectTrigger><SelectValue placeholder="Select a course" /></SelectTrigger>
          <SelectContent>
            {courses.map((course) => (
              <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <PageSkeleton />
      ) : gradebookQuery.isError ? (
        <ErrorState message="Could not load the gradebook. Please try again." onRetry={() => gradebookQuery.refetch()} />
      ) : !gradebook || gradebook.rows.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No grades yet"
          description="No enrolled students or graded work found for this course yet."
        />
      ) : (
        <Card><CardContent className="p-0 overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead><tr className="border-b bg-muted/50">
              <th className="p-4 text-left text-sm font-medium">Student</th>
              {gradebook.quizzes.map((q) => (<th key={q.id} className="p-4 text-left text-sm font-medium">{q.title}</th>))}
              {gradebook.assignments.map((a) => (<th key={a.id} className="p-4 text-left text-sm font-medium">{a.title}</th>))}
              <th className="p-4 text-left text-sm font-medium">Overall</th>
            </tr></thead>
            <tbody>
              {gradebook.rows.map((row) => (
                <tr key={row.userId} className="border-b">
                  <td className="p-4 text-sm font-medium">{row.name}</td>
                  {gradebook.quizzes.map((q) => {
                    const result = row.quizzes.find((r) => r.quizId === q.id)
                    return <td key={q.id} className="p-4 text-sm">{result ? `${result.score}%` : '—'}</td>
                  })}
                  {gradebook.assignments.map((a) => {
                    const result = row.assignments.find((r) => r.assignmentId === a.id)
                    return (
                      <td key={a.id} className="p-4 text-sm">
                        {result ? (result.grade !== null ? `${result.grade}` : 'Ungraded') : '—'}
                      </td>
                    )
                  })}
                  <td className="p-4 text-sm">
                    {row.overallGrade !== null ? (
                      <span className="font-bold text-primary">{row.overallGrade}%</span>
                    ) : (
                      <span className="text-muted-foreground">No grades yet</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent></Card>
      )}
    </PageShell>
  )
}

const announcementSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(150),
  body: z.string().trim().min(1, 'Announcement body is required').max(5000),
  courseId: z.string().optional(), // '' or 'all' = broadcast to every course
})
type AnnouncementFormValues = z.infer<typeof announcementSchema>

export function AnnouncementsPage() {
  const [dialogOpen, setDialogOpen] = useState(false)

  // No filter dropdown needed here (unlike Assignments) — the backend already
  // scopes the list to "my announcements across all my courses" for an
  // instructor when no courseId is passed.
  const announcementsQuery = useAnnouncementList()
  const announcements = announcementsQuery.data?.announcements ?? []

  const coursesQuery = useMyCourses()
  const courses = coursesQuery.data ?? []

  const createAnnouncement = useCreateAnnouncement()

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<AnnouncementFormValues>({ resolver: zodResolver(announcementSchema) })

  const onSubmit = (values: AnnouncementFormValues) => {
    createAnnouncement.mutate(
      {
        title: values.title,
        body: values.body,
        courseId: !values.courseId || values.courseId === 'all' ? null : values.courseId,
      },
      {
        onSuccess: () => {
          toast.success('Announcement posted!')
          reset()
          setDialogOpen(false)
        },
        onError: () => toast.error('Could not post the announcement. Please try again.'),
      }
    )
  }

  const isLoading = announcementsQuery.isLoading || coursesQuery.isLoading

  return (
    <PageShell
      title="Announcements"
      description="Post announcements to your classes"
      actions={<Button onClick={() => setDialogOpen(true)}>New Announcement</Button>}
    >
      {isLoading ? (
        <PageSkeleton />
      ) : announcementsQuery.isError ? (
        <ErrorState message="Could not load announcements. Please try again." onRetry={() => announcementsQuery.refetch()} />
      ) : announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          description="Post your first announcement to notify your students."
        />
      ) : (
        <div className="space-y-3">
          {announcements.map((a: ApiAnnouncement) => (
            <Card key={a.id}><CardContent className="p-5">
              <p className="font-medium">{a.title}</p>
              <p className="mb-2 text-sm text-muted-foreground">
                {a.course ? a.course.title : 'All Courses'} · {new Date(a.createdAt).toLocaleDateString()}
              </p>
              <p className="text-sm">{a.body}</p>
            </CardContent></Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Announcement</DialogTitle>
            <DialogDescription>Post to one course, or broadcast to every course you teach.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input placeholder="Mid-term Exam Schedule" {...register('title')} />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>Course</Label>
              <Select defaultValue="all" onValueChange={(v) => setValue('courseId', v)}>
                <SelectTrigger><SelectValue placeholder="All Courses" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>{course.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Message</Label>
              <textarea
                className="flex min-h-24 w-full rounded-2xl border border-input bg-card px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-primary/50"
                placeholder="What do your students need to know?"
                {...register('body')}
              />
              {errors.body && <p className="text-xs text-destructive">{errors.body.message}</p>}
            </div>
            <Button type="submit" disabled={createAnnouncement.isPending}>
              {createAnnouncement.isPending ? 'Posting…' : 'Post Announcement'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
