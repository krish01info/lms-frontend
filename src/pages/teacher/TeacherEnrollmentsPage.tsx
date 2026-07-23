import { useEffect, useState } from 'react'
import { GraduationCap, Search, UserPlus, X } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useMyCourses } from '@/hooks/useCourseData'
import { cn } from '@/utils/cn'
import api from '@/services/api'

interface EnrolledStudent {
  id: string
  userId: string
  status: string
  createdAt: string
  user: { id: string; name: string; email: string; avatar: string | null }
}

interface SearchResult {
  id: string
  name: string
  email: string
  role: string
}

export function TeacherEnrollmentsPage() {
  const [courseId, setCourseId] = useState('')
  const [enrollments, setEnrollments] = useState<EnrolledStudent[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Enroll dialog
  const [enrollOpen, setEnrollOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<SearchResult | null>(null)
  const [enrolling, setEnrolling] = useState(false)

  const coursesQuery = useMyCourses()
  const courses = coursesQuery.data ?? []
  if (!courseId && courses.length > 0) setCourseId(courses[0].id)

  // Load enrollments when courseId changes
  useEffect(() => {
    if (courseId) loadEnrollments(courseId)
  }, [courseId])

  // Load enrollments for selected course
  const loadEnrollments = async (id: string) => {
    if (!id) return
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get(`/enrollments/course/${id}`)
      setEnrollments(data.data.enrollments ?? [])
    } catch (err: any) {
      setError(err.response?.data?.message || 'Could not load enrollments.')
      setEnrollments([])
    } finally {
      setLoading(false)
    }
  }

  // Initial load when course changes
  const handleCourseChange = (id: string) => {
    setCourseId(id)
    loadEnrollments(id)
  }

  // Search for students
  const handleSearch = async (q: string) => {
    setSearchQuery(q)
    if (q.trim().length < 2) {
      setSearchResults([])
      return
    }
    setSearching(true)
    try {
      const { data } = await api.get('/users/search', { params: { q, role: 'STUDENT' } })
      setSearchResults(data.data.users ?? [])
    } catch {
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  // Enroll selected student
  const handleEnroll = async () => {
    if (!selectedStudent || !courseId) return
    setEnrolling(true)
    try {
      await api.post('/enrollments/instructor-enroll', {
        courseId,
        studentId: selectedStudent.id,
      })
      toast.success(`${selectedStudent.name} enrolled successfully!`)
      setEnrollOpen(false)
      setSelectedStudent(null)
      setSearchQuery('')
      setSearchResults([])
      loadEnrollments(courseId)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Could not enroll student.')
    } finally {
      setEnrolling(false)
    }
  }

  // Cancel enrollment
  const handleCancel = async (enrollmentId: string, studentName: string) => {
    try {
      await api.delete(`/enrollments/${enrollmentId}`)
      toast.success(`${studentName}'s enrollment cancelled.`)
      loadEnrollments(courseId)
    } catch {
      toast.error('Could not cancel enrollment.')
    }
  }

  const openEnroll = () => {
    setSelectedStudent(null)
    setSearchQuery('')
    setSearchResults([])
    setEnrollOpen(true)
  }

  const activeEnrollments = enrollments.filter((e) => e.status === 'ACTIVE')

  if (coursesQuery.isSuccess && courses.length === 0) {
    return (
      <PageShell title="Enrollments" description="Enroll students in your courses">
        <EmptyState icon={GraduationCap} title="Create a course first" description="You need a course before you can enroll students." />
      </PageShell>
    )
  }

  return (
    <PageShell
      title="Enrollments"
      description="Manage student enrollments in your courses"
      actions={
        <div className="flex items-center gap-2">
          <Select value={courseId} onValueChange={handleCourseChange}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select a course" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={openEnroll} disabled={!courseId} className="gap-2">
            <UserPlus className="h-4 w-4" /> Enroll Student
          </Button>
        </div>
      }
    >
      {loading ? (
        <PageSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={() => loadEnrollments(courseId)} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Enrolled Since</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {enrollments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="py-16 text-center text-sm text-muted-foreground">
                      No students enrolled in this course yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  enrollments.map((enr) => (
                    <TableRow key={enr.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                            {enr.user.name.charAt(0)}
                          </div>
                          <span className="font-medium">{enr.user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{enr.user.email}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(enr.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant={enr.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {enr.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {enr.status === 'ACTIVE' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive"
                            onClick={() => handleCancel(enr.id, enr.user.name)}
                          >
                            Remove
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            {activeEnrollments.length > 0 && (
              <div className="border-t border-border px-6 py-3 text-sm text-muted-foreground">
                {activeEnrollments.length} active student{activeEnrollments.length === 1 ? '' : 's'} enrolled
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── Enroll Dialog ─────────────────────────────────────────── */}
      <Dialog open={enrollOpen} onOpenChange={setEnrollOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Student</DialogTitle>
            <DialogDescription>Search for a student by name or email to enroll them in this course.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Search Student</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Type name or email..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="h-9 pl-9"
                />
              </div>
            </div>

            {searching && <p className="text-sm text-muted-foreground">Searching...</p>}

            {searchResults.length > 0 && (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-xl border p-2">
                {searchResults.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStudent(s)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors hover:bg-muted',
                      selectedStudent?.id === s.id && 'bg-primary/10 ring-1 ring-primary/30',
                    )}
                  >
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.email}</p>
                    </div>
                    {selectedStudent?.id === s.id && (
                      <Badge variant="default" className="ml-auto">Selected</Badge>
                    )}
                  </button>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && !searching && searchResults.length === 0 && (
              <p className="text-sm text-muted-foreground">No students found.</p>
            )}

            {selectedStudent && (
              <div className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3">
                <div>
                  <p className="text-sm font-medium">{selectedStudent.name}</p>
                  <p className="text-xs text-muted-foreground">{selectedStudent.email}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedStudent(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEnrollOpen(false)}>Cancel</Button>
              <Button onClick={handleEnroll} disabled={!selectedStudent || enrolling}>
                {enrolling ? 'Enrolling...' : 'Enroll Student'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </PageShell>
  )
}
