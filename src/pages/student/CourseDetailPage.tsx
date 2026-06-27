import { useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { BookOpen, Download, FileText, MessageSquare, Play, Star, Users } from 'lucide-react'
import { Breadcrumbs } from '@/components/common/Breadcrumbs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mockAssignments, mockCourses } from '@/constants/mockData'

const modules = [
  { id: 1, title: 'Introduction to Calculus', lessons: 5, completed: 5 },
  { id: 2, title: 'Derivatives & Applications', lessons: 8, completed: 6 },
  { id: 3, title: 'Integration Techniques', lessons: 7, completed: 3 },
  { id: 4, title: 'Differential Equations', lessons: 6, completed: 0 },
]

export function CourseDetailPage() {
  const { id } = useParams()
  const course = mockCourses.find((c) => c.id === id) ?? mockCourses[0]

  return (
    <div className="space-y-6">
      <Breadcrumbs items={[{ label: 'Courses', href: '/student/courses' }, { label: course.title }]} />

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative overflow-hidden rounded-3xl">
        <img src={course.image} alt={course.title} className="h-64 w-full object-cover sm:h-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
          <Badge className="mb-3">{course.category}</Badge>
          <h1 className="text-2xl font-bold text-white sm:text-4xl">{course.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/80">
            <span className="flex items-center gap-1"><Users className="h-4 w-4" />{course.students} students</span>
            <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" />{course.rating}</span>
            <span>{course.duration}</span>
          </div>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs defaultValue="modules">
            <TabsList>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="resources">Resources</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="discussion">Discussion</TabsTrigger>
            </TabsList>
            <TabsContent value="modules" className="space-y-3">
              {modules.map((mod) => (
                <Card key={mod.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center gap-4 p-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                      <Play className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{mod.title}</p>
                      <p className="text-sm text-muted-foreground">{mod.completed}/{mod.lessons} lessons completed</p>
                      <Progress value={(mod.completed / mod.lessons) * 100} className="mt-2" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="resources" className="space-y-3">
              {['Chapter 7 Notes.pdf', 'Practice Problems.pdf', 'Formula Sheet.pdf'].map((file) => (
                <Card key={file}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <span className="text-sm font-medium">{file}</span>
                    </div>
                    <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="assignments" className="space-y-3">
              {mockAssignments.filter((a) => a.course === course.title).map((a) => (
                <Card key={a.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div>
                      <p className="font-medium">{a.title}</p>
                      <p className="text-sm text-muted-foreground">Due {a.dueDate}</p>
                    </div>
                    <Badge>{a.status}</Badge>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
            <TabsContent value="discussion" className="space-y-3">
              {['Question about integration by parts', 'Help with problem 15', 'Study group for midterm'].map((topic) => (
                <Card key={topic} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="flex items-center gap-3 p-4">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{topic}</span>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Instructor</CardTitle></CardHeader>
            <CardContent className="flex items-center gap-4">
              <img src={course.instructorAvatar} alt={course.instructor} className="h-14 w-14 rounded-2xl object-cover" />
              <div>
                <p className="font-semibold">{course.instructor}</p>
                <p className="text-sm text-muted-foreground">Department Head</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Your Progress</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-4xl font-bold text-primary">{course.progress}%</p>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
              <Progress value={course.progress} className="h-3" />
              <Button className="w-full"><BookOpen className="mr-2 h-4 w-4" />Continue Learning</Button>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground leading-relaxed">{course.description}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
