import { CheckCheck, Bell } from 'lucide-react'
import { PageShell } from '@/components/common/PageShell'
import { PageSkeleton } from '@/components/common/Skeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useMyNotifications, useMarkAsRead, useMarkAllAsRead } from '@/hooks/useNotificationData'

export function TeacherNotificationsPage() {
  const notificationsQuery = useMyNotifications()
  const notifications = notificationsQuery.data?.notifications ?? []
  const unreadCount = notificationsQuery.data?.unreadCount ?? 0

  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()

  return (
    <PageShell
      title="Notifications"
      description={unreadCount > 0 ? `${unreadCount} unread` : 'All caught up'}
      actions={
        unreadCount > 0 ? (
          <Button variant="outline" size="sm" onClick={() => markAllAsRead.mutate()} disabled={markAllAsRead.isPending}>
            <CheckCheck className="mr-1.5 h-3.5 w-3.5" />
            Mark all as read
          </Button>
        ) : undefined
      }
    >
      {notificationsQuery.isLoading ? (
        <PageSkeleton />
      ) : notificationsQuery.isError ? (
        <ErrorState message="Could not load notifications. Please try again." onRetry={() => notificationsQuery.refetch()} />
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" description="You're all caught up." />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card key={n.id} className={!n.isRead ? 'border-primary/40' : undefined}>
              <CardContent className="flex items-start justify-between gap-4 p-5">
                <div>
                  <div className="mb-1 flex items-center gap-2">
                    <p className="font-medium">{n.title}</p>
                    {!n.isRead && <Badge variant="secondary">New</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
                </div>
                {!n.isRead && (
                  <Button variant="ghost" size="sm" onClick={() => markAsRead.mutate(n.id)} disabled={markAsRead.isPending}>
                    Mark read
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </PageShell>
  )
}
