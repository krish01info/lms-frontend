import { useNavigate, Link } from 'react-router-dom'
import { ArrowUpRight, BookOpen, ClipboardCheck, FilePlus2, GraduationCap, Target, Timer, TrendingUp, Upload, Users } from 'lucide-react'
import { motion } from 'framer-motion'
import { PageHeader } from '@/components/common/PageHeader'
import { PageSkeleton } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { StatCard } from '@/components/common/StatCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/utils/cn'
import { useAuth } from '@/contexts/AuthContext'
import { useTeachingStats } from '@/hooks/useUserData'
import type { TeachingStats, TeachingStatsCourse } from '@/types'

const courseStatusBadge: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  PUBLISHED: { label: 'Published', variant: 'default' },
  DRAFT: { label: 'Draft', variant: 'secondary' },
  ARCHIVED: { label: 'Archived', variant: 'outline' },
}

/** Days elapsed since a course was created. */
function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
}

/** Compute a trend label + color from course age + student count. */
function getTrend(course: TeachingStatsCourse): { label: string; up: boolean; color: string } {
  const age = daysSince(course.createdAt)
  // Newly created (< 30 days) with any students → "Growing"
  if (age < 30 && course.studentCount > 0) return { label: 'Growing', up: true, color: 'text-emerald-600' }
  // Very new (< 7 days) → "New"
  if (age < 7) return { label: 'New', up: true, color: 'text-blue-600' }
  // Draft status → "In Draft"
  if (course.status === 'DRAFT') return { label: 'Drafting', up: false, color: 'text-amber-600' }
  // Established
  if (course.studentCount > 0) return { label: 'Established', up: false, color: 'text-muted-foreground' }
  return { label: 'No students', up: false, color: 'text-muted-foreground' }
}

export function TeacherDashboard() {
  const { user } = useAuth()
  const statsQuery = useTeachingStats()

  return (
    <div className="space-y-6">
      <PageHeader title={`Good morning, ${user?.name?.split(' ')[0]}!`} description="Here's your teaching overview for today." />

      {statsQuery.isLoading ? (
        <PageSkeleton />
      ) : statsQuery.isError || !statsQuery.data ? (
        <ErrorState message="Could not load your dashboard. Please try again." onRetry={() => statsQuery.refetch()} />
      ) : (
        <DashboardContent stats={statsQuery.data} />
      )}
    </div>
  )
}

