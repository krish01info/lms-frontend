import { PageShell } from '@/components/common/PageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { platformStats } from '@/constants/mockData'

export function UsersPage() {
  return (
    <PageShell title="Manage Users" description="View and manage platform users" searchable searchPlaceholder="Search users..." actions={<Button>Add User</Button>}>
      <Card><CardContent className="p-0">
        <table className="w-full">
          <thead><tr className="border-b bg-muted/50">{['Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => <th key={h} className="p-4 text-left text-sm font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {[{ name: 'Alex Johnson', email: 'alex@learnflow.edu', role: 'Student', status: 'Active' }, { name: 'Dr. Sarah Mitchell', email: 'sarah@learnflow.edu', role: 'Teacher', status: 'Active' }, { name: 'Emily Chen', email: 'emily@learnflow.edu', role: 'Admin', status: 'Active' }].map((u) => (
              <tr key={u.email} className="border-b">
                <td className="p-4 text-sm font-medium">{u.name}</td>
                <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                <td className="p-4"><Badge variant="secondary">{u.role}</Badge></td>
                <td className="p-4"><Badge variant="success">{u.status}</Badge></td>
                <td className="p-4"><Button variant="ghost" size="sm">Edit</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </PageShell>
  )
}

export function AdminCoursesPage() {
  return (
    <PageShell title="Manage Courses" description={`${platformStats.activeCourses} active courses`} actions={<Button>Add Course</Button>}>
      <div className="space-y-3">
        {['Advanced Mathematics', 'Physics: Mechanics', 'Computer Science', 'English Literature'].map((c, i) => (
          <Card key={c}><CardContent className="flex items-center justify-between p-5">
            <div><p className="font-medium">{c}</p><p className="text-sm text-muted-foreground">{[156, 134, 210, 98][i]} students</p></div>
            <div className="flex gap-2"><Button variant="outline" size="sm">Edit</Button><Button variant="ghost" size="sm">Archive</Button></div>
          </CardContent></Card>
        ))}
      </div>
    </PageShell>
  )
}

export function AdminPaymentsPage() {
  return (
    <PageShell title="Payments" description="Platform payment overview">
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Total Revenue</p><p className="text-2xl font-bold">₹24.5L</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Pending</p><p className="text-2xl font-bold text-amber-600">₹3.2L</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">This Month</p><p className="text-2xl font-bold text-emerald-600">₹1.8L</p></CardContent></Card>
      </div>
    </PageShell>
  )
}

export function ReportsPage() {
  return (
    <PageShell title="Reports" description="Generate platform reports" actions={<Button>Generate Report</Button>}>
      <div className="grid gap-4 sm:grid-cols-2">
        {['User Activity Report', 'Financial Report', 'Course Performance', 'Attendance Summary'].map((r) => (
          <Card key={r}><CardContent className="p-5 flex justify-between items-center"><span className="font-medium">{r}</span><Button variant="outline" size="sm">Download</Button></CardContent></Card>
        ))}
      </div>
    </PageShell>
  )
}

export function AnalyticsPage() {
  return (
    <PageShell title="Analytics" description="Platform-wide analytics">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[{ l: 'DAU', v: '2,450' }, { l: 'New Users', v: '+128' }, { l: 'Course Completions', v: '342' }, { l: 'Avg. Session', v: '24m' }].map((s) => (
          <Card key={s.l}><CardContent className="p-6"><p className="text-sm text-muted-foreground">{s.l}</p><p className="text-2xl font-bold">{s.v}</p></CardContent></Card>
        ))}
      </div>
    </PageShell>
  )
}

export function RolesPage() {
  return (
    <PageShell title="Role Management" description="Manage user roles and permissions">
      <div className="grid gap-4 sm:grid-cols-2">
        {[{ role: 'Student', count: 8500, perms: 'View courses, submit assignments' }, { role: 'Teacher', count: 420, perms: 'Create courses, grade assignments' }, { role: 'Parent', count: 3200, perms: 'View child progress, payments' }, { role: 'Admin', count: 45, perms: 'Full platform access' }].map((r) => (
          <Card key={r.role}><CardContent className="p-5">
            <div className="flex justify-between items-start"><div><p className="font-semibold">{r.role}</p><p className="text-sm text-muted-foreground mt-1">{r.perms}</p></div><Badge>{r.count} users</Badge></div>
            <Button variant="outline" size="sm" className="mt-4">Edit Permissions</Button>
          </CardContent></Card>
        ))}
      </div>
    </PageShell>
  )
}

export function SettingsPage() {
  return (
    <PageShell title="System Settings" description="Configure platform settings">
      <Card><CardContent className="p-6 space-y-6">
        {[{ label: 'Maintenance Mode', desc: 'Disable access for maintenance' }, { label: 'Email Notifications', desc: 'Send system email notifications' }, { label: 'Auto Backup', desc: 'Daily database backup' }].map((s) => (
          <div key={s.label} className="flex items-center justify-between">
            <div><p className="font-medium">{s.label}</p><p className="text-sm text-muted-foreground">{s.desc}</p></div>
            <Switch />
          </div>
        ))}
        <div className="space-y-2"><p className="font-medium">Platform Name</p><Input defaultValue="LearnFlow" /></div>
        <Button>Save Settings</Button>
      </CardContent></Card>
    </PageShell>
  )
}

export function AuditLogsPage() {
  return (
    <PageShell title="Audit Logs" description="System activity and security logs">
      <Card><CardContent className="p-0">
        <table className="w-full">
          <thead><tr className="border-b bg-muted/50">{['Action', 'User', 'IP', 'Time'].map((h) => <th key={h} className="p-4 text-left text-sm font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {[{ action: 'User login', user: 'alex@learnflow.edu', ip: '192.168.1.1', time: '10:30 AM' }, { action: 'Course created', user: 'sarah@learnflow.edu', ip: '192.168.1.5', time: '09:15 AM' }, { action: 'Settings updated', user: 'emily@learnflow.edu', ip: '192.168.1.10', time: '08:00 AM' }].map((log, i) => (
              <tr key={i} className="border-b">
                <td className="p-4 text-sm">{log.action}</td>
                <td className="p-4 text-sm text-muted-foreground">{log.user}</td>
                <td className="p-4 text-sm text-muted-foreground">{log.ip}</td>
                <td className="p-4 text-sm text-muted-foreground">{log.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </PageShell>
  )
}
