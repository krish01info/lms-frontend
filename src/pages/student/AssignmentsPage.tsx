import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList, Loader2 } from 'lucide-react'
import { AssignmentCard } from '@/components/common/AssignmentCard'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchBar } from '@/components/common/SearchBar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { transformAssignment } from '@/utils/transformers'
import api from '@/services/api'
import type { Assignment } from '@/types'

type StatusFilter = 'all' | Assignment['status']

const statusTabs: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'graded', label: 'Graded' },
  { value: 'overdue', label: 'Overdue' },
]

export function AssignmentsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<StatusFilter>('all')
  const [assignments, setAssignments] = useState<Assignment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    async function fetchAssignments() {
      setIsLoading(true)
      setError(null)
      try {
        const res = await api.get('/assignments')
        const raw = res.data?.data?.assignments ?? []
        if (!cancelled) {
          setAssignments(raw.map(transformAssignment))
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.response?.data?.message || 'Failed to load assignments')
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchAssignments()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.course.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = status === 'all' || a.status === status
      return matchesSearch && matchesStatus
    })
  }, [search, status, assignments])

  const pendingCount = assignments.filter(
    (a) => a.status === 'pending' || a.status === 'overdue'
  ).length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assignments"
        description="Track, submit, and review your coursework"
      >
        <Badge variant="warning">{pendingCount} due</Badge>
      </PageHeader>

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <SearchBar
          placeholder="Search assignments..."
          value={search}
          onChange={setSearch}
          className="lg:max-w-sm"
        />
        <Tabs value={status} onValueChange={(v) => setStatus(v as StatusFilter)}>
          <TabsList className="h-auto flex-wrap">
            {statusTabs.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value}>
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          Loading assignments...
        </div>
      ) : error ? (
        <EmptyState
          icon={ClipboardList}
          title="Couldn't load assignments"
          description={error}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          title="No assignments found"
          description="No assignments match your current filters."
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {filtered.map((assignment) => (
            <AssignmentCard key={assignment.id} assignment={assignment} />
          ))}
        </motion.div>
      )}
    </div>
  )
}