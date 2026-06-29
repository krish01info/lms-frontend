import { motion } from 'framer-motion'
import { BookOpen, ClipboardList, TrendingUp, Users } from 'lucide-react'
import { ChartCard } from '@/components/common/Charts'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { mockCourses, weeklyProgressData } from '@/constants/mockData'
import { useState, useEffect } from 'react'
import api from '@/services/api'
import { useAuth } from '@/contexts/AuthContext'

export function TeacherDashboard() {
  const { user } = useAuth()
  const [coursesCount, setCoursesCount] = useState(0)

  useEffect(() => {
    const fetchCoursesCount = async () => {
      try {
        const { data } = await api.get('/courses/my')
        setCoursesCount(data.data.courses?.length || 0)
      } catch (err) {
        // fallback
      }
    }
    fetchCoursesCount()
  }, [])

  return (
    <div className="space-y-6">
      <PageHeader title={`Good morning, ${user?.name?.split(' ')[0]}!`} description="Here's your teaching overview for today." />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Active Courses" value={coursesCount} icon={BookOpen} />
        <StatCard label="Total Students" value="498" change="+12 this week" trend="up" icon={Users} />
        <StatCard label="Pending Grading" value="23" icon={ClipboardList} iconClassName="bg-amber-500/10" />
        <StatCard label="Avg. Performance" value="87%" trend="up" change="+3%" icon={TrendingUp} iconClassName="bg-emerald-500/10" />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Student Engagement" data={weeklyProgressData} dataKey="hours" type="area" />
        <Card>
          <CardHeader><CardTitle>Recent Submissions</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {['Alex Johnson - Calculus PS #5', 'Emma Davis - Lab Report', 'James Wilson - Essay'].map((s, i) => (
              <div key={i} className="flex items-center justify-between rounded-2xl border p-4">
                <span className="text-sm font-medium">{s}</span>
                <span className="text-xs text-muted-foreground">2h ago</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader><CardTitle>Today&apos;s Schedule</CardTitle></CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {[
            { time: '09:00 AM', class: 'Advanced Mathematics', room: 'Room 301' },
            { time: '11:00 AM', class: 'CS Fundamentals', room: 'Lab 2' },
            { time: '02:00 PM', class: 'Office Hours', room: 'Room 301' },
          ].map((item) => (
            <motion.div key={item.time} whileHover={{ y: -2 }} className="rounded-2xl bg-muted/50 p-4">
              <p className="text-sm font-medium">{item.class}</p>
              <p className="text-xs text-muted-foreground">{item.time} · {item.room}</p>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
