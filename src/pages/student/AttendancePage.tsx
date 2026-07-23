import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { format, parseISO } from 'date-fns'
import { CalendarDays, CheckCircle } from 'lucide-react'
import { ChartCard, CircularProgress } from '@/components/common/Charts'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import api from '@/services/api'

const statusStyles = {
  present: { label: 'Present', variant: 'success' as const },
  absent: { label: 'Absent', variant: 'destructive' as const },
  late: { label: 'Late', variant: 'warning' as const },
  leave: { label: 'Leave', variant: 'secondary' as const },
}

export function AttendancePage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['attendance-my'],
    queryFn: async () => {
      const res = await api.get('/attendance/my')
      return res.data.data
    },
  })

  const records = data?.records || []
  const summary = data?.summary || []
  const overallAttendance = data?.overallPercentage ?? 0

  const chartData = summary.map((s: any) => ({
    name: s.courseTitle,
    value: s.percentage,
  }))

  const presentDays = records.filter((r: any) => r.status === 'present').length

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Attendance" description="Monitor your attendance and request leave" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="Attendance" description="Monitor your attendance and request leave" />
        <EmptyState
          icon={CalendarDays}
          title="Failed to load attendance"
          description="Could not connect to the server. Please try again."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="Monitor your attendance and request leave" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active Days" value={presentDays} icon={CheckCircle} iconClassName="bg-emerald-500/10" />
        <StatCard
          label="Courses Tracked"
          value={summary.length}
          icon={CalendarDays}
          iconClassName="bg-secondary/10"
        />
        <StatCard label="Overall" value={`${overallAttendance}%`} icon={CalendarDays} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <CardTitle className="text-base">Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pb-8">
            <CircularProgress value={overallAttendance} size={140} label="Attendance" />
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              Based on days you completed at least one lesson, out of days lessons were made available.
            </p>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          {chartData.length === 0 ? (
            <Card className="h-full flex items-center justify-center">
              <CardContent className="py-12">
                <EmptyState
                  icon={CalendarDays}
                  title="No attendance data yet"
                  description="Complete lessons in your enrolled courses to build your attendance record."
                />
              </CardContent>
            </Card>
          ) : (
            <ChartCard
              title="Attendance by Course"
              data={chartData}
              type="bar"
              dataKey="value"
              xKey="name"
            />
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Attendance History</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No attendance records yet.
            </p>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Subject</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record: any, i: number) => {
                  const style = statusStyles[record.status as keyof typeof statusStyles]
                  return (
                    <motion.tr
                      key={`${record.date}-${record.subject}-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="border-b border-border/50 last:border-0"
                    >
                      <td className="py-3">{format(parseISO(record.date), 'MMM d, yyyy')}</td>
                      <td className="py-3">{record.subject}</td>
                      <td className="py-3">
                        <Badge variant={style.variant}>{style.label}</Badge>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}