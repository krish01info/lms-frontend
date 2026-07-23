import { type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'
import { PageHeader } from '@/components/common/PageHeader'
import { SearchBar } from '@/components/common/SearchBar'

interface PageShellProps {
  title: string
  description?: string
  actions?: ReactNode
  searchable?: boolean
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  children: ReactNode
}

export function PageShell({
  title,
  description,
  actions,
  searchable,
  searchPlaceholder,
  onSearch,
  children,
}: PageShellProps) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description}>
        {actions}
      </PageHeader>
      {searchable && (
        <SearchBar placeholder={searchPlaceholder} onChange={onSearch} className="max-w-md" />
      )}
      {children}
    </div>
  )
}

interface InfoCardProps {
  icon: LucideIcon
  title: string
  value: string | number
  subtitle?: string
}

export function InfoCard({ icon: Icon, title, value, subtitle }: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-xl font-bold">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        </div>
      </div>
    </div>
  )
}
