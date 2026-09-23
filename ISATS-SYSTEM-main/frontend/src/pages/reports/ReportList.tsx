import { useEffect, useState } from 'react'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { FileBarChart2, Monitor, Wrench, TrendingUp, AlertTriangle } from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { getDashboardStats } from '@/services/dashboard'
import { getAssetReport } from '@/services/assets'
import type { DashboardStats } from '@/types'

const COLORS = ['#2563EB', '#16A34A', '#F59E0B', '#DC2626', '#06B6D4', '#8B5CF6']

export default function ReportList() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [assetReport, setAssetReport] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getDashboardStats(), getAssetReport()])
      .then(([s, a]) => { setStats(s); setAssetReport(a) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const assetStatusData = stats
    ? Object.entries(stats.assets_by_status).map(([name, value]) => ({ name, value }))
    : []

  const ticketStatusData = stats
    ? Object.entries(stats.tickets_by_status).map(([name, value]) => ({ name, value }))
    : []

  const assetCategoryData: { name: string; count: number }[] = assetReport?.by_category ?? []
  const assetDeptData: { name: string; count: number }[]     = assetReport?.by_department ?? []

  return (
    <OrganizationLayout pageTitle="Reports">
      <PageHeader
        title="Reports & Analytics"
        subtitle="System-wide statistics and trends"
        breadcrumbs={[{ label: 'Reports' }]}
      />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Assets',  value: stats?.total_assets  ?? '—', icon: <Monitor className="w-5 h-5" />,      color: 'bg-blue/10 text-blue' },
          { label: 'Total Tickets', value: stats?.total_tickets ?? '—', icon: <FileBarChart2 className="w-5 h-5" />, color: 'bg-success/10 text-success' },
          { label: 'In Maintenance',value: stats?.maintenance_assets ?? '—', icon: <Wrench className="w-5 h-5" />,  color: 'bg-warning/10 text-warning' },
          { label: 'Low Stock Items',value: stats?.low_inventory_count ?? '—', icon: <AlertTriangle className="w-5 h-5" />, color: 'bg-danger/10 text-danger' },
        ].map((s) => (
          <div key={s.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>{s.icon}</div>
            <p className="text-2xl font-bold text-primary-900 dark:text-slate-100">{loading ? '…' : s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Asset Status Pie */}
        <Card title="Assets by Status">
          {loading ? <Skeleton variant="rect" height="250px" /> : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={assetStatusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>
                  {assetStatusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Ticket Status */}
        <Card title="Tickets by Status">
          {loading ? <Skeleton variant="rect" height="250px" /> : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={ticketStatusData}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Assets by Category */}
        {assetCategoryData.length > 0 && (
          <Card title="Assets by Category">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={assetCategoryData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#06B6D4" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}

        {/* Assets by Department */}
        {assetDeptData.length > 0 && (
          <Card title="Assets by Department">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={assetDeptData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={110} />
                <Tooltip />
                <Bar dataKey="count" fill="#16A34A" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        )}
      </div>
    </OrganizationLayout>
  )
}
