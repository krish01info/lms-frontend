import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/utils/cn'

interface SearchBarProps {
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  className?: string
}

export function SearchBar({ placeholder = 'Search...', value, onChange, className }: SearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="pl-11"
      />
    </div>
  )
}
