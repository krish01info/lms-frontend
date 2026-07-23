import { BookOpen, DollarSign, TrendingUp, Users } from 'lucide-react'
import { ChartCard } from '@/components/common/Charts'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { platformStats, weeklyProgressData } from '@/constants/mockData'
import { useAuth } from '@/contexts/AuthContext'

export function AdminDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <PageHeader title={`Admin Dashboard`} description={`Welcome back, ${user?.name}`} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Users" value={platformStats.totalUsers.toLocaleString()} change="+5.2%" trend="up" icon={Users} />
        <StatCard label="Active Courses" value={platformStats.activeCourses} icon={BookOpen} iconClassName="bg-secondary/10" />
        <StatCard label="Revenue" value={`₹${(platformStats.totalRevenue / 100000).toFixed(1)}L`} change="+12%" trend="up" icon={DollarSign} iconClassName="bg-emerald-500/10" />
        <StatCard label="Completion Rate" value={`${platformStats.completionRate}%`} trend="up" change="+2%" icon={TrendingUp} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Platform Activity" data={weeklyProgressData} dataKey="hours" type="area" />
        <ChartCard title="User Distribution" data={[
          { name: 'Students', value: 8500 },
          { name: 'Teachers', value: 420 },
          { name: 'Parents', value: 3200 },
          { name: 'Admins', value: 45 },
        ]} type="pie" />
      </div>
      <Card>
        <CardHeader><CardTitle>Recent System Activity</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {[
            { action: 'New course "Data Science 101" created', user: 'Dr. Sarah Mitchell', time: '10 min ago' },
            { action: 'Payment received ₹25,000', user: 'Michael Johnson', time: '1 hour ago' },
            { action: 'User role updated to Teacher', user: 'Emily Chen', time: '3 hours ago' },
            { action: 'System backup completed', user: 'System', time: '6 hours ago' },
          ].map((item, i) => (
            <div key={i} className="flex items-center justify-between rounded-2xl border p-4">
              <div>
                <p className="text-sm font-medium">{item.action}</p>
                <p className="text-xs text-muted-foreground">by {item.user}</p>
              </div>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
