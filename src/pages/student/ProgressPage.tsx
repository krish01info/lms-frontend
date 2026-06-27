import { motion } from 'framer-motion'
import { BookOpen, Clock, Target, TrendingUp } from 'lucide-react'
import { ChartCard } from '@/components/common/Charts'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { mockCourses, weeklyProgressData, attendanceBySubject } from '@/constants/mockData'

const courseProgressChart = mockCourses.map((c) => ({
  name: c.title.split(' ').slice(0, 2).join(' '),
  value: c.progress,
}))

const attendanceChart = attendanceBySubject.map((s) => ({
  name: s.subject,
  value: s.percentage,
}))

const learningGoals = [
  { label: 'Weekly study hours', current: 24.5, target: 30, unit: 'hrs' },
  { label: 'Assignments completed', current: 18, target: 22, unit: '' },
  { label: 'Quizzes passed', current: 2, target: 4, unit: '' },
  { label: 'Course modules done', current: 28, target: 44, unit: '' },
]

export function ProgressPage() {
  const avgProgress = Math.round(
    mockCourses.reduce((acc, c) => acc + c.progress, 0) / mockCourses.length
  )
  const totalHours = weeklyProgressData.reduce((acc, d) => acc + d.hours, 0)

  return (
    <div className="space-y-6">
      <PageHeader title="Learning Progress" description="Track your growth across courses and subjects" />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Avg. Course Progress" value={`${avgProgress}%`} trend="up" change="+8% this month" icon={TrendingUp} />
        <StatCard label="Study Hours" value={`${totalHours.toFixed(1)}h`} change="This week" icon={Clock} />
        <StatCard label="Active Courses" value={mockCourses.length} icon={BookOpen} iconClassName="bg-secondary/10" />
        <StatCard label="Goals Met" value="3/4" change="75% completion" trend="up" icon={Target} iconClassName="bg-emerald-500/10" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Weekly Study Hours" data={weeklyProgressData} dataKey="hours" type="area" />
        <ChartCard title="Course Completion" data={courseProgressChart} type="bar" dataKey="value" xKey="name" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Course Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {mockCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="space-y-2"
              >
                <div className="flex justify-between text-sm">
                  <span className="font-medium line-clamp-1">{course.title}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">{course.progress}%</span>
                </div>
                <Progress value={course.progress} />
                <p className="text-xs text-muted-foreground">
                  {Math.round((course.progress / 100) * course.modules)} of {course.modules} modules completed
                </p>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <ChartCard title="Attendance Overview" data={attendanceChart} type="pie" dataKey="value" xKey="name" height={240} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Learning Goals</CardTitle>
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
