import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { BookOpen, Clock, Target, TrendingUp } from 'lucide-react'
import { ChartCard } from '@/components/common/Charts'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { weeklyProgressData } from '@/constants/mockData'
import api from '@/services/api'

// NOTE: no backend endpoint for learning goals yet — stays mock until built
const learningGoals = [
  { label: 'Weekly study hours', current: 24.5, target: 30, unit: 'hrs' },
  { label: 'Assignments completed', current: 18, target: 22, unit: '' },
  { label: 'Quizzes passed', current: 2, target: 4, unit: '' },
  { label: 'Course modules done', current: 28, target: 44, unit: '' },
]

export function ProgressPage() {
  const { data: courseProgress, isLoading, isError } = useQuery({
    queryKey: ['progress-my'],
    queryFn: async () => {
      const res = await api.get('/progress/my')
      return res.data.data.progress
    },
  })

  // Reused from AttendancePage/ProfilePage — same query cache
  const { data: attendanceData, isLoading: isAttendanceLoading } = useQuery({
    queryKey: ['attendance-my'],
    queryFn: async () => {
      const res = await api.get('/attendance/my')
      return res.data.data
    },
  })

  const courses = courseProgress || []
  const avgProgress = courses.length
    ? Math.round(courses.reduce((acc: number, c: any) => acc + c.percentage, 0) / courses.length)
    : 0
  const totalHours = weeklyProgressData.reduce((acc, d) => acc + d.hours, 0)

  const courseProgressChart = courses.map((c: any) => ({
    name: c.courseTitle.split(' ').slice(0, 2).join(' '),
    value: c.percentage,
  }))

  const attendanceSummary = attendanceData?.summary || []
  const attendanceChart = attendanceSummary.map((s: any) => ({
    name: s.courseTitle,
    value: s.percentage,
  }))

  return (
    <div className="space-y-6">
      <PageHeader title="Learning Progress" description="Track your growth across courses and subjects" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Avg. Course Progress" value={`${avgProgress}%`} trend="up" icon={TrendingUp} />
        <StatCard label="Study Hours" value={`${totalHours.toFixed(1)}h`} change="This week (mock)" icon={Clock} />
        <StatCard label="Active Courses" value={courses.length} icon={BookOpen} iconClassName="bg-secondary/10" />
        <StatCard label="Goals Met" value="3/4" change="75% (mock)" trend="up" icon={Target} iconClassName="bg-emerald-500/10" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Weekly Study Hours (mock)" data={weeklyProgressData} dataKey="hours" type="area" />
        <ChartCard title="Course Completion" data={courseProgressChart} type="bar" dataKey="value" xKey="name" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {isLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 rounded-lg bg-muted animate-pulse" />
                ))}
              </div>
            )}

            {isError && (
              <EmptyState
                icon={BookOpen}
                title="Failed to load progress"
                description="Could not load your course progress. Please try again."
              />
            )}

            {!isLoading && !isError && courses.length === 0 && (
              <EmptyState
                icon={BookOpen}
                title="No progress yet"
                description="Enroll in a course and complete lessons to see progress here."
              />
            )}

            {!isLoading && !isError && courses.map((course: any, i: number) => (
              <motion.div
                key={course.courseId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="space-y-2"
              >
                <div className="flex justify-between text-sm">
                  <span className="font-medium line-clamp-1">{course.courseTitle}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">{course.percentage}%</span>
                </div>
                <Progress value={course.percentage} />
                <p className="text-xs text-muted-foreground">
                  {course.completedLessons} of {course.totalLessons} lessons completed
                </p>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {isAttendanceLoading ? (
            <div className="h-60 rounded-xl bg-muted animate-pulse" />
          ) : attendanceChart.length === 0 ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground py-6 text-center">
                  No attendance data yet.
                </p>
              </CardContent>
            </Card>
          ) : (
            <ChartCard title="Attendance Overview" data={attendanceChart} type="pie" dataKey="value" xKey="name" height={240} />
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Learning Goals (mock)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {learningGoals.map((goal) => {
                const pct = Math.round((goal.current / goal.target) * 100)
                return (
                  <div key={goal.label} className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{goal.label}</span>
                      <span className="font-medium">
                        {goal.current}{goal.unit}/{goal.target}{goal.unit}
                      </span>
                    </div>
                    <Progress value={pct} />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}