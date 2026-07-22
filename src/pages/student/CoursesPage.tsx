import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Filter } from 'lucide-react'
import { CourseCard } from '@/components/common/CourseCard'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchBar } from '@/components/common/SearchBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useQuery } from '@tanstack/react-query'
import api from '@/services/api'
import { transformCourse } from '@/utils/transformers'

const categories = ['All', 'Mathematics', 'Science', 'Humanities', 'Technology', 'General']

export function CoursesPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  // Fetch enrolled courses from real backend
  const { data, isLoading, isError } = useQuery({
    queryKey: ['enrolled-courses'],
    queryFn: async () => {
      const res = await api.get('/courses/enrolled')
      return res.data.data.courses.map(transformCourse)
    }
  })

  // Same queryKey as ProgressPage/ProfilePage/CourseDetailPage — shares cache
  const { data: progressData } = useQuery({
    queryKey: ['progress-my'],
    queryFn: async () => {
      const res = await api.get('/progress/my')
      return res.data.data.progress
    },
  })

  const progressByCourseId = useMemo(() => {
    return new Map<string, number>(
      (progressData || []).map((p: any) => [p.courseId, p.percentage] as [string, number])
    )
  }, [progressData])

  const courses = useMemo(() => {
    return (data || []).map((course: any) => ({
      ...course,
      progress: progressByCourseId.get(course.id) ?? 0,
    }))
  }, [data, progressByCourseId])

  const filtered = useMemo(() => {
    return courses.filter((course: any) => {
      const matchesSearch =
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.instructor.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'All' || course.category === category
      return matchesSearch && matchesCategory
    })
  }, [courses, search, category])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Courses" description="Browse and continue your enrolled courses" />
        <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <PageHeader title="My Courses" description="Browse and continue your enrolled courses" />
        <EmptyState
          icon={BookOpen}
          title="Failed to load courses"
          description="Could not connect to the server. Please try again."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Courses"
        description="Browse and continue your enrolled courses"
      >
        <Badge variant="secondary" className="gap-1">
          <BookOpen className="h-3.5 w-3.5" />
          {courses.length} enrolled
        </Badge>
      </PageHeader>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          placeholder="Search courses or instructors..."
          value={search}
          onChange={setSearch}
          className="sm:max-w-sm"
        />
        <Tabs value={category} onValueChange={setCategory}>
          <TabsList className="h-auto flex-wrap">
            {categories.map((cat) => (
              <TabsTrigger key={cat} value={cat} className="text-xs sm:text-sm">
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Filter}
          title="No courses found"
          description="You haven't enrolled in any courses yet, or no courses match your filter."
          actionLabel="Clear filters"
          onAction={() => {
            setSearch('')
            setCategory('All')
          }}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3"
        >
          {filtered.map((course: any) => (
            <CourseCard
              key={course.id}
              course={course}
              href={`/student/courses/${course.id}`}
            />
          ))}
        </motion.div>
      )}

      <div className="flex justify-center">
        <Button variant="outline" disabled>
          Load more courses
        </Button>
      </div>
    </div>
  )
}