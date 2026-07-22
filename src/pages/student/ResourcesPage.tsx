import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { Download, File, FileImage, FileText, FileVideo, FolderOpen, Loader2 } from 'lucide-react'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchBar } from '@/components/common/SearchBar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { transformResource } from '@/utils/transformers'
import api from '@/services/api'
import { cn } from '@/utils/cn'
import type { Resource, ResourceType } from '@/types'

const typeIcons: Record<ResourceType, typeof FileText> = {
  pdf: FileText,
  doc: File,
  video: FileVideo,
  image: FileImage,
  other: File,
}

const typeColors: Record<ResourceType, string> = {
  pdf: 'bg-red-500/10 text-red-600',
  doc: 'bg-blue-500/10 text-blue-600',
  video: 'bg-purple-500/10 text-purple-600',
  image: 'bg-amber-500/10 text-amber-600',
  other: 'bg-muted text-muted-foreground',
}

export function ResourcesPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [resources, setResources] = useState<Resource[]>([])
  const [courseCount, setCourseCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchResources() {
      setIsLoading(true)
      setError(null)
      try {
        const coursesRes = await api.get('/courses/enrolled')
        const courses = coursesRes.data?.data?.courses ?? []

        const perCourseResults = await Promise.all(
          courses.map(async (course: any) => {
            try {
              const res = await api.get(`/courses/${course.id}/resources`)
              const raw = res.data?.data?.resources ?? []
              return raw.map((r: any) => transformResource(r, course.title))
            } catch {
              // If one course's resources fail to load, don't fail the whole page
              return []
            }
          })
        )

        if (!cancelled) {
          setResources(perCourseResults.flat())
          setCourseCount(courses.length)
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Failed to load resources')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchResources()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    return resources.filter((r) => {
      const matchesSearch =
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.course.toLowerCase().includes(search.toLowerCase())
      const matchesType = typeFilter === 'all' || r.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [search, typeFilter, resources])

  return (
    <div className="space-y-6">
      <PageHeader title="Resources" description="Download study materials and course resources">
        <Badge variant="secondary" className="gap-1">
          <FolderOpen className="h-3.5 w-3.5" />
          {resources.length} files
        </Badge>
      </PageHeader>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <SearchBar
          placeholder="Search resources..."
          value={search}
          onChange={setSearch}
          className="sm:max-w-sm"
        />
        <Tabs value={typeFilter} onValueChange={setTypeFilter}>
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="pdf">PDF</TabsTrigger>
            <TabsTrigger value="doc">Docs</TabsTrigger>
            <TabsTrigger value="video">Video</TabsTrigger>
            <TabsTrigger value="image">Images</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading resources...
        </div>
      ) : error ? (
        <EmptyState icon={FolderOpen} title="Couldn't load resources" description={error} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={FolderOpen}
          title="No resources found"
          description="Try a different search term or filter."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((resource, i) => {
            const Icon = typeIcons[resource.type]
            return (
              <motion.div
                key={resource.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className={cn('flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl', typeColors[resource.type])}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold line-clamp-2">{resource.title}</h3>
                        <p className="mt-1 text-sm text-muted-foreground line-clamp-1">
                          {resource.course}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                      <span>{resource.size}</span>
                      <span>By {resource.uploadedBy}</span>
                    </div>

                    <Button variant="outline" className="mt-4 w-full gap-2" asChild>
                      <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                        <Download className="h-4 w-4" />
                        Download
                      </a>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      )}

      {!isLoading && !error && (
        <Card className="border-dashed">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Resources are organized by {courseCount} enrolled course{courseCount !== 1 ? 's' : ''}. New materials are added as they're uploaded.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}