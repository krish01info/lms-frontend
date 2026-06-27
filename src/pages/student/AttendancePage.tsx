import { useState } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { CalendarDays, CheckCircle, Send } from 'lucide-react'
import { ChartCard, CircularProgress } from '@/components/common/Charts'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { attendanceBySubject, mockAttendance } from '@/constants/mockData'

const statusStyles = {
  present: { label: 'Present', variant: 'success' as const },
  absent: { label: 'Absent', variant: 'destructive' as const },
  late: { label: 'Late', variant: 'warning' as const },
  leave: { label: 'Leave', variant: 'secondary' as const },
}

const chartData = attendanceBySubject.map((s) => ({
  name: s.subject,
  value: s.percentage,
}))

export function AttendancePage() {
  const [leaveForm, setLeaveForm] = useState({ from: '', to: '', reason: '', subject: '' })
  const [submitted, setSubmitted] = useState(false)

  const overallAttendance = Math.round(
    attendanceBySubject.reduce((acc, s) => acc + s.percentage, 0) / attendanceBySubject.length
  )
  const presentDays = mockAttendance.filter((r) => r.status === 'present').length
  const absentDays = mockAttendance.filter((r) => r.status === 'absent').length

  const handleSubmitLeave = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setLeaveForm({ from: '', to: '', reason: '', subject: '' })
    }, 3000)
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="Monitor your attendance and request leave" />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Present Days" value={presentDays} icon={CheckCircle} iconClassName="bg-emerald-500/10" />
        <StatCard label="Absent Days" value={absentDays} trend="down" icon={CalendarDays} iconClassName="bg-destructive/10" />
        <StatCard label="This Month" value={`${overallAttendance}%`} change="+2% vs last month" trend="up" icon={CalendarDays} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="text-center">
            <CardTitle className="text-base">Overall Attendance</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4 pb-8">
            <CircularProgress value={overallAttendance} size={140} label="Attendance" />
            <p className="text-sm text-muted-foreground text-center max-w-xs">
              You need at least 75% attendance to be eligible for exams.
            </p>
          </CardContent>
        </Card>

        <div className="lg:col-span-2">
          <ChartCard
            title="Attendance by Subject"
            data={chartData}
            type="bar"
            dataKey="value"
            xKey="name"
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Attendance History</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="pb-3 font-medium">Date</th>
                  <th className="pb-3 font-medium">Subject</th>
                  <th className="pb-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockAttendance.map((record) => {
                  const style = statusStyles[record.status]
                  return (
                    <motion.tr
                      key={record.id}
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Leave Request</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitLeave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Select
                  value={leaveForm.subject}
                  onValueChange={(v) => setLeaveForm({ ...leaveForm, subject: v })}
                >
                  <SelectTrigger id="subject">
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {attendanceBySubject.map((s) => (
                      <SelectItem key={s.subject} value={s.subject}>
                        {s.subject}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="from">From</Label>
                  <Input
                    id="from"
                    type="date"
                    value={leaveForm.from}
                    onChange={(e) => setLeaveForm({ ...leaveForm, from: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="to">To</Label>
                  <Input
                    id="to"
                    type="date"
                    value={leaveForm.to}
                    onChange={(e) => setLeaveForm({ ...leaveForm, to: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <textarea
                  id="reason"
                  placeholder="Briefly describe your reason for leave..."
                  value={leaveForm.reason}
                  onChange={(e) => setLeaveForm({ ...leaveForm, reason: e.target.value })}
                  rows={3}
                  required
                  className="flex min-h-[80px] w-full rounded-2xl border border-input bg-card px-4 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>
              <Button type="submit" className="w-full gap-2" disabled={submitted}>
                <Send className="h-4 w-4" />
                {submitted ? 'Request Submitted!' : 'Submit Request'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
