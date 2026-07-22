import { useRef, useState } from 'react'
import {
  BookOpen,
  Calendar,
  ClipboardCheck,
  GraduationCap,
  Layers,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react'
import { toast } from 'sonner'
import { PageHeader } from '@/components/common/PageHeader'
import { PageSkeleton, CardSkeleton } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { StatCard } from '@/components/common/StatCard'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useMyProfile, useTeachingStats, useUpdateProfile, useUploadAvatar } from '@/hooks/useUserData'

const MAX_AVATAR_BYTES = 2 * 1024 * 1024 // backend hard limit: 2 MB
const ACCEPTED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp']

const courseStatusBadge: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  PUBLISHED: { label: 'Published', variant: 'default' },
  DRAFT: { label: 'Draft', variant: 'secondary' },
  ARCHIVED: { label: 'Archived', variant: 'outline' },
}

export function TeacherProfilePage() {
  const profileQuery = useMyProfile()
  const statsQuery = useTeachingStats()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [editOpen, setEditOpen] = useState(false)
  const [nameDraft, setNameDraft] = useState('')

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Profile" description="Your instructor profile" />
        <PageSkeleton />
      </div>
    )
  }

  if (profileQuery.isError || !profileQuery.data) {
    return (
      <div className="space-y-6">
        <PageHeader title="Profile" description="Your instructor profile" />
        <ErrorState message="Could not load your profile. Please try again." onRetry={() => profileQuery.refetch()} />
      </div>
    )
  }

  const profile = profileQuery.data

  const openEdit = () => {
    setNameDraft(profile.name)
    setEditOpen(true)
  }

  const saveEdit = () => {
    const trimmed = nameDraft.trim()
    if (trimmed.length < 2) {
      toast.error('Name must be at least 2 characters.')
      return
    }
    updateProfile.mutate(
      { name: trimmed },
      {
        onSuccess: () => {
          toast.success('Profile updated!')
          setEditOpen(false)
        },
        onError: () => toast.error('Could not update your profile. Please try again.'),
      }
    )
  }

  const handleAvatarPick = () => fileInputRef.current?.click()

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-selecting the same file later
    if (!file) return

    if (!ACCEPTED_AVATAR_TYPES.includes(file.type)) {
      toast.error('Please pick a JPEG, PNG, or WebP image.')
      return
    }
    if (file.size > MAX_AVATAR_BYTES) {
      toast.error('Image must be under 2 MB.')
      return
    }

    uploadAvatar.mutate(file, {
      onSuccess: () => toast.success('Avatar updated!'),
      onError: () => toast.error('Could not upload avatar. Please try again.'),
    })
  }

  const memberSince = new Date(profile.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Your instructor profile" />

      <Card>
        <CardContent className="p-0">
          <div className="h-32 rounded-t-2xl gradient-primary" />
          <div className="relative px-6 pb-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-end gap-4 -mt-12">
                <div className="relative">
                  <Avatar className="h-24 w-24 border-4 border-card shadow-lg">
                    <AvatarImage src={profile.avatar ?? undefined} />
                    <AvatarFallback className="text-2xl">{profile.name[0]}</AvatarFallback>
                  </Avatar>
                  <button
                    type="button"
                    onClick={handleAvatarPick}
                    disabled={uploadAvatar.isPending}
                    className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full border-2 border-card bg-primary text-primary-foreground shadow-md disabled:opacity-60"
                    aria-label="Change avatar"
                  >
                    {uploadAvatar.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <span className="text-xs font-bold">+</span>
                    )}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarFile}
                  />
                </div>
                <div className="pb-1">
                  <h2 className="text-2xl font-bold">{profile.name}</h2>
                  <Badge variant="secondary" className="mt-1 capitalize">{profile.role}</Badge>
                </div>
              </div>
              <Button variant="outline" onClick={openEdit}>Edit Profile</Button>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">{profile.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4">
                <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Verification</p>
                  <p className="text-sm font-medium">{profile.isVerified ? 'Verified' : 'Not verified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl bg-muted/50 p-4">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Member since</p>
                  <p className="text-sm font-medium">{memberSince}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {statsQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <CardSkeleton /><CardSkeleton /><CardSkeleton /><CardSkeleton />
        </div>
      ) : statsQuery.isError || !statsQuery.data ? (
        <ErrorState message="Could not load your teaching stats. Please try again." onRetry={() => statsQuery.refetch()} />
      ) : (
        <TeachingStatsSection stats={statsQuery.data} />
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={nameDraft} onChange={(e) => setNameDraft(e.target.value)} placeholder="Your name" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={profile.email} disabled />
              <p className="text-xs text-muted-foreground">Email can't be changed here.</p>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              <Button onClick={saveEdit} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function TeachingStatsSection({ stats }: { stats: import('@/types').TeachingStats }) {
  const lastCourseDate = stats.lastCourseCreatedAt
    ? new Date(stats.lastCourseCreatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })
    : null

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Students Taught" value={stats.totalStudents} icon={GraduationCap} />
        <StatCard
          label="Courses"
          value={stats.totalCourses}
          change={`${stats.publishedCount} published · ${stats.draftCount} draft`}
          trend="neutral"
          icon={BookOpen}
        />
        <StatCard label="Quizzes Created" value={stats.quizStats.totalQuizzes} icon={ClipboardCheck} />
        <StatCard
          label="Quiz Pass Rate"
          value={stats.quizStats.passRate !== null ? `${stats.quizStats.passRate}%` : '—'}
          change={stats.quizStats.totalAttempts > 0 ? `${stats.quizStats.totalAttempts} attempts` : 'No attempts yet'}
          trend="neutral"
          icon={Target}
        />
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Subjects Taught</h3>
          </div>
          {stats.categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet — assign one when creating a course.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {stats.categories.map((cat) => (
                <Badge key={cat} variant="secondary">{cat}</Badge>
              ))}
            </div>
          )}
          <div className="flex items-center gap-2 pt-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {lastCourseDate ? (
              <span>Last course created on {lastCourseDate}</span>
            ) : (
              <span>No courses created yet</span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <h3 className="font-semibold">Your Courses</h3>
          </div>
          {stats.courses.length === 0 ? (
            <EmptyState icon={BookOpen} title="No courses yet" description="Courses you create will show up here." />
          ) : (
            <div className="space-y-3">
              {stats.courses.map((course) => {
                const badge = courseStatusBadge[course.status] ?? { label: course.status, variant: 'outline' as const }
                return (
                  <div key={course.id} className="flex items-center justify-between rounded-2xl bg-muted/50 p-4">
                    <div>
                      <p className="font-medium">{course.title}</p>
                      <p className="text-xs text-muted-foreground">{course.studentCount} student{course.studentCount === 1 ? '' : 's'}</p>
                    </div>
                    <Badge variant={badge.variant}>{badge.label}</Badge>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}
