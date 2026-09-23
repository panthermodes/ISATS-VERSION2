import { useEffect, useState } from 'react'
import { Bell, CheckCheck } from 'lucide-react'
import { formatRelativeTime, formatDate } from '@/utils/formatters'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useNotifications } from '@/hooks/useNotifications'
import { isToday, isThisWeek, parseISO } from 'date-fns'
import type { Notification } from '@/types'
import clsx from 'clsx'

function groupNotifications(notifications: Notification[]) {
  const today: Notification[] = []
  const thisWeek: Notification[] = []
  const older: Notification[] = []
  notifications.forEach((n) => {
    const d = parseISO(n.created_at)
    if (isToday(d)) today.push(n)
    else if (isThisWeek(d)) thisWeek.push(n)
    else older.push(n)
  })
  return { today, thisWeek, older }
}

function NotifGroup({ label, items, onRead }: { label: string; items: Notification[]; onRead: (id: number) => void }) {
  if (!items.length) return null
  return (
    <div className="mb-6">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-2 px-1">{label}</p>
      <div className="space-y-1">
        {items.map((n) => (
          <div
            key={n.id}
            onClick={() => !n.is_read && onRead(n.id)}
            className={clsx(
              'flex items-start gap-3 p-4 rounded-xl transition-colors cursor-pointer',
              n.is_read
                ? 'bg-white dark:bg-primary-800'
                : 'bg-blue/5 border-l-2 border-blue dark:bg-blue/10'
            )}
          >
            <div className={clsx('w-2 h-2 rounded-full mt-2 flex-shrink-0', n.is_read ? 'bg-slate-200 dark:bg-primary-600' : 'bg-blue')} />
            <div className="flex-1 min-w-0">
              <p className={clsx('text-sm', n.is_read ? 'text-muted' : 'text-primary-900 dark:text-slate-100 font-medium')}>{n.message}</p>
              <p className="text-xs text-muted mt-1">{formatRelativeTime(n.created_at)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function NotificationList() {
  const { notifications, loading, markRead, markAllRead } = useNotifications()
  const groups = groupNotifications(notifications)

  return (
    <OrganizationLayout pageTitle="Notifications">
      <PageHeader
        title="Notifications"
        subtitle={`${notifications.filter((n) => !n.is_read).length} unread`}
        breadcrumbs={[{ label: 'Notifications' }]}
        actions={
          <Button variant="secondary" leftIcon={<CheckCheck className="w-4 h-4" />} onClick={markAllRead}>
            Mark all read
          </Button>
        }
      />

      <div className="max-w-2xl">
        <Card padding="none">
          <div className="p-5">
            {loading ? (
              <Skeleton variant="table" count={6} />
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center py-16 text-muted">
                <Bell className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">No notifications yet.</p>
              </div>
            ) : (
              <>
                <NotifGroup label="Today"     items={groups.today}    onRead={markRead} />
                <NotifGroup label="This Week" items={groups.thisWeek} onRead={markRead} />
                <NotifGroup label="Older"     items={groups.older}    onRead={markRead} />
              </>
            )}
          </div>
        </Card>
      </div>
    </OrganizationLayout>
  )
}
