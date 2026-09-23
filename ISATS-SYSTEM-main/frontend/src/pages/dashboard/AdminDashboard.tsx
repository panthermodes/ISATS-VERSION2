import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, Monitor, Ticket, Package, Plus, ShieldCheck, Activity } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { Badge } from '@/components/ui/Badge'
import { getDashboardStats } from '@/services/dashboard'
import { getAuditLogs } from '@/services/audit'
import { formatRelativeTime, getRoleBadgeVariant } from '@/utils/formatters'
import { ReconciliationChart } from '@/components/charts/ReconciliationChart'
import type { DashboardStats, AuditLog } from '@/types'

const COLORS = ['#2563EB', '#F59E0B', '#16A34A', '#DC2626', '#06B6D4']

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [audits, setAudits] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboardStats(), getAuditLogs({ page: 1 })])
      .then(([s, a]) => { setStats(s); setAudits(a.results?.slice(0, 5) ?? []) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const roleData = [
    { name: 'Users', value: 60 },
    { name: 'ICT Officers', value: 20 },
    { name: 'Managers', value: 10 },
    { name: 'Admins', value: 8 },
    { name: 'SuperAdmins', value: 2 },
  ]

  return (
    <OrganizationLayout pageTitle="Admin Dashboard">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-900 dark:text-slate-100">Admin Dashboard</h1>
          <p className="text-sm text-muted mt-1">System overview and management controls.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/users/create"><Button variant="secondary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>Add User</Button></Link>
          <Link to="/assets/create"><Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>Add Asset</Button></Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-5"><Skeleton variant="rect" height="70px" /></div>) : (
          <>
            <StatCard title="Total Users" value={stats?.total_users ?? 0} icon={<Users />} colorVariant="blue" />
            <StatCard title="Active Assets" value={stats?.active_assets ?? 0} icon={<Monitor />} colorVariant="green" />
            <StatCard title="Open Tickets" value={stats?.open_tickets ?? 0} icon={<Ticket />} colorVariant="orange" />
            <StatCard title="Low Inventory Items" value={stats?.low_inventory_count ?? 0} icon={<Package />} colorVariant="red" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* User distribution */}
        <Card title="Users by Role">
          {loading ? <Skeleton variant="rect" height="200px" /> : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={roleData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value">
                  {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Recent audit logs */}
        <Card title="Recent Activity" className="lg:col-span-2" actions={<Link to="/audit"><Button variant="ghost" size="sm">View all</Button></Link>}>
          {loading ? <Skeleton variant="table" count={5} /> : (
            <div className="space-y-1 mt-1">
              {audits.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-primary-700/50">
                  <div className="w-7 h-7 rounded-full bg-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Activity className="w-3.5 h-3.5 text-blue" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-primary-900 dark:text-slate-100">
                      <span className="font-medium">{log.user?.username ?? 'System'}</span>{' '}
                      <span className="text-muted">{log.action}</span>{' '}
                      <span className="font-medium">{log.object_type}</span>
                    </p>
                    <p className="text-xs text-muted">{formatRelativeTime(log.timestamp)}</p>
                  </div>
                </div>
              ))}
              {!audits.length && <p className="text-sm text-muted text-center py-6">No recent activity.</p>}
            </div>
          )}
        </Card>
      </div>

      {/* ICT Hardware Catalog & Reconciliation Section */}
      <DeviceReconciliationWidget />
    </OrganizationLayout>
  )
}

function DeviceReconciliationWidget() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/organization/device-catalog/summary/')
      .then((r) => r.json())
      .then((r) => {
        if (r.success && r.data) setData(r.data)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <Card title="ICT Hardware Reconciliation"><Skeleton variant="chart" count={1} /></Card>
  }

  if (!data || !data.items || data.items.length === 0) {
    return null
  }

  return (
    <Card
      title="ICT Hardware Catalog & Inventory Reconciliation"
      subtitle="Audited comparison between declared hardware scope and individually tagged assets"
      actions={
        <Link to="/settings/device-catalog">
          <Button variant="outline" size="sm">Manage Catalog</Button>
        </Link>
      }
    >
      <div className="space-y-6 mt-2">
        {data.total_unregistered_assets > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs text-amber-700 dark:text-amber-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold">Hardware Tagging Gap Detected</p>
              <p className="text-amber-600/90 dark:text-amber-300/90 mt-0.5">
                {data.total_unregistered_assets.toLocaleString()} declared equipment units have not yet been individually registered with QR / barcode tags.
              </p>
            </div>
            <Link to="/assets/create">
              <Button variant="primary" size="sm">Tag Assets</Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#07111F] border border-slate-200 dark:border-[#1E293B]">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Cataloged Types</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">{data.total_device_types}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#07111F] border border-slate-200 dark:border-[#1E293B]">
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Total Declared</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">{data.total_declared_assets.toLocaleString()}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#07111F] border border-slate-200 dark:border-[#1E293B]">
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block">Tagged Assets</span>
            <span className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono">{data.total_registered_assets.toLocaleString()}</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#07111F] border border-slate-200 dark:border-[#1E293B]">
            <span className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">Pending Tagging</span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-mono">+{data.total_unregistered_assets.toLocaleString()}</span>
          </div>
        </div>

        {/* Recharts Reconciliation Chart */}
        <div className="pt-2">
          <ReconciliationChart data={data.items} />
        </div>

        {/* Device breakdown pills */}
        <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100 dark:border-[#1E293B]">
          {data.items.slice(0, 10).map((item: any) => (
            <div
              key={item.id}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#07111F] text-xs text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1E293B]"
            >
              <span className="font-semibold">{item.name}:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">{item.registered}/{item.declared}</span>
              {item.unregistered > 0 && (
                <span className="text-[10px] text-amber-500 font-mono">({item.unregistered} pending)</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
