import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Ticket, Package, Wrench, AlertTriangle, ArrowRight } from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { getDashboardStats } from '@/services/dashboard'
import { getPriorityBadgeVariant, getStatusBadgeVariant, formatRelativeTime } from '@/utils/formatters'
import type { DashboardStats } from '@/types'

export default function OfficerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <OrganizationLayout pageTitle="ICT Officer Dashboard">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-900 dark:text-slate-100">ICT Officer Dashboard</h1>
        <p className="text-sm text-muted mt-1">Manage tickets, assets and maintenance tasks.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-5"><Skeleton variant="rect" height="70px" /></div>) : (
          <>
            <StatCard title="Assigned Tickets" value={stats?.open_tickets ?? 0} icon={<Ticket />} colorVariant="blue" />
            <StatCard title="In Progress" value={stats?.in_progress_tickets ?? 0} icon={<Ticket />} colorVariant="orange" />
            <StatCard title="Assets in Maintenance" value={stats?.maintenance_assets ?? 0} icon={<Wrench />} colorVariant="purple" />
            <StatCard title="Low Inventory" value={stats?.low_inventory_count ?? 0} icon={<AlertTriangle />} colorVariant="red" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ticket Queue */}
        <Card title="My Ticket Queue" actions={<Link to="/tickets/queue"><Button variant="ghost" size="sm">View queue</Button></Link>}>
          {loading ? <Skeleton variant="table" count={4} /> : (
            <div className="space-y-2 mt-1">
              {(stats?.recent_tickets ?? []).slice(0, 5).map((ticket) => (
                <Link key={ticket.id} to={`/tickets/${ticket.id}`}>
                  <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-primary-700/50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate text-primary-900 dark:text-slate-100">{ticket.title}</p>
                      <p className="text-xs text-muted">{formatRelativeTime(ticket.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <Badge variant={getPriorityBadgeVariant(ticket.priority)} size="sm">{ticket.priority}</Badge>
                      <Badge variant={getStatusBadgeVariant(ticket.status)} size="sm">{ticket.status}</Badge>
                    </div>
                    <ArrowRight className="w-4 h-4 text-muted flex-shrink-0" />
                  </div>
                </Link>
              ))}
              {!(stats?.recent_tickets?.length) && <p className="text-sm text-muted text-center py-6">No tickets assigned.</p>}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions">
          <div className="grid grid-cols-2 gap-3 mt-1">
            {[
              { label: 'Add Asset',       href: '/assets/create',   icon: <Package className="w-5 h-5" />,  color: 'blue' },
              { label: 'Log Maintenance', href: '/maintenance',      icon: <Wrench className="w-5 h-5" />,   color: 'purple' },
              { label: 'View Inventory',  href: '/inventory',        icon: <Package className="w-5 h-5" />,  color: 'green' },
              { label: 'All Tickets',     href: '/tickets',          icon: <Ticket className="w-5 h-5" />,   color: 'orange' },
            ].map((a) => (
              <Link key={a.href} to={a.href}>
                <div className="p-4 rounded-xl border border-border dark:border-primary-700 hover:border-blue/40 hover:bg-blue/5 transition-all group cursor-pointer flex flex-col items-center gap-2 text-center">
                  <div className="text-muted group-hover:text-blue transition-colors">{a.icon}</div>
                  <span className="text-xs font-medium text-primary-900 dark:text-slate-200">{a.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </OrganizationLayout>
  )
}
