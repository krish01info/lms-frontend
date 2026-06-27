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
import { mockCourses } from '@/constants/mockData'

const categories = ['All', 'Mathematics', 'Science', 'Humanities', 'Technology']

export function CoursesPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filtered = useMemo(() => {
    return mockCourses.filter((course) => {
      const matchesSearch =
        course.title.toLowerCase().includes(search.toLowerCase()) ||
        course.instructor.toLowerCase().includes(search.toLowerCase())
      const matchesCategory = category === 'All' || course.category === category
      return matchesSearch && matchesCategory
    })
  }, [search, category])

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Courses"
        description="Browse and continue your enrolled courses"
      >
        <Badge variant="secondary" className="gap-1">
          <BookOpen className="h-3.5 w-3.5" />
          {mockCourses.length} enrolled
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
          description="Try adjusting your search or filter to find what you're looking for."
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
          {filtered.map((course) => (
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
