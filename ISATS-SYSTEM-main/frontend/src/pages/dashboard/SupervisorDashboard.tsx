import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users, CheckCircle2, Clock, AlertTriangle, Activity,
  ArrowUpRight, Ticket, Shield, Layers, UserCheck
} from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

export default function SupervisorDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    activeOfficers: 4,
    openQueueCount: 3,
    slaBreachedCount: 0,
    avgResolutionTime: '42 mins',
  })

  useEffect(() => {
    fetch('/api/dashboard/')
      .then(res => res.json())
      .then(data => {
        const d = data.data || data
        if (d) {
          setStats(prev => ({
            ...prev,
            openQueueCount: d.open_tickets ?? prev.openQueueCount,
            activeOfficers: d.active_users ?? prev.activeOfficers,
          }))
        }
      })
      .catch(() => {})
  }, [])

  return (
    <OrganizationLayout pageTitle="Supervisor Control Center">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-purple-950/70 via-[#0B1F1A] to-indigo-950/70 border border-purple-800/40 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">ICT Supervisor Control Center</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40 uppercase">
                  Supervisor
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Welcome, <strong>{user?.first_name ? `${user.first_name} ${user.last_name}` : (user?.username || 'Shebby Panther')}</strong>. Monitor technician workload, SLA compliance, and dispatch escalations.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/tickets">
              <Button size="sm" className="text-xs gap-1.5 bg-purple-600 hover:bg-purple-500 text-white">
                <Ticket className="w-4 h-4" /> Triage Queue
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 border-slate-600 text-slate-200 hover:bg-white/10">
                SLA Analytics
              </Button>
            </Link>
          </div>
        </div>

        {/* Supervisor KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-5 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] space-y-2">
            <div className="flex items-center justify-between text-[#7D8A82] dark:text-[#8E9D94]">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Technicians</span>
              <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="text-2xl font-black text-[#17211D] dark:text-[#F3F7F5]">{stats.activeOfficers}</div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">● On-duty bench staff</span>
          </Card>

          <Card className="p-5 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] space-y-2">
            <div className="flex items-center justify-between text-[#7D8A82] dark:text-[#8E9D94]">
              <span className="text-xs font-semibold uppercase tracking-wider">Open Ticket Queue</span>
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-black text-[#17211D] dark:text-[#F3F7F5]">{stats.openQueueCount}</div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">Requires triage assignment</span>
          </Card>

          <Card className="p-5 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] space-y-2">
            <div className="flex items-center justify-between text-[#7D8A82] dark:text-[#8E9D94]">
              <span className="text-xs font-semibold uppercase tracking-wider">SLA Breaches</span>
              <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-600 dark:text-rose-400">{stats.slaBreachedCount}</div>
            <span className="text-[11px] text-[#7D8A82] dark:text-[#8E9D94]">100% on-time compliance</span>
          </Card>

          <Card className="p-5 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] space-y-2">
            <div className="flex items-center justify-between text-[#7D8A82] dark:text-[#8E9D94]">
              <span className="text-xs font-semibold uppercase tracking-wider">Team Velocity</span>
              <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{stats.avgResolutionTime}</div>
            <span className="text-[11px] text-[#7D8A82] dark:text-[#8E9D94]">Average ticket closure</span>
          </Card>
        </div>

        {/* Technician Roster & Workload */}
        <Card className="p-6 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E1D8] dark:border-[#1D3A31] pb-4">
            <div>
              <h3 className="text-sm font-bold text-[#17211D] dark:text-[#F3F7F5]">Technician Workload Matrix</h3>
              <p className="text-xs text-[#7D8A82] dark:text-[#8E9D94]">Real-time distribution of open tickets among technicians.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { name: 'Michael M. (Field Tech)', open: 2, resolvedToday: 4, status: 'Active' },
              { name: 'Grace K. (Network Tech)', open: 1, resolvedToday: 5, status: 'Active' },
              { name: 'David T. (Hardware Specialist)', open: 1, resolvedToday: 3, status: 'Active' },
            ].map((tech, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white dark:bg-[#123C32]/30 border border-[#E5E1D8] dark:border-[#1D3A31] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#17211D] dark:text-[#F3F7F5]">{tech.name}</span>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold uppercase">● {tech.status}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-[#7D8A82] dark:text-[#8E9D94] pt-2 border-t border-[#E5E1D8] dark:border-[#1D3A31]">
                  <span>Active tickets: <strong className="text-[#17211D] dark:text-white">{tech.open}</strong></span>
                  <span>Resolved today: <strong className="text-emerald-600 dark:text-emerald-400">{tech.resolvedToday}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </OrganizationLayout>
  )
}
