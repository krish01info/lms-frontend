import {
  BookOpen,
  Calendar,
  Copy,
  GraduationCap,
  Mail,
  MapPin,
  RefreshCw,
  Share2,
  Shield,
  Trophy,
  User as UserIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import api from '@/services/api'
import { transformCourse } from '@/utils/transformers'
import type { User } from '@/types'
import { toast } from 'sonner'

export function ProfilePage() {
  const queryClient = useQueryClient()
  const [copied, setCopied] = useState(false)

  // Live profile data
  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useQuery<User>({
    queryKey: ['current-user'],
    queryFn: async () => {
      const res = await api.get('/users/me')
      return res.data.data.user
    },
  })

  // Live enrolled courses — same queryKey as CoursesPage so the cache is shared
  const {
    data: courseData,
    isLoading: isCoursesLoading,
    isError: isCoursesError,
  } = useQuery({
    queryKey: ['enrolled-courses'],
    queryFn: async () => {
      const res = await api.get('/courses/enrolled')
      return res.data.data.courses.map(transformCourse)
    },
  })

  // Live progress data — same queryKey as ProgressPage so the cache is shared
  const {
    data: progressData,
    isLoading: isProgressLoading,
  } = useQuery({
    queryKey: ['progress-my'],
    queryFn: async () => {
      const res = await api.get('/progress/my')
      return res.data.data.progress
    },
  })

  // Live attendance data — same queryKey as AttendancePage, shares cache
  const {
    data: attendanceData,
    isLoading: isAttendanceLoading,
  } = useQuery({
    queryKey: ['attendance-my'],
    queryFn: async () => {
      const res = await api.get('/attendance/my')
      return res.data.data
    },
  })

  // Fetch existing parent invite code
  const { data: inviteCodeData, isLoading: isCodeLoading } = useQuery({
    queryKey: ['parent-invite-code'],
    queryFn: async () => {
      const res = await api.get('/users/parent-code')
      return res.data.data as { code: string | null; expiresAt: string | null }
    },
  })

  // Generate new invite code mutation
  const generateCodeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/users/generate-parent-code')
      return res.data.data as { code: string; expiresAt: string }
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['parent-invite-code'], data)
      toast.success('New invite code generated!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to generate code.')
    },
  })

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopied(true)
    toast.success('Code copied to clipboard!')
    setTimeout(() => setCopied(false), 2000)
  }

  const getExpiryLabel = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now()
    if (diff <= 0) return 'Expired'
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    return hours > 0 ? `Expires in ${hours}h ${minutes}m` : `Expires in ${minutes}m`
  }

  const courses = courseData || []
  const progress = progressData || []
  const isLoading = isUserLoading || isCoursesLoading || isProgressLoading || isAttendanceLoading
  const isError = isUserError || isCoursesError

  // Map courseId -> percentage from real progress data
  const progressByCourseId = new Map<string, number>(
    progress.map((p: any) => [p.courseId, p.percentage] as [string, number])
  )

  const avgProgress = progress.length
    ? Math.round(progress.reduce((acc: number, c: any) => acc + c.percentage, 0) / progress.length)
    : 0

  const attendancePercentage = attendanceData?.overallPercentage ?? 0

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Profile" description="Your academic profile and achievements" />
        <div className="h-64 rounded-xl bg-muted animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError || !user) {
    return (
      <div className="space-y-6">
        <PageHeader title="Profile" description="Your academic profile and achievements" />
        <EmptyState
          icon={UserIcon}
          title="Failed to load profile"
          description="Could not connect to the server. Please try again."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your academic profile and achievements" />

      <Card>
        <CardContent className="p-0">
          <div className="h-32 rounded-t-2xl gradient-primary" />
          <div className="relative px-6 pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4 -mt-12">
                <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-2xl">{user?.name?.[0]}</AvatarFallback>
                </Avatar>
                <div className="pb-1">
                  <h2 className="text-2xl font-bold">{user?.name}</h2>
                  <p className="text-muted-foreground">{user?.grade}</p>
                </div>
              </div>
              <Button variant="outline">Edit Profile</Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{user?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Campus</p>
                  <p className="text-sm font-medium">LearnFlow Academy</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4">
                <GraduationCap className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Student ID</p>
                  <p className="text-sm font-medium">STU-2026-{user?.id?.padStart(4, '0')}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Courses" value={courses.length} icon={BookOpen} iconClassName="bg-secondary/10" />
        <StatCard label="Attendance" value={`${attendancePercentage}%`} icon={Calendar} iconClassName="bg-emerald-500/10" />
        <StatCard label="Avg. Progress" value={`${avgProgress}%`} icon={Trophy} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enrolled Courses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {courses.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              No enrolled courses yet.
            </p>
          ) : (
            courses.map((course: any) => {
              const coursePercentage: number = progressByCourseId.get(course.id) ?? 0
              return (
                <div key={course.id} className="flex items-center gap-4">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="h-12 w-12 rounded-xl object-cover"
                  />
                  <div className="flex-1 space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium line-clamp-1">{course.title}</span>
                      <span className="text-muted-foreground shrink-0 ml-2">{coursePercentage}%</span>
                    </div>
                    <Progress value={coursePercentage} className="h-1.5" />
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">About</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Passionate student focused on mathematics and computer science. Active participant in class discussions
            and science fair projects. Aiming for a career in software engineering with a strong foundation in STEM subjects.
          </p>
          <Separator className="my-4" />
          <div className="flex flex-wrap gap-2">
            {['Mathematics', 'Physics', 'Programming', 'Literature', 'Science Fair'].map((interest) => (
              <Badge key={interest} variant="secondary">{interest}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ── Share with Parent ──────────────────────────────────────────────── */}
      <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-secondary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-4 w-4 text-primary" />
            Share with Parent
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Generate a one-time 6-character invite code. Share it with your parent so they can
            link to your account and monitor your progress. The code expires in <strong>24 hours</strong> and
            is invalidated after use.
          </p>

          {isCodeLoading ? (
            <div className="h-14 rounded-xl bg-muted animate-pulse" />
          ) : inviteCodeData?.code ? (
            <div className="space-y-3">
              {/* Code display */}
              <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-background p-4">
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">Your invite code</p>
                  <p className="text-3xl font-bold tracking-[0.4em] text-primary font-mono">
                    {inviteCodeData.code}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopy(inviteCodeData.code!)}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4 mr-1.5" />
                  {copied ? 'Copied!' : 'Copy'}
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  ⏱ {inviteCodeData.expiresAt ? getExpiryLabel(inviteCodeData.expiresAt) : ''}
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => generateCodeMutation.mutate()}
                  disabled={generateCodeMutation.isPending}
                >
                  <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${generateCodeMutation.isPending ? 'animate-spin' : ''}`} />
                  Regenerate
                </Button>
              </div>
            </div>
          ) : (
            <Button
              onClick={() => generateCodeMutation.mutate()}
              disabled={generateCodeMutation.isPending}
              className="w-full"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {generateCodeMutation.isPending ? 'Generating...' : 'Generate Invite Code'}
            </Button>
          )}
        </CardContent>
      </Card>
    </div>

  )
}