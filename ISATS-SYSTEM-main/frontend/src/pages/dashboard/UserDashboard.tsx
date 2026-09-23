import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Ticket, Monitor, Bell, Plus, ArrowRight } from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { getDashboardStats } from '@/services/dashboard'
import { useAuth } from '@/context/AuthContext'
import { formatRelativeTime, getStatusBadgeVariant, getPriorityBadgeVariant } from '@/utils/formatters'
import type { DashboardStats } from '@/types'

export default function UserDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 17) return 'Good afternoon'
    return 'Good evening'
  }

  return (
    <OrganizationLayout pageTitle="Dashboard">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-900 dark:text-slate-100">
          {greeting()}, {user?.first_name || user?.username}! 👋
        </h1>
        <p className="text-sm text-muted mt-1">Here's what's happening with your requests today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card p-5"><Skeleton variant="rect" height="80px" /></div>
          ))
        ) : (
          <>
            <StatCard title="Open Tickets" value={stats?.open_tickets ?? 0} icon={<Ticket />} colorVariant="blue" />
            <StatCard title="My Assets" value={stats?.active_assets ?? 0} icon={<Monitor />} colorVariant="green" />
            <StatCard title="Resolved Tickets" value={stats?.resolved_tickets ?? 0} icon={<Ticket />} colorVariant="cyan" />
          </>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Link to="/tickets/create">
          <Card hover className="flex items-center gap-3.5 p-4 cursor-pointer group">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-primary-900 dark:text-slate-100 text-sm truncate">Submit Ticket</p>
              <p className="text-xs text-muted truncate">Report an issue</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted shrink-0 group-hover:text-blue-600 transition-colors" />
          </Card>
        </Link>
        <Link to="/assets">
          <Card hover className="flex items-center gap-3.5 p-4 cursor-pointer group">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
              <Monitor className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-primary-900 dark:text-slate-100 text-sm truncate">My Assets</p>
              <p className="text-xs text-muted truncate">View equipment</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted shrink-0 group-hover:text-emerald-600 transition-colors" />
          </Card>
        </Link>
        <Link to="/requests/create">
          <Card hover className="flex items-center gap-3.5 p-4 cursor-pointer group">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-colors shrink-0">
              <Plus className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-primary-900 dark:text-slate-100 text-sm truncate">Request Hardware</p>
              <p className="text-xs text-muted truncate">Order equipment</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted shrink-0 group-hover:text-purple-600 transition-colors" />
          </Card>
        </Link>
        <Link to="/notifications">
          <Card hover className="flex items-center gap-3.5 p-4 cursor-pointer group">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 group-hover:bg-amber-600 group-hover:text-white transition-colors shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-primary-900 dark:text-slate-100 text-sm truncate">Notifications</p>
              <p className="text-xs text-muted truncate">Check your alerts</p>
            </div>
            <ArrowRight className="w-4 h-4 text-muted shrink-0 group-hover:text-amber-600 transition-colors" />
          </Card>
        </Link>
      </div>

      {/* Recent Tickets */}
      <Card title="My Recent Tickets" actions={<Link to="/tickets"><Button variant="ghost" size="sm">View all</Button></Link>}>
        {loading ? (
          <Skeleton variant="table" count={4} />
        ) : !stats?.recent_tickets || stats.recent_tickets.length === 0 ? (
          <p className="text-sm text-muted text-center py-8">No tickets yet. Submit one to get started.</p>
        ) : (
          <div className="space-y-2 mt-1">
            {(stats.recent_tickets ?? []).slice(0, 5).map((ticket) => (
              <Link key={ticket.id} to={`/tickets/${ticket.id}`}>
                <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-primary-700/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-primary-900 dark:text-slate-100 truncate">{ticket.title}</p>
                    <p className="text-xs text-muted">{formatRelativeTime(ticket.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={getPriorityBadgeVariant(ticket.priority)} size="sm">{ticket.priority}</Badge>
                    <Badge variant={getStatusBadgeVariant(ticket.status)} size="sm">{ticket.status}</Badge>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </OrganizationLayout>
  )
}
