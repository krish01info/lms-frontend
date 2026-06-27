import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ClipboardList } from 'lucide-react'
import { AssignmentCard } from '@/components/common/AssignmentCard'
import { EmptyState } from '@/components/common/EmptyState'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchBar } from '@/components/common/SearchBar'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { mockAssignments } from '@/constants/mockData'
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

  const filtered = useMemo(() => {
    return mockAssignments.filter((a) => {
      const matchesSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.course.toLowerCase().includes(search.toLowerCase())
      const matchesStatus = status === 'all' || a.status === status
      return matchesSearch && matchesStatus
    })
  }, [search, status])

  const pendingCount = mockAssignments.filter((a) => a.status === 'pending' || a.status === 'overdue').length

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

      {filtered.length === 0 ? (
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
