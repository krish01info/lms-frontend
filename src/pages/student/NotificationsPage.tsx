import { useState } from 'react'
import { motion } from 'framer-motion'
import { formatDistanceToNow, parseISO } from 'date-fns'
import {
  Bell,
  CheckCheck,
  ClipboardList,
  CreditCard,
  GraduationCap,
  Megaphone,
} from 'lucide-react'
import { PageHeader } from '@/components/common/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useNotifications } from '@/hooks/useNotifications'
import { cn } from '@/utils/cn'
import type { ApiNotification } from '@/types'

const typeConfig: Record<ApiNotification['type'], { icon: typeof Bell; color: string }> = {
  GENERAL: { icon: Bell, color: 'bg-primary/10 text-primary' },
  ENROLLMENT: { icon: GraduationCap, color: 'bg-emerald-500/10 text-emerald-600' },
  ASSIGNMENT: { icon: ClipboardList, color: 'bg-blue-500/10 text-blue-600' },
  QUIZ: { icon: GraduationCap, color: 'bg-purple-500/10 text-purple-600' },
  PAYMENT: { icon: CreditCard, color: 'bg-amber-500/10 text-amber-600' },
  CERTIFICATE: { icon: Megaphone, color: 'bg-rose-500/10 text-rose-600' },
  PARENT_STUDENT: { icon: Bell, color: 'bg-cyan-500/10 text-cyan-600' },
  ANNOUNCEMENT: { icon: Megaphone, color: 'bg-orange-500/10 text-orange-600' },
}

export function NotificationsPage() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications()
  const [filter, setFilter] = useState<'all' | 'unread'>('all')

  const filtered = filter === 'unread'
    ? notifications.filter((n) => !n.isRead)
    : notifications

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Stay updated on assignments, grades, and announcements">
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Badge variant="destructive">{unreadCount} unread</Badge>
          )}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => markAllAsRead()}
            disabled={unreadCount === 0}
          >
            <CheckCheck className="h-4 w-4" />
            Mark all read
          </Button>
        </div>
      </PageHeader>

      <Tabs value={filter} onValueChange={(v) => setFilter(v as 'all' | 'unread')}>
        <TabsList>
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread ({unreadCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="space-y-3">
        {isLoading ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <p className="text-sm text-muted-foreground">Loading notifications...</p>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center py-12 text-center">
              <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="font-medium">All caught up!</p>
              <p className="text-sm text-muted-foreground">No unread notifications.</p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((notification, i) => {
            const config = typeConfig[notification.type]
            const Icon = config.icon

            return (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Card
                  className={cn(
                    'cursor-pointer transition-all hover:shadow-md',
                    !notification.isRead && 'border-primary/30 bg-primary/5'
                  )}
                  onClick={() => !notification.isRead && markAsRead(notification.id)}
                >
                  <CardContent className="flex items-start gap-4 p-4">
                    <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-xl', config.color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className={cn('text-sm', !notification.isRead && 'font-semibold')}>
                          {notification.title}
                        </p>
                        {!notification.isRead && (
                          <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{notification.message}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {formatDistanceToNow(parseISO(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  )
}