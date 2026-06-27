import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/utils/cn'
import { Card, CardContent } from '@/components/ui/card'

interface StatCardProps {
  label: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  className?: string
  iconClassName?: string
}

export function StatCard({ label, value, change, trend, icon: Icon, className, iconClassName }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Card className={cn('overflow-hidden hover:shadow-lg hover:shadow-primary/5 transition-shadow duration-300', className)}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold tracking-tight">{value}</p>
              {change && (
                <p
                  className={cn(
                    'text-xs font-medium',
                    trend === 'up' && 'text-emerald-600 dark:text-emerald-400',
                    trend === 'down' && 'text-red-500',
                    trend === 'neutral' && 'text-muted-foreground'
                  )}
                >
                  {change}
                </p>
              )}
            </div>
            <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10', iconClassName)}>
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
