import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { PageShell } from '@/components/common/PageShell'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'

const schema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  category: z.string(),
  duration: z.string(),
})

export function CreateCoursePage() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm({ resolver: zodResolver(schema) })

  return (
    <PageShell title="Create Course" description="Set up a new course for your students">
      <Card>
        <CardContent className="p-6 space-y-5">
          <form onSubmit={handleSubmit(() => toast.success('Course created!'))} className="space-y-5">
            <div className="space-y-2"><Label>Course Title</Label><Input placeholder="Introduction to Data Science" {...register('title')} />{errors.title && <p className="text-xs text-destructive">Required</p>}</div>
            <div className="space-y-2"><Label>Description</Label><Input placeholder="Course description..." {...register('description')} /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2"><Label>Category</Label>
                <Select onValueChange={(v) => setValue('category', v)}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent><SelectItem value="math">Mathematics</SelectItem><SelectItem value="science">Science</SelectItem><SelectItem value="tech">Technology</SelectItem></SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Duration</Label><Input placeholder="16 weeks" {...register('duration')} /></div>
            </div>
            <Button type="submit">Create Course</Button>
          </form>
        </CardContent>
      </Card>
    </PageShell>
  )
}

export function TeacherCoursesPage() {
  return (
    <PageShell title="Manage Courses" description="View and manage your courses" searchable searchPlaceholder="Search courses...">
      <div className="grid gap-4">
        {['Advanced Mathematics', 'Computer Science Fundamentals', 'Data Structures'].map((title, i) => (
          <Card key={i}><CardContent className="flex items-center justify-between p-5">
            <div><p className="font-semibold">{title}</p><p className="text-sm text-muted-foreground">{[156, 210, 98][i]} students · {[12, 14, 10][i]} modules</p></div>
            <Button variant="outline" size="sm">Manage</Button>
          </CardContent></Card>
        ))}
      </div>
    </PageShell>
  )
}

export function TeacherAssignmentsPage() {
  return (
    <PageShell title="Assignments" description="Create and manage assignments" actions={<Button>Create Assignment</Button>}>
      <div className="space-y-3">
        {['Calculus Problem Set #6', 'Python Project Phase 2', 'Literature Review'].map((title, i) => (
          <Card key={i}><CardContent className="flex items-center justify-between p-5">
            <div><p className="font-medium">{title}</p><p className="text-sm text-muted-foreground">{[23, 45, 12][i]} submissions pending</p></div>
            <Button variant="outline" size="sm">Grade</Button>
          </CardContent></Card>
        ))}
      </div>
    </PageShell>
  )
}

export function QuizBuilderPage() {
  return (
    <PageShell title="Quiz Builder" description="Create interactive quizzes" actions={<Button>Create Quiz</Button>}>
      <Card><CardContent className="p-6 space-y-4">
        <div className="space-y-2"><Label>Quiz Title</Label><Input placeholder="Chapter 7 Quiz" /></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Duration (minutes)</Label><Input type="number" defaultValue={30} /></div>
          <div className="space-y-2"><Label>Total Questions</Label><Input type="number" defaultValue={20} /></div>
        </div>
        <div className="space-y-2"><Label>Question 1</Label><Input placeholder="Enter question text" /></div>
        {['A', 'B', 'C', 'D'].map((opt) => (
          <div key={opt} className="space-y-2"><Label>Option {opt}</Label><Input placeholder={`Option ${opt}`} /></div>
        ))}
        <Button>Add Question</Button>
      </CardContent></Card>
    </PageShell>
  )
}

export function TeacherAttendancePage() {
  return (
    <PageShell title="Attendance" description="Mark and manage student attendance">
      <Card><CardContent className="p-0">
        <table className="w-full">
          <thead><tr className="border-b"><th className="p-4 text-left text-sm font-medium">Student</th><th className="p-4 text-left text-sm font-medium">Status</th><th className="p-4 text-left text-sm font-medium">Action</th></tr></thead>
          <tbody>
            {['Alex Johnson', 'Emma Davis', 'James Wilson', 'Sarah Kim'].map((name) => (
              <tr key={name} className="border-b"><td className="p-4 text-sm">{name}</td><td className="p-4"><span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-600">Present</span></td>
                <td className="p-4"><Button variant="ghost" size="sm">Edit</Button></td></tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </PageShell>
  )
}

export function GradebookPage() {
  return (
    <PageShell title="Gradebook" description="View and manage student grades">
      <Card><CardContent className="p-0 overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead><tr className="border-b bg-muted/50">
            {['Student', 'Assignment 1', 'Assignment 2', 'Quiz 1', 'Average'].map((h) => (
              <th key={h} className="p-4 text-left text-sm font-medium">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {[{ name: 'Alex Johnson', grades: [92, 88, 95, 91.7] }, { name: 'Emma Davis', grades: [85, 90, 82, 85.7] }].map((s) => (
              <tr key={s.name} className="border-b">
                <td className="p-4 text-sm font-medium">{s.name}</td>
                {s.grades.map((g, i) => (<td key={i} className="p-4 text-sm">{typeof g === 'number' ? (i === 3 ? <span className="font-bold text-primary">{g}%</span> : g) : g}</td>))}
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent></Card>
    </PageShell>
  )
}

export function AnnouncementsPage() {
  return (
    <PageShell title="Announcements" description="Post announcements to your classes" actions={<Button>New Announcement</Button>}>
      <div className="space-y-3">
        {[{ title: 'Mid-term Exam Schedule', date: 'Jun 25', course: 'All Courses' }, { title: 'Lab Session Moved', date: 'Jun 24', course: 'Physics' }].map((a) => (
          <Card key={a.title}><CardContent className="p-5">
            <p className="font-medium">{a.title}</p>
            <p className="text-sm text-muted-foreground">{a.course} · {a.date}</p>
          </CardContent></Card>
        ))}
      </div>
    </PageShell>
  )
}

export function PerformancePage() {
  return (
    <PageShell title="Student Performance" description="Analyze student performance metrics">
      <div className="grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-6 text-center"><p className="text-sm text-muted-foreground">Class Average</p><p className="text-3xl font-bold">87%</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><p className="text-sm text-muted-foreground">Top Performer</p><p className="text-xl font-bold">Alex Johnson</p></CardContent></Card>
        <Card><CardContent className="p-6 text-center"><p className="text-sm text-muted-foreground">At Risk</p><p className="text-3xl font-bold text-amber-600">3</p></CardContent></Card>
      </div>
    </PageShell>
  )
}

export { MessagesPage as TeacherMessagesPage } from '@/pages/student/MessagesPage'

export function TeacherAnalyticsPage() {
  return (
    <PageShell title="Analytics" description="Detailed teaching analytics">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground mb-2">Course Completion Rate</p><p className="text-4xl font-bold text-primary">78%</p></CardContent></Card>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground mb-2">Avg. Assignment Score</p><p className="text-4xl font-bold text-emerald-600">84%</p></CardContent></Card>
      </div>
    </PageShell>
  )
}

export function TeacherResourcesPage() {
  return (
    <PageShell title="Resources" description="Manage course resources" actions={<Button>Upload Resource</Button>}>
      <div className="grid gap-3 sm:grid-cols-2">
        {['Lecture Slides Ch.7', 'Practice Problems', 'Video Recording'].map((r) => (
          <Card key={r}><CardContent className="p-5 flex justify-between items-center"><span className="font-medium">{r}</span><Button variant="ghost" size="sm">Edit</Button></CardContent></Card>
        ))}
      </div>
    </PageShell>
  )
}

export { ProfilePage as TeacherProfilePage } from '@/pages/student/ProfilePage'
