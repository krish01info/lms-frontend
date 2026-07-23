import { Baby, CreditCard, MessageSquare, TrendingUp, Users } from 'lucide-react'
import { ChartCard, CircularProgress } from '@/components/common/Charts'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { subjectScores, attendanceBySubject } from '@/constants/mockData'
import { useAuth } from '@/contexts/AuthContext'

export function ParentDashboard() {
  const { user } = useAuth()

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome, ${user?.name?.split(' ')[0]}!`}
        description={`Monitoring ${user?.children?.[0] ?? 'your child'}'s academic progress`}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Child's GPA" value="3.85" trend="up" change="Top 15%" icon={TrendingUp} />
        <StatCard label="Attendance" value="92%" trend="up" change="+2%" icon={Users} iconClassName="bg-emerald-500/10" />
        <StatCard label="Pending Fees" value="₹25,000" icon={CreditCard} iconClassName="bg-amber-500/10" />
        <StatCard label="Unread Messages" value="1" icon={MessageSquare} />
      </div>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="flex flex-col items-center justify-center p-8">
          <CircularProgress value={92} label="Attendance" />
          <p className="mt-4 text-sm text-muted-foreground">Alex Johnson · Grade 11</p>
        </Card>
        <div className="lg:col-span-2">
          <ChartCard title="Subject Performance" data={subjectScores.map((s) => ({ name: s.subject, value: s.score }))} type="bar" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Baby className="h-5 w-5" />Recent Updates</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {[
              { text: 'Scored 92% on Poetry Analysis Essay', time: 'Yesterday' },
              { text: 'Submitted Wave Motion Lab Report', time: '2 days ago' },
              { text: 'Present in all classes this week', time: '3 days ago' },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl border p-4">
                <p className="text-sm font-medium">{item.text}</p>
                <p className="text-xs text-muted-foreground">{item.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Attendance by Subject</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {attendanceBySubject.map((item) => (
              <div key={item.subject} className="flex items-center justify-between">
                <span className="text-sm">{item.subject}</span>
                <span className="font-semibold text-emerald-600">{item.percentage}%</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
