import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate, Link } from 'react-router-dom'
import { BookOpen, FileText, Users, GraduationCap, Megaphone, Pencil } from 'lucide-react'
import { PageShell } from '@/components/common/PageShell'
import { PageSkeleton } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
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
import { useRoster, useMarkAttendance } from '@/hooks/useAttendanceData'
import { useGradebook } from '@/hooks/useGradebookData'
import { useAnnouncementList, useCreateAnnouncement } from '@/hooks/useAnnouncementData'
import type { ApiAssignment, ApiAnnouncement } from '@/types'

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '@/services/api'

import axios from 'axios'
import { Upload, Video, ImagePlus, FileText, X, CheckCircle2, Mail, Calendar, BookOpen, Users, Play, Briefcase, Plus, Trash2, Edit3, ArrowLeft, Eye, Layers } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'

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

    <PageShell
      title="Manage Courses"
      description="View, edit, publish, or delete your courses"
      actions={<Button onClick={() => navigate('/teacher/create-course')}>+ New Course</Button>}
    >
      <div className="grid gap-4">
        {courses.length === 0 ? (
          <div className="text-center py-16 border border-dashed rounded-2xl text-muted-foreground">
            <p className="text-lg font-medium">No courses yet</p>
            <p className="text-sm mt-1">Create your first course to get started.</p>
            <Button className="mt-4" onClick={() => navigate('/teacher/create-course')}>+ Create Course</Button>
          </div>
        ) : (
          courses.map((course) => (
            <Card key={course.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex gap-4 p-5">
                  {/* Thumbnail */}
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="h-20 w-32 rounded-xl object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="h-20 w-32 rounded-xl bg-muted flex items-center justify-center flex-shrink-0 text-muted-foreground text-xs">
                      No image
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <p className="font-semibold text-base leading-snug">{course.title}</p>
                        <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                          {course.description || 'No description provided.'}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${statusColors[course.status] || statusColors.DRAFT}`}>
                            {course.status}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {course.enrollmentCount || 0} students · {course.lessonCount || 0} lessons
                          </span>
                          {course.price > 0 && (
                            <span className="text-xs font-semibold text-primary">₹{course.price}</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {/* Status quick-toggle */}
                        <Select
                          value={course.status}
                          onValueChange={(val) => handleStatusChange(course.id, val)}
                          disabled={statusLoading === course.id}
                        >
                          <SelectTrigger className="h-8 text-xs w-[120px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DRAFT">Draft</SelectItem>
                            <SelectItem value="PUBLISHED">Published</SelectItem>
                            <SelectItem value="ARCHIVED">Archived</SelectItem>
                          </SelectContent>
                        </Select>

                        {/* Lessons button */}
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => navigate(`/teacher/courses/${course.id}/lessons`)}
                        >
                          <Play className="h-3.5 w-3.5 mr-1 text-primary" /> Lessons
                        </Button>

                        {/* Edit button */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEdit(course)}
                        >
                          Edit
                        </Button>

                        {/* Delete button */}
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteCourseId(course.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* ── Edit Dialog ──────────────────────────────────────────────────────── */}
      {editCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">Edit Course</h2>
              <button onClick={() => setEditCourse(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Course Title</Label>
                <Input
                  id="edit-title"
                  value={editForm.title}
                  onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Course title"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  rows={4}
                  value={editForm.description}
                  onChange={e => setEditForm(f => ({ ...f, description: e.target.value }))}
                  placeholder="Course description"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Price (₹)</Label>
                  <Input
                    id="edit-price"
                    type="number"
                    value={editForm.price}
                    onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                    placeholder="0 for free"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={editForm.status} onValueChange={val => setEditForm(f => ({ ...f, status: val }))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
  // Local optimistic edits before "Save Attendance" is pressed — keyed by userId.
  const [pendingStatus, setPendingStatus] = useState<Record<string, 'PRESENT' | 'ABSENT'>>({})

  const coursesQuery = useMyCourses()
  const courses = coursesQuery.data ?? []

  // Default to the first course once courses load, if none picked yet.
  if (!courseId && courses.length > 0) setCourseId(courses[0].id)

  const rosterQuery = useRoster(courseId || undefined, date)
  const roster = rosterQuery.data ?? []
  const markAttendance = useMarkAttendance(courseId, date)

  const statusFor = (userId: string, defaultStatus: 'PRESENT' | 'ABSENT' | null) =>
    pendingStatus[userId] ?? defaultStatus ?? 'PRESENT' // unmarked days default to Present — mark the exceptions

  const toggle = (userId: string, current: 'PRESENT' | 'ABSENT') => {
    setPendingStatus((prev) => ({ ...prev, [userId]: current === 'PRESENT' ? 'ABSENT' : 'PRESENT' }))
  }

  const handleSave = () => {
    const records = roster.map((s) => ({ userId: s.userId, status: statusFor(s.userId, s.status) }))
    markAttendance.mutate(
      { courseId, date, records },
      {
        onSuccess: () => {
          const presentCount = records.filter((r) => r.status === 'PRESENT').length
          toast.success(`Attendance saved for ${date} — ${presentCount} present, ${records.length - presentCount} absent.`)
          setPendingStatus({})
        },
        onError: () => toast.error('Could not save attendance. Please try again.'),
      }
    )
  }

  const isLoading = coursesQuery.isLoading || rosterQuery.isLoading

  return (
    <PageShell
      title="Attendance"
      description="Mark and manage student attendance"
      actions={
        <Button onClick={handleSave} disabled={!courseId || roster.length === 0 || markAttendance.isPending}>
          {markAttendance.isPending ? 'Saving…' : 'Save Attendance'}
        </Button>
      }
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
          onChange={(e) => { setDate(e.target.value); setPendingStatus({}) }}
          className="max-w-[180px]"
        />
      </div>

      {isLoading ? (
        <PageSkeleton />
      ) : rosterQuery.isError ? (
        <ErrorState message="Could not load the roster. Please try again." onRetry={() => rosterQuery.refetch()} />
      ) : roster.length === 0 ? (
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
              {roster.map((student) => {
                const status = statusFor(student.userId, student.status)
                const isPresent = status === 'PRESENT'
                return (
                  <tr key={student.userId} className="border-b">
                    <td className="p-4 text-sm">{student.name}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Switch checked={isPresent} onCheckedChange={() => toggle(student.userId, status)} />
                        <span className={isPresent ? 'text-xs text-emerald-600' : 'text-xs text-destructive'}>
                          {isPresent ? 'Present' : 'Absent'}
                        </span>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </CardContent></Card>
      )}
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
                
export function TeacherProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [myCourses, setMyCourses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [userRes, coursesRes] = await Promise.all([
          api.get('/users/me'),
          api.get('/courses/my'),
        ])
        setUser(userRes.data.data.user)
        setMyCourses(coursesRes.data.data.courses || [])
      } catch {
        toast.error('Failed to load profile.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchAll()
  }, [])

  const totalStudents = myCourses.reduce((sum: number, c: any) => sum + (c.enrollmentCount || 0), 0)
  const totalLessons  = myCourses.reduce((sum: number, c: any) => sum + (c.lessonCount  || 0), 0)
  const publishedCount = myCourses.filter((c: any) => c.status === 'PUBLISHED').length
  const draftCount     = myCourses.filter((c: any) => c.status === 'DRAFT').length

  if (isLoading) {
    return (
      <PageShell title="My Profile" description="Your instructor profile">
        <div className="space-y-4">
          <div className="h-48 rounded-2xl bg-muted animate-pulse" />
          <div className="grid grid-cols-4 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
          </div>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell title="My Profile" description="Your instructor profile and teaching overview">

      {/* ── Profile Banner ── */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {/* Banner gradient */}
          <div className="h-36 bg-gradient-to-r from-primary/80 via-primary to-violet-600 relative">
            <div className="absolute inset-0 opacity-20"
              style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}
            />
          </div>

          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
              <div className="flex items-end gap-4 -mt-14">
                {/* Avatar */}
                <div className="relative">
                  <div className="h-24 w-24 rounded-2xl border-4 border-card shadow-xl overflow-hidden bg-primary/10 flex items-center justify-center">
                    {user?.avatar ? (
                      <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-3xl font-bold text-primary">{user?.name?.[0] || 'T'}</span>
                    )}
                  </div>
                  <span className="absolute -bottom-1 -right-1 bg-emerald-500 rounded-full w-5 h-5 border-2 border-card" title="Active" />
                </div>
                <div className="pb-1">
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs bg-primary/10 text-primary font-semibold px-2.5 py-0.5 rounded-full border border-primary/20">
                      INSTRUCTOR
                    </span>
                    <span className="text-sm text-muted-foreground">LearnFlow Academy</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" className="shrink-0">Edit Profile</Button>
            </div>

            {/* Info row */}
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4">
                <Mail className="h-5 w-5 text-muted-foreground shrink-0" />
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4">
                <Briefcase className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="text-sm font-medium">Instructor</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4">
                <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Member Since</p>
                  <p className="text-sm font-medium">
                    {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Stats ── */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <BookOpen className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{myCourses.length}</p>
              <p className="text-xs text-muted-foreground">Total Courses</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
              <Users className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalStudents}</p>
              <p className="text-xs text-muted-foreground">Total Students</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center shrink-0">
              <Play className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalLessons}</p>
              <p className="text-xs text-muted-foreground">Total Lessons</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-violet-500/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{publishedCount}</p>
              <p className="text-xs text-muted-foreground">Published · {draftCount} Draft</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── My Courses ── */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" /> My Courses
          </h3>
          {myCourses.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              You haven't created any courses yet.
            </p>
          ) : (
            <div className="space-y-3">
              {myCourses.map((course: any) => (
                <div key={course.id} className="flex items-center gap-4 rounded-2xl border p-4 hover:bg-muted/30 transition-colors">
                  {course.thumbnail ? (
                    <img src={course.thumbnail} alt={course.title} className="h-12 w-16 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="h-12 w-16 rounded-xl bg-muted flex items-center justify-center shrink-0 text-xs text-muted-foreground">No img</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{course.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {course.enrollmentCount || 0} students · {course.lessonCount || 0} lessons
                    </p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium border shrink-0 ${
                    course.status === 'PUBLISHED' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' :
                    course.status === 'DRAFT'     ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                    'bg-muted text-muted-foreground border-border'
                  }`}>
                    {course.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ── Teaching Highlights ── */}
      <Card>
        <CardContent className="p-6">
          <h3 className="text-base font-semibold mb-4">Teaching Highlights</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Course Completion Rate', value: '78%', color: 'text-primary' },
              { label: 'Avg. Student Rating',    value: '4.8 ★', color: 'text-amber-500' },
              { label: 'Avg. Assignment Score',  value: '84%',   color: 'text-emerald-600' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-muted/50 p-5 text-center">
                <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </PageShell>
  )
}

export function TeacherManageLessonsPage() {
  const { courseId } = useParams<{ courseId: string }>()
  const navigate = useNavigate()

  const [course, setCourse] = useState<any>(null)
  const [lessons, setLessons] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Add / Edit Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLesson, setEditingLesson] = useState<any | null>(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'VIDEO',
    videoUrl: '',
    content: '',
    order: 1,
    isPreview: false,
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Delete Modal state
  const [deletingLessonId, setDeletingLessonId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchData = async () => {
    if (!courseId) return
    setIsLoading(true)
    try {
      const [courseRes, lessonsRes] = await Promise.all([
        api.get(`/courses/${courseId}`),
        api.get(`/courses/${courseId}/lessons`),
      ])
      setCourse(courseRes.data.data.course)
      setLessons(lessonsRes.data.data.lessons || [])
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load lessons.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [courseId])

  const openAddModal = () => {
    setEditingLesson(null)
    setForm({
      title: '',
      description: '',
      type: 'VIDEO',
      videoUrl: '',
      content: '',
      order: lessons.length + 1,
      isPreview: false,
    })
    setVideoFile(null)
    setUploadProgress(null)
    setIsModalOpen(true)
  }

  const openEditModal = (lesson: any) => {
    setEditingLesson(lesson)
    setForm({
      title: lesson.title || '',
      description: lesson.description || '',
      type: lesson.type || 'VIDEO',
      videoUrl: lesson.videoUrl || '',
      content: lesson.content || '',
      order: lesson.order || 1,
      isPreview: !!lesson.isPreview,
    })
    setVideoFile(null)
    setUploadProgress(null)
    setIsModalOpen(true)
  }

  const uploadToCloudinary = async (file: File, type: 'video' | 'image' | 'raw') => {
    const { data: signRes } = await api.get(`/uploads/sign-cloudinary?type=${type}`)
    const { signature, timestamp, folder } = signRes.data

    const cloudName = signRes.data.cloudName || import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
    const apiKey    = signRes.data.apiKey    || import.meta.env.VITE_CLOUDINARY_API_KEY

    if (!cloudName || !apiKey) {
      throw new Error('Cloudinary is not configured.')
    }

    const formData = new FormData()
    formData.append('file', file)
    formData.append('api_key', apiKey)
    formData.append('timestamp', timestamp.toString())
    formData.append('signature', signature)
    formData.append('folder', folder)

    const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${type}/upload`
    const { data: uploadRes } = await axios.post(uploadUrl, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          setUploadProgress(percent)
        }
      }
    })
    return uploadRes.secure_url
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Lesson title is required.')
      return
    }

    setIsSaving(true)
    let finalVideoUrl = form.videoUrl

    try {
      if (form.type === 'VIDEO' && videoFile) {
        setIsUploading(true)
        finalVideoUrl = await uploadToCloudinary(videoFile, 'video')
        setIsUploading(false)
      }

      const payload = {
        title: form.title,
        description: form.description,
        type: form.type,
        videoUrl: finalVideoUrl,
        content: form.content,
        order: Number(form.order) || 1,
        isPreview: form.isPreview,
      }

      if (editingLesson) {
        const { data } = await api.patch(`/courses/${courseId}/lessons/${editingLesson.id}`, payload)
        setLessons(prev => prev.map(l => l.id === editingLesson.id ? data.data.lesson : l))
        toast.success('Lesson updated successfully!')
      } else {
        const { data } = await api.post(`/courses/${courseId}/lessons`, payload)
        setLessons(prev => [...prev, data.data.lesson])
        toast.success('Lesson created successfully!')
      }
      setIsModalOpen(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save lesson.')
    } finally {
      setIsSaving(false)
      setIsUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingLessonId || !courseId) return
    setIsDeleting(true)
    try {
      await api.delete(`/courses/${courseId}/lessons/${deletingLessonId}`)
      setLessons(prev => prev.filter(l => l.id !== deletingLessonId))
      toast.success('Lesson deleted.')
      setDeletingLessonId(null)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete lesson.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <PageShell title="Manage Lessons" description="Loading course content...">
        <div className="text-center py-12 text-muted-foreground">Loading lessons...</div>
      </PageShell>
    )
  }

  return (
    <PageShell
      title={course ? `Manage Lessons: ${course.title}` : 'Manage Lessons'}
      description="Create, reorder, or update lessons for this course"
      actions={
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/teacher/courses')}>
            <ArrowLeft className="h-4 w-4 mr-1.5" /> Back to Courses
          </Button>
          <Button onClick={openAddModal}>
            <Plus className="h-4 w-4 mr-1.5" /> Add Lesson
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {lessons.length === 0 ? (
          <Card className="text-center py-16 border-dashed">
            <CardContent className="space-y-3">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Play className="h-6 w-6" />
              </div>
              <p className="text-lg font-semibold">No lessons added yet</p>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Add video or text lessons to build out your course curriculum for students.
              </p>
              <Button onClick={openAddModal} className="mt-2">
                <Plus className="h-4 w-4 mr-1.5" /> Add First Lesson
              </Button>
            </CardContent>
          </Card>
        ) : (
          lessons
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map((lesson, index) => (
              <Card key={lesson.id} className="overflow-hidden hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-center gap-4">
                  {/* Order badge */}
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
                    #{lesson.order || index + 1}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-base">{lesson.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-md font-medium border bg-muted flex items-center gap-1">
                        {lesson.type === 'VIDEO' ? <Video className="h-3 w-3 text-blue-500" /> : <FileText className="h-3 w-3 text-amber-500" />}
                        {lesson.type}
                      </span>
                      {lesson.isPreview && (
                        <span className="text-xs px-2 py-0.5 rounded-md font-medium bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 flex items-center gap-1">
                          <Eye className="h-3 w-3" /> Free Preview
                        </span>
                      )}
                    </div>

                    {lesson.description && (
                      <p className="text-sm text-muted-foreground line-clamp-1">{lesson.description}</p>
                    )}

                    {lesson.videoUrl && (
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-mono truncate max-w-md">
                        🎥 {lesson.videoUrl}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(lesson)}>
                      <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => setDeletingLessonId(lesson.id)}>
                      <Trash2 className="h-3.5 w-3.5 mr-1" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
        )}
      </div>

      {/* ── Add / Edit Lesson Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 my-8">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold">
                {editingLesson ? 'Edit Lesson' : 'Add New Lesson'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              {/* Title */}
              <div className="space-y-1.5">
                <Label>Lesson Title *</Label>
                <Input
                  required
                  placeholder="e.g. Introduction to Derivatives"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  placeholder="Brief overview of what students will learn in this lesson..."
                  rows={3}
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                />
              </div>

              {/* Type & Order */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Lesson Type</Label>
                  <Select value={form.type} onValueChange={val => setForm({ ...form, type: val })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VIDEO">Video Lesson</SelectItem>
                      <SelectItem value="TEXT">Text / Article Lesson</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Lesson Order (#)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={form.order}
                    onChange={e => setForm({ ...form, order: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>

              {/* Video upload / URL if type === VIDEO */}
              {form.type === 'VIDEO' && (
                <div className="space-y-3 border rounded-xl p-4 bg-muted/30">
                  <Label className="text-sm font-semibold flex items-center gap-1.5">
                    <Video className="h-4 w-4 text-primary" /> Video File or URL
                  </Label>

                  {/* File upload option */}
                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground">Option 1: Upload Video File</span>
                    <input
                      type="file"
                      accept="video/*"
                      className="block w-full text-xs text-muted-foreground file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                      onChange={e => setVideoFile(e.target.files?.[0] || null)}
                    />
                    {videoFile && (
                      <p className="text-xs text-emerald-600 font-medium">Selected: {videoFile.name} ({(videoFile.size / (1024 * 1024)).toFixed(2)} MB)</p>
                    )}
                  </div>

                  <div className="relative flex items-center justify-center my-2">
                    <span className="bg-background px-2 text-[10px] text-muted-foreground uppercase">or</span>
                    <div className="absolute inset-0 border-t border-border -z-10" />
                  </div>

                  {/* Video URL option */}
                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground">Option 2: Direct Video URL</span>
                    <Input
                      placeholder="https://res.cloudinary.com/... or https://..."
                      value={form.videoUrl}
                      onChange={e => setForm({ ...form, videoUrl: e.target.value })}
                    />
                  </div>
                </div>
              )}

              {/* Text content if type === TEXT */}
              {form.type === 'TEXT' && (
                <div className="space-y-1.5">
                  <Label>Lesson Text Content</Label>
                  <Textarea
                    placeholder="Enter full lesson notes or instructions..."
                    rows={6}
                    value={form.content}
                    onChange={e => setForm({ ...form, content: e.target.value })}
                  />
                </div>
              )}

              {/* Is Preview Switch */}
              <div className="flex items-center justify-between rounded-xl border p-3 bg-muted/20">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Allow Free Preview</Label>
                  <p className="text-xs text-muted-foreground">Non-enrolled students can preview this lesson for free</p>
                </div>
                <Switch
                  checked={form.isPreview}
                  onCheckedChange={checked => setForm({ ...form, isPreview: checked })}
                />
              </div>

              {/* Upload Progress */}
              {uploadProgress !== null && (
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span>Uploading video to Cloudinary...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                  </div>
                </div>
              )}

              {/* Modal buttons */}
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving || isUploading}>
                  {isSaving ? (isUploading ? 'Uploading Video...' : 'Saving...') : (editingLesson ? 'Update Lesson' : 'Create Lesson')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deletingLessonId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="text-lg font-bold text-destructive">Delete Lesson?</h3>
            <p className="text-sm text-muted-foreground">
              Are you sure you want to delete this lesson? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDeletingLessonId(null)}>
                Cancel
              </Button>
              <Button variant="destructive" disabled={isDeleting} onClick={handleDelete}>
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageShell>
  )
}



