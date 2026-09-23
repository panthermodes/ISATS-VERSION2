import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { Ticket, Monitor, Users, FileBarChart2 } from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { StatCard } from '@/components/ui/StatCard'
import { Card } from '@/components/ui/Card'
import { Skeleton } from '@/components/ui/Skeleton'
import { getDashboardStats } from '@/services/dashboard'
import type { DashboardStats } from '@/types'

const COLORS = ['#2563EB', '#F59E0B', '#16A34A', '#64748B']

export default function ManagerDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats().then(setStats).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const ticketData = stats
    ? Object.entries(stats.tickets_by_status).map(([name, value]) => ({ name, value }))
    : []

  const assetData = stats
    ? Object.entries(stats.assets_by_status).map(([name, value]) => ({ name, value }))
    : []

  return (
    <OrganizationLayout pageTitle="Manager Dashboard">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-primary-900 dark:text-slate-100">Manager Dashboard</h1>
        <p className="text-sm text-muted mt-1">Overview of department performance and resources.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="card p-5"><Skeleton variant="rect" height="70px" /></div>) : (
          <>
            <StatCard title="Total Tickets" value={stats?.total_tickets ?? 0} icon={<Ticket />} colorVariant="blue" />
            <StatCard title="Open Tickets" value={stats?.open_tickets ?? 0} icon={<Ticket />} colorVariant="orange" />
            <StatCard title="Total Assets" value={stats?.total_assets ?? 0} icon={<Monitor />} colorVariant="green" />
            <StatCard title="Total Users" value={stats?.total_users ?? 0} icon={<Users />} colorVariant="purple" />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Tickets by Status">
          {loading ? <Skeleton variant="rect" height="220px" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={ticketData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {ticketData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title="Assets by Status">
          {loading ? <Skeleton variant="rect" height="220px" /> : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={assetData}>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563EB" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>
    </OrganizationLayout>
  )
}
