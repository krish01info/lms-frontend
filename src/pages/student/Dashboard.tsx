import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import {
  Award,
  BookOpen,
  Calendar,
  ClipboardList,
  Clock,
  GraduationCap,
  TrendingUp,
  Users,
} from 'lucide-react'
import { Link } from 'react-router-dom'
import { AssignmentCard } from '@/components/common/AssignmentCard'
import { ChartCard } from '@/components/common/Charts'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  mockAssignments,
  mockCalendarEvents,
  weeklyProgressData,
} from '@/constants/mockData'
import { useAuth } from '@/contexts/AuthContext'
import { transformCourse } from '@/utils/transformers'
import api from '@/services/api'

const quickActions = [
  { label: 'My Courses', href: '/student/courses', icon: BookOpen },
  { label: 'Assignments', href: '/student/assignments', icon: ClipboardList },
  { label: 'Quizzes', href: '/student/quizzes', icon: GraduationCap },
  { label: 'Calendar', href: '/student/calendar', icon: Calendar },
]

// NOTE: sample data — no backend model for activity log yet
const recentActivity = [
  { action: 'Submitted Wave Motion Lab Report', time: '2 hours ago', type: 'assignment' },
  { action: 'Completed Shakespeare Analysis Quiz', time: 'Yesterday', type: 'quiz' },
  { action: 'Joined Mathematics Discussion', time: '2 days ago', type: 'discussion' },
  { action: 'Downloaded Physics Notes', time: '3 days ago', type: 'resource' },
]

// NOTE: sample data — no backend model for announcements yet
const announcements = [
  { title: 'Science Fair Registration Open', date: 'Jun 25' },
  { title: 'Mid-term Exam Schedule Released', date: 'Jun 24' },
  { title: 'New Course: Data Science 101', date: 'Jun 23' },
]

export function StudentDashboard() {
  const { user } = useAuth()

  // Live enrolled courses — shares cache with CoursesPage/ProfilePage
  const { data: courseData, isLoading: isCoursesLoading } = useQuery({
    queryKey: ['enrolled-courses'],
    queryFn: async () => {
      const res = await api.get('/courses/enrolled')
      return res.data.data.courses.map(transformCourse)
    },
  })

  // Live progress — shares cache with ProgressPage/ProfilePage/CertificatesPage
  const { data: progressData, isLoading: isProgressLoading } = useQuery({
    queryKey: ['progress-my'],
    queryFn: async () => {
      const res = await api.get('/progress/my')
      return res.data.data.progress
    },
  })

  // Live attendance — shares cache with AttendancePage/ProfilePage/ProgressPage
  const { data: attendanceData, isLoading: isAttendanceLoading } = useQuery({
    queryKey: ['attendance-my'],
    queryFn: async () => {
      const res = await api.get('/attendance/my')
      return res.data.data
    },
  })

  const courses = courseData || []
  const progress = progressData || []
  const isLoading = isCoursesLoading || isProgressLoading || isAttendanceLoading
  const attendancePercentage = attendanceData?.overallPercentage ?? 0

  // NOTE: assignments blocked — teammate's /assignments endpoint returns 404, still mock for now
  const todayClasses = mockCalendarEvents.filter((e) => e.type === 'class').slice(0, 3)
  const dueAssignments = mockAssignments.filter((a) => a.status === 'pending' || a.status === 'overdue')

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0]}! 👋`}
        description="Here's what's happening with your learning today."
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl gradient-primary p-6 text-white sm:p-8"
      >
        <div className="relative z-10">
          <p className="text-sm text-white/80">{user?.grade}</p>
          <h2 className="mt-1 text-2xl font-bold sm:text-3xl">Keep up the great work!</h2>
          <p className="mt-2 max-w-md text-white/80">
            You have {dueAssignments.length} assignments due this week (sample) and {todayClasses.length} classes today (sample).
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button variant="glass" asChild>
              <Link to="/student/assignments">View Assignments</Link>
            </Button>
            <Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20" asChild>
              <Link to="/student/courses">Browse Courses</Link>
            </Button>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-white/5" />
      </motion.div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Attendance" value={`${attendancePercentage}%`} icon={Users} />
        <StatCard label="Current GPA" value="3.85" change="Sample data" trend="up" icon={Award} iconClassName="bg-emerald-500/10" />
        <StatCard
          label="Courses Active"
          value={isCoursesLoading ? '—' : courses.length}
          icon={BookOpen}
          iconClassName="bg-secondary/10"
        />
        <StatCard label="Learning Hours" value="24.5h" change="This week (sample)" trend="neutral" icon={Clock} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <ChartCard title="Weekly Learning Progress (sample)" data={weeklyProgressData} dataKey="hours" type="area" />

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Assignments Due (sample)</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/student/assignments">View all</Link>
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {dueAssignments.map((a) => (
                <AssignmentCard key={a.id} assignment={a} />
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Today&apos;s Classes (sample)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {todayClasses.map((cls) => (
                <div key={cls.id} className="flex items-center gap-3 rounded-2xl bg-muted/50 p-3">
                  <div className="h-10 w-1 rounded-full" style={{ backgroundColor: cls.color }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{cls.title}</p>
                    <p className="text-xs text-muted-foreground">{cls.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Course Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isLoading && (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 rounded-lg bg-muted animate-pulse" />
                  ))}
                </div>
              )}

              {!isLoading && progress.length === 0 && (
                <p className="text-sm text-muted-foreground py-2 text-center">
                  No progress yet. Enroll in a course to get started.
                </p>
              )}

              {!isLoading &&
                progress.slice(0, 3).map((course: any) => (
                  <div key={course.courseId} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium line-clamp-1">{course.courseTitle}</span>
                      <span className="text-muted-foreground">{course.percentage}%</span>
                    </div>
                    <Progress value={course.percentage} />
                  </div>
                ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {quickActions.map((action) => (
                <Link
                  key={action.href}
                  to={action.href}
                  className="flex flex-col items-center gap-2 rounded-2xl bg-muted/50 p-4 text-center transition-colors hover:bg-muted"
                >
                  <action.icon className="h-5 w-5 text-primary" />
                  <span className="text-xs font-medium">{action.label}</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Announcements (sample)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {announcements.map((item, i) => (
              <div key={i} className="flex items-start justify-between rounded-2xl border border-border p-4">
                <div>
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.date}</p>
                </div>
                <Badge variant="secondary">New</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity (sample)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{item.action}</p>
                  <p className="text-xs text-muted-foreground">{item.time}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}