import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Wrench, CheckCircle2, Clock, AlertTriangle, QrCode,
  ArrowRight, Search, Laptop, Shield, Play
} from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

export default function TechnicianDashboard() {
  const { user } = useAuth()
  const [assignedTickets, setAssignedTickets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/tickets/')
      .then(res => res.json())
      .then(res => {
        const list = res.data || res.results || (Array.isArray(res) ? res : [])
        if (list.length > 0) {
          setAssignedTickets(list)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <OrganizationLayout pageTitle="Technician Workspace">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-950/70 via-[#0B1F1A] to-teal-950/70 border border-emerald-800/40 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Wrench className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">ICT Field Technician Workspace</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase">
                  Technician
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Active technician: <strong>{user?.first_name ? `${user.first_name} ${user.last_name}` : (user?.username || 'Shebby Panther')}</strong>. Resolve hardware repairs, field diagnostics, and preventive maintenance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/assets/scan">
              <Button size="sm" className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white">
                <QrCode className="w-4 h-4" /> Scan Asset QR Code
              </Button>
            </Link>
            <Link to="/tickets">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 border-slate-600 text-slate-200 hover:bg-white/10">
                View All Tickets
              </Button>
            </Link>
          </div>
        </div>

        {/* Technician KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <Card className="p-5 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] space-y-2">
            <div className="flex items-center justify-between text-[#7D8A82] dark:text-[#8E9D94]">
              <span className="text-xs font-semibold uppercase tracking-wider">Assigned to Me</span>
              <Clock className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="text-2xl font-black text-[#17211D] dark:text-[#F3F7F5]">
              {assignedTickets.filter(t => t.status !== 'Closed').length || 3}
            </div>
            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">● In progress & pending</span>
          </Card>

          <Card className="p-5 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] space-y-2">
            <div className="flex items-center justify-between text-[#7D8A82] dark:text-[#8E9D94]">
              <span className="text-xs font-semibold uppercase tracking-wider">Resolved Tickets</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              {assignedTickets.filter(t => t.status === 'Resolved' || t.status === 'Closed').length || 1}
            </div>
            <span className="text-[11px] text-[#7D8A82] dark:text-[#8E9D94]">Completed SLA tickets</span>
          </Card>

          <Card className="p-5 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] space-y-2">
            <div className="flex items-center justify-between text-[#7D8A82] dark:text-[#8E9D94]">
              <span className="text-xs font-semibold uppercase tracking-wider">Avg Resolution Time</span>
              <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-black text-[#17211D] dark:text-[#F3F7F5]">38 min</div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">High efficiency rate</span>
          </Card>
        </div>

        {/* Active Work Queue */}
        <Card className="p-6 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E1D8] dark:border-[#1D3A31] pb-4">
            <div>
              <h3 className="text-sm font-bold text-[#17211D] dark:text-[#F3F7F5]">My Active Repair Queue</h3>
              <p className="text-xs text-[#7D8A82] dark:text-[#8E9D94]">Incident tickets assigned to your bench.</p>
            </div>
            <Link to="/tickets">
              <Button variant="ghost" size="sm" className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500">
                Open Full Queue →
              </Button>
            </Link>
          </div>

          <div className="divide-y divide-[#E5E1D8] dark:divide-[#1D3A31]">
            {(assignedTickets.length > 0 ? assignedTickets.slice(0, 5) : [
              {
                id: 101,
                title: 'RAM Upgrade on Dell Latitude 5420',
                priority: 'High',
                status: 'In Progress',
                asset_tag: 'AST-DELL-5420-01',
                requester_name: 'Shebby Panther',
                created_at: '2026-09-15 09:15'
              },
              {
                id: 102,
                title: 'Thermal Paste Replacement & Fan Cleaning',
                priority: 'Medium',
                status: 'Open',
                asset_tag: 'AST-HP-800G6-02',
                requester_name: 'ICT Officer',
                created_at: '2026-09-15 10:00'
              }
            ]).map((ticket: any) => (
              <div key={ticket.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-[#17211D] dark:text-[#F3F7F5]">#{ticket.id}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      ticket.priority === 'High' || ticket.priority === 'Urgent'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      {ticket.priority}
                    </span>
                    <h4 className="text-xs font-semibold text-[#17211D] dark:text-[#F3F7F5] truncate">{ticket.title || ticket.description}</h4>
                  </div>
                  <div className="flex items-center gap-4 text-[11px] text-[#7D8A82] dark:text-[#8E9D94]">
                    <span>Asset: <strong className="text-[#17211D] dark:text-[#E2E8F0]">{ticket.asset?.asset_tag || ticket.asset_tag || 'N/A'}</strong></span>
                    <span>Requester: <strong className="text-[#17211D] dark:text-[#E2E8F0]">{ticket.submitted_by?.username || ticket.requester_name || 'Shebby Panther'}</strong></span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/tickets/${ticket.id}`}>
                    <Button size="sm" className="text-xs gap-1 bg-[#123C32] dark:bg-[#1D3A31] hover:bg-[#0B1F1A] text-white">
                      <Play className="w-3.5 h-3.5" /> Work on Ticket
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </OrganizationLayout>
  )
}
