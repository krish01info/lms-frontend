import { motion } from 'framer-motion'
import {
  Award,
  BookOpen,
  Calendar,
  GraduationCap,
  Mail,
  MapPin,
  Trophy,
  User as UserIcon,
} from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/common/PageHeader'
import { StatCard } from '@/components/common/StatCard'
import { EmptyState } from '@/components/common/EmptyState'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { mockCourses } from '@/constants/mockData'
import api from '@/services/api'
import type { User } from '@/types'

const achievements = [
  { title: 'Dean\'s List', description: 'Top 15% GPA for 2 semesters', icon: Trophy, earned: true },
  { title: 'Perfect Attendance', description: '100% attendance in English', icon: Calendar, earned: true },
  { title: 'Quiz Master', description: 'Score 90%+ on 5 quizzes', icon: GraduationCap, earned: false },
  { title: 'Course Champion', description: 'Complete all 4 courses', icon: BookOpen, earned: false },
  { title: 'Scholar Award', description: 'Maintain 3.8+ GPA', icon: Award, earned: true },
]

export function ProfilePage() {
  // Fetch live profile from real backend instead of relying only on cached localStorage user
  const { data: user, isLoading, isError } = useQuery<User>({
    queryKey: ['current-user'],
    queryFn: async () => {
      const res = await api.get('/users/me')
      // NOTE: assumes GET /users/me returns { data: { user: {...} } },
      // matching the shape of /auth/login and /auth/register.
      // If the raw Postman response was { data: {...} } instead, change this to:
      //   return res.data.data
      return res.data.data.user
    },
  })

  const avgProgress = Math.round(
    mockCourses.reduce((acc, c) => acc + c.progress, 0) / mockCourses.length
  )

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

      <div className="grid gap-4 sm:grid-cols-4">
        <StatCard label="GPA" value="3.85" trend="up" change="Top 15%" icon={Award} />
        <StatCard label="Courses" value={mockCourses.length} icon={BookOpen} iconClassName="bg-secondary/10" />
        <StatCard label="Attendance" value="92%" trend="up" icon={Calendar} iconClassName="bg-emerald-500/10" />
        <StatCard label="Avg. Progress" value={`${avgProgress}%`} icon={Trophy} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Enrolled Courses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {mockCourses.map((course) => (
              <div key={course.id} className="flex items-center gap-4">
                <img
                  src={course.image}
                  alt={course.title}
                  className="h-12 w-12 rounded-xl object-cover"
                />
                <div className="flex-1 space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium line-clamp-1">{course.title}</span>
                    <span className="text-muted-foreground shrink-0 ml-2">{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-1.5" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Achievements</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {achievements.map((achievement, i) => (
              <motion.div
                key={achievement.title}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 rounded-2xl border border-border p-4"
              >
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${achievement.earned ? 'bg-amber-500/10' : 'bg-muted'}`}>
                  <achievement.icon className={`h-5 w-5 ${achievement.earned ? 'text-amber-600' : 'text-muted-foreground'}`} />
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${!achievement.earned && 'text-muted-foreground'}`}>
                    {achievement.title}
                  </p>
                  <p className="text-xs text-muted-foreground">{achievement.description}</p>
                </div>
                {achievement.earned ? (
                  <Badge variant="success">Earned</Badge>
                ) : (
                  <Badge variant="outline">Locked</Badge>
                )}
              </motion.div>
            ))}
          </CardContent>
        </Card>
      </div>

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
    </div>
  )
}
