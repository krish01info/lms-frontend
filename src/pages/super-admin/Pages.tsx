import { PageShell } from '@/components/common/PageShell'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { platformStats } from '@/constants/mockData'

export { SuperAdminDashboard } from './Dashboard'
export { BranchesPage } from './BranchesPage'
export { OrganizationPage } from './OrganizationPage'
export { BranchAdminsPage } from './BranchAdminsPage'

export function SuperAdminTeachersPage() {
  return (
    <PageShell title="Manage Teachers" description="Global overview of all teachers across branches" searchable searchPlaceholder="Search teachers..." actions={<Button>Add Teacher</Button>}>
      <Card><CardContent className="p-0 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead><tr className="border-b bg-muted/50">{['Name', 'Email', 'Branch', 'Department', 'Status', 'Actions'].map((h) => <th key={h} className="p-4 text-left text-sm font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {[
              { name: 'Dr. Sarah Mitchell', email: 'sarah@learnflow.edu', branch: 'London Campus', dept: 'Mathematics', status: 'Active' },
              { name: 'Prof. James Wilson', email: 'james@learnflow.edu', branch: 'New York Campus', dept: 'Physics', status: 'Active' },
              { name: 'Ms. Rachel Green', email: 'rachel@learnflow.edu', branch: 'London Campus', dept: 'Humanities', status: 'On Leave' },
            ].map((u) => (
              <tr key={u.email} className="border-b">
                <td className="p-4 text-sm font-medium">{u.name}</td>
                <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                <td className="p-4 text-sm">{u.branch}</td>
                <td className="p-4 text-sm">{u.dept}</td>
                <td className="p-4"><Badge variant="secondary" className={u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : ''}>{u.status}</Badge></td>
                <td className="p-4"><Button variant="ghost" size="sm">Edit</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </PageShell>
  )
}

export function SuperAdminStudentsPage() {
  return (
    <PageShell title="Manage Students" description="Global overview of all students across branches" searchable searchPlaceholder="Search students..." actions={<Button>Add Student</Button>}>
      <Card><CardContent className="p-0 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead><tr className="border-b bg-muted/50">{['Name', 'Email', 'Branch', 'Grade', 'Status', 'Actions'].map((h) => <th key={h} className="p-4 text-left text-sm font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {[
              { name: 'Prakhar Bhardwaj', email: 'prakhar.bhardwaj@learnflow.edu', branch: 'London Campus', grade: '2nd Year', status: 'Active' },
              { name: 'Alex Johnson', email: 'alex@learnflow.edu', branch: 'New York Campus', grade: '1st Year', status: 'Active' },
              { name: 'Emma Wilson', email: 'emma@learnflow.edu', branch: 'London Campus', grade: '3rd Year', status: 'Inactive' },
            ].map((u) => (
              <tr key={u.email} className="border-b">
                <td className="p-4 text-sm font-medium">{u.name}</td>
                <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                <td className="p-4 text-sm">{u.branch}</td>
                <td className="p-4 text-sm">{u.grade}</td>
                <td className="p-4"><Badge variant="secondary" className={u.status === 'Active' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : ''}>{u.status}</Badge></td>
                <td className="p-4"><Button variant="ghost" size="sm">Edit</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </PageShell>
  )
}

export function SuperAdminParentsPage() {
  return (
    <PageShell title="Manage Parents" description="Global overview of all parents across branches" searchable searchPlaceholder="Search parents..." actions={<Button>Add Parent</Button>}>
      <Card><CardContent className="p-0 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead><tr className="border-b bg-muted/50">{['Name', 'Email', 'Linked Students', 'Branch', 'Actions'].map((h) => <th key={h} className="p-4 text-left text-sm font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {[
              { name: 'Kapil Sharma', email: 'kapil.sharma@email.com', students: 'Prakhar Bhardwaj', branch: 'London Campus' },
              { name: 'Michael Johnson', email: 'mjohnson@email.com', students: 'Alex Johnson', branch: 'New York Campus' },
            ].map((u) => (
              <tr key={u.email} className="border-b">
                <td className="p-4 text-sm font-medium">{u.name}</td>
                <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                <td className="p-4 text-sm">{u.students}</td>
                <td className="p-4 text-sm">{u.branch}</td>
                <td className="p-4"><Button variant="ghost" size="sm">View</Button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </PageShell>
  )
}

export function SuperAdminCoursesPage() {
  return (
    <PageShell title="Manage Courses" description={`Global overview of ${platformStats.activeCourses} active courses`} actions={<Button>Add Course</Button>}>
      <div className="space-y-3">
        {[
          { title: 'Advanced Mathematics', students: 156, branch: 'London Campus' },
          { title: 'Physics: Mechanics & Waves', students: 134, branch: 'New York Campus' },
          { title: 'English Literature', students: 98, branch: 'London Campus' },
          { title: 'Computer Science Fundamentals', students: 210, branch: 'Global Online' },
        ].map((c) => (
          <Card key={c.title}><CardContent className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
            <div>
              <p className="font-medium text-lg">{c.title}</p>
              <div className="flex gap-4 mt-1">
                <p className="text-sm text-muted-foreground">{c.students} students</p>
                <p className="text-sm text-muted-foreground">Branch: {c.branch}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Edit</Button>
              <Button variant="ghost" size="sm">Archive</Button>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </PageShell>
  )
}

export function SuperAdminPaymentsPage() {
  return (
    <PageShell title="Global Payments" description="Organization-wide financial overview">
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        <Card><CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Total Revenue (Global)</p>
          <p className="text-3xl font-bold mt-2">₹1,24.5L</p>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <p className="text-sm text-muted-foreground">Pending Payments</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">₹12.2L</p>
        </CardContent></Card>
        <Card><CardContent className="p-6">
          <p className="text-sm text-muted-foreground">This Month (All Branches)</p>
          <p className="text-3xl font-bold text-emerald-600 mt-2">₹8.8L</p>
        </CardContent></Card>
      </div>
      <Card><CardContent className="p-0 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead><tr className="border-b bg-muted/50">{['Transaction ID', 'Student', 'Branch', 'Amount', 'Status', 'Date'].map((h) => <th key={h} className="p-4 text-left text-sm font-medium">{h}</th>)}</tr></thead>
          <tbody>
            {[
              { id: 'TXN-1029', student: 'Prakhar Bhardwaj', branch: 'London Campus', amount: '₹25,000', status: 'Completed', date: '2026-06-25' },
              { id: 'TXN-1030', student: 'Alex Johnson', branch: 'New York Campus', amount: '₹12,500', status: 'Pending', date: '2026-06-28' },
            ].map((txn) => (
              <tr key={txn.id} className="border-b">
                <td className="p-4 text-sm font-medium">{txn.id}</td>
                <td className="p-4 text-sm">{txn.student}</td>
                <td className="p-4 text-sm text-muted-foreground">{txn.branch}</td>
                <td className="p-4 text-sm font-medium">{txn.amount}</td>
                <td className="p-4"><Badge variant="secondary" className={txn.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20' : 'bg-amber-500/10 text-amber-500'}>{txn.status}</Badge></td>
                <td className="p-4 text-sm text-muted-foreground">{txn.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </PageShell>
  )
}

export function SuperAdminReportsPage() {
  return (
    <PageShell title="Global Reports" description="Generate organization-wide reports" actions={<Button>Generate Custom Report</Button>}>
      <div className="grid gap-4 sm:grid-cols-2">
        {['Global Financial Report', 'Branch Performance Comparison', 'Cross-branch Enrollment Trends', 'Staff Activity Summary'].map((r) => (
          <Card key={r}><CardContent className="p-5 flex justify-between items-center"><span className="font-medium">{r}</span><Button variant="outline" size="sm">Download CSV</Button></CardContent></Card>
        ))}
      </div>
    </PageShell>
  )
}

export function SuperAdminAnalyticsPage() {
  return (
    <PageShell title="Global Analytics" description="Organization-wide analytics and trends">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[{ l: 'Total Users', v: '12,450' }, { l: 'Active Branches', v: '4' }, { l: 'Course Enrollments', v: '8,342' }, { l: 'Avg. Retention', v: '94%' }].map((s) => (
          <Card key={s.l}><CardContent className="p-6"><p className="text-sm text-muted-foreground">{s.l}</p><p className="text-3xl font-bold mt-2">{s.v}</p></CardContent></Card>
        ))}
      </div>
      <div className="mt-8">
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          <p className="text-lg">Detailed Analytics Dashboard</p>
          <p className="text-sm mt-2">Advanced charts and metrics would be rendered here using Recharts.</p>
        </CardContent></Card>
      </div>
    </PageShell>
  )
}

export function SuperAdminAnnouncementsPage() {
  return (
    <PageShell title="Global Announcements" description="Broadcast announcements to all or specific branches" actions={<Button>New Broadcast</Button>}>
      <div className="space-y-4">
        {[
          { title: 'System Maintenance Window', target: 'All Branches', date: '2026-06-25', status: 'Published' },
          { title: 'New Curriculum Guidelines', target: 'London Campus', date: '2026-06-20', status: 'Published' },
          { title: 'Holiday Schedule Update', target: 'All Branches', date: '2026-07-01', status: 'Draft' },
        ].map((a) => (
          <Card key={a.title}><CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-lg">{a.title}</p>
              <div className="flex items-center gap-3 mt-1">
                <Badge variant="secondary">{a.target}</Badge>
                <span className="text-sm text-muted-foreground">{a.date}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={a.status === 'Published' ? 'text-emerald-500 border-emerald-500/20' : ''}>{a.status}</Badge>
              <Button variant="ghost" size="sm">Edit</Button>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </PageShell>
  )
}

export function SuperAdminSettingsPage() {
  return (
    <PageShell title="Global Settings" description="Organization-wide settings and configurations">
      <Card><CardContent className="p-6 space-y-8">
        <div className="space-y-4">
          <h3 className="font-semibold text-lg tracking-tight">Organization Profile</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><p className="font-medium text-sm">Organization Name</p><Input defaultValue="LearnFlow Global Inc." /></div>
            <div className="space-y-2"><p className="font-medium text-sm">Contact Email</p><Input defaultValue="admin@learnflow.global" /></div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="font-semibold text-lg tracking-tight">System Preferences</h3>
          {[{ label: 'Global Maintenance Mode', desc: 'Suspend access across all branches' }, { label: 'Cross-branch Analytics', desc: 'Enable aggregated data collection' }, { label: 'Strict Security Policies', desc: 'Enforce 2FA for all branch admins' }].map((s) => (
            <div key={s.label} className="flex items-center justify-between p-4 border rounded-lg">
              <div><p className="font-medium">{s.label}</p><p className="text-sm text-muted-foreground">{s.desc}</p></div>
              <Switch />
            </div>
          ))}
        </div>
        
        <div className="pt-4 border-t">
          <Button size="lg">Save Configuration</Button>
        </div>
      </CardContent></Card>
    </PageShell>
  )
}