function DashboardContent({ stats }: { stats: TeachingStats }) {
  const recentCourses = stats.courses.slice(0, 3) // already sorted desc by createdAt

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Published Courses"
          value={stats.publishedCount}
          change={`${stats.draftCount} in draft`}
          trend="neutral"
          icon={BookOpen}
        />
        <StatCard label="Total Students" value={stats.totalStudents} icon={Users} />
        <StatCard
          label="Quizzes Created"
          value={stats.quizStats.totalQuizzes}
          change={stats.quizStats.totalAttempts > 0 ? `${stats.quizStats.totalAttempts} attempts` : 'No attempts yet'}
          trend="neutral"
          icon={ClipboardCheck}
        />
        <StatCard
          label="Quiz Pass Rate"
          value={stats.quizStats.passRate !== null ? `${stats.quizStats.passRate}%` : '—'}
          icon={Target}
          iconClassName="bg-emerald-500/10"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <StudentsPerCourseChart courses={stats.courses} />

        <Card>
          <CardHeader><CardTitle>Recently Created Courses</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {recentCourses.length === 0 ? (
              <EmptyState icon={BookOpen} title="No courses yet" description="Courses you create will show up here." />
            ) : (
              recentCourses.map((course) => {
                const badge = courseStatusBadge[course.status] ?? { label: course.status, variant: 'outline' as const }
                return (
                  <Link
                    key={course.id}
                    to="/teacher/courses"
                    className="flex items-center justify-between rounded-2xl border p-4 transition-colors hover:border-primary/40 hover:bg-muted/40"
                  >
                    <div>
                      <p className="text-sm font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.studentCount} student{course.studentCount === 1 ? '' : 's'}</p>
                    </div>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </Link>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Quick Actions</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Button variant="outline" className="h-auto justify-start gap-3 p-4" asChild>
            <Link to="/teacher/create-course">
              <FilePlus2 className="h-5 w-5" />
              <div className="text-left">
                <p className="text-sm font-medium">Create Course</p>
                <p className="text-xs text-muted-foreground">Start a new course</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto justify-start gap-3 p-4" asChild>
            <Link to="/teacher/quiz-builder">
              <ClipboardCheck className="h-5 w-5" />
              <div className="text-left">
                <p className="text-sm font-medium">Build a Quiz</p>
                <p className="text-xs text-muted-foreground">Add a new quiz</p>
              </div>
            </Link>
          </Button>
          <Button variant="outline" className="h-auto justify-start gap-3 p-4" asChild>
            <Link to="/teacher/resources">
              <Upload className="h-5 w-5" />
              <div className="text-left">
                <p className="text-sm font-medium">Upload Resource</p>
                <p className="text-xs text-muted-foreground">Share course materials</p>
              </div>
            </Link>
          </Button>
        </CardContent>
      </Card>
    </>
  )
}

function StudentsPerCourseChart({ courses }: { courses: TeachingStatsCourse[] }) {
  const navigate = useNavigate()
  const totalStudents = courses.reduce((sum, c) => sum + c.studentCount, 0)
  const maxCount = Math.max(...courses.map((c) => c.studentCount), 1)

  // Top 5 by enrollment, descending
  const data = [...courses]
    .filter((c) => c.studentCount > 0 || c.status !== 'ARCHIVED')
    .sort((a, b) => b.studentCount - a.studentCount)
    .slice(0, 5)

  return (
    <Card className="overflow-hidden border-0 bg-gradient-to-br from-card to-muted/30 shadow-md">
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-2">
        <div>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Students per Course
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{totalStudents}</span> total{' '}
            student{totalStudents === 1 ? '' : 's'} across {courses.length} course{courses.length === 1 ? '' : 's'}
          </p>
        </div>
        <div className="flex items-center gap-3 self-start rounded-lg bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
            Published
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-400" />
            Draft
          </span>
        </div>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState icon={BookOpen} title="No courses yet" description="Create a course to see enrollment breakdown here." />
        ) : (
          <div className="space-y-4">
            {data.map((course, i) => {
              const badge = courseStatusBadge[course.status] ?? { label: course.status, variant: 'outline' as const }
              const trend = getTrend(course)
              const pct = Math.round((course.studentCount / maxCount) * 100)
              const ageDays = daysSince(course.createdAt)

              return (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, ease: 'easeOut' }}
                >
                  <button
                    onClick={() => navigate('/teacher/courses')}
                    className="group w-full text-left"
                  >
                    <div className="mb-1.5 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-semibold text-muted-foreground">
                          {i + 1}
                        </span>
                        <span className="truncate text-sm font-medium group-hover:text-primary transition-colors">
                          {course.title}
                        </span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        <span className="text-sm font-bold tabular-nums">{course.studentCount}</span>
                        <Badge variant={badge.variant} className="hidden sm:inline-flex text-[10px] px-1.5 py-0">
                          {badge.label}
                        </Badge>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/60">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(pct, 4)}%` }}
                        transition={{ delay: i * 0.08 + 0.2, duration: 0.6, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{
                          background: course.status === 'PUBLISHED'
                            ? 'linear-gradient(90deg, #2563eb, #60a5fa)'
                            : 'linear-gradient(90deg, #94a3b8, #cbd5e1)',
                        }}
                      />
                    </div>

                    {/* Footer info */}
                    <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Timer className="h-3 w-3" />
                        {ageDays < 1
                          ? 'Created today'
                          : ageDays < 30
                            ? `${ageDays}d ago`
                            : ageDays < 365
                              ? `${Math.floor(ageDays / 30)}mo ago`
                              : `${Math.floor(ageDays / 365)}yr ago`}
                      </span>
                      <span className={cn('flex items-center gap-0.5 font-medium', trend.color)}>
                        {trend.up && <TrendingUp className="h-3 w-3" />}
                        {trend.up && <ArrowUpRight className="h-3 w-3" />}
                        {trend.label}
                      </span>
                    </div>
                  </button>
                </motion.div>
              )
            })}

            {/* Summary footer */}
            {courses.length > 5 && (
              <div className="pt-2 text-center">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={() => navigate('/teacher/courses')}>
                  +{courses.length - 5} more course{courses.length - 5 === 1 ? '' : 's'}
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
