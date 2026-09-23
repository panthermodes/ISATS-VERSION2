import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Shield, Building2, Users, Ticket, Laptop, CreditCard,
  Layers, ArrowUpRight, Activity, Clock, CheckCircle2, AlertTriangle
} from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

export default function SuperAdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<any>({
    active_users: 13,
    total_assets: 5,
    open_tickets: 2,
    included_users: 250,
    subscription_status: 'ACTIVE',
    monthly_price: 100000,
    next_billing_date: '2026-09-24',
  })

  useEffect(() => {
    fetch('/api/subscription/')
      .then(res => res.json())
      .then(res => {
        const d = res.data || res
        if (d && typeof d === 'object') {
          setStats((prev: any) => ({
            ...prev,
            ...d,
          }))
        }
      })
      .catch(() => {})

    fetch('/api/dashboard/')
      .then(res => res.json())
      .then(res => {
        const d = res.data || res
        if (d && typeof d === 'object') {
          setStats((prev: any) => ({
            ...prev,
            ...d,
          }))
        }
      })
      .catch(() => {})
  }, [])

  const usagePercent = Math.min(100, Math.round(((stats.active_users || 1) / (stats.included_users || 250)) * 100))

  return (
    <OrganizationLayout pageTitle="Organization SuperAdmin Portal">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-950/70 via-[#0B1F1A] to-indigo-950/70 border border-blue-800/40 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">Organization SuperAdmin Portal</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40 uppercase">
                  Tenant Owner
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Welcome back, <strong>{user?.first_name ? `${user.first_name} ${user.last_name}` : (user?.username || 'Shebby Panther')}</strong>. Full administrative governance, RBAC, and subscription oversight.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/subscription">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 border-blue-700/60 bg-blue-950/40 hover:bg-blue-900/60 text-blue-200">
                <CreditCard className="w-4 h-4" /> Subscription & Invoices
              </Button>
            </Link>
            <Link to="/users">
              <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
                <Users className="w-4 h-4" /> Manage Users & RBAC
              </Button>
            </Link>
          </div>
        </div>

        {/* 250 Included Users SaaS Allowance Widget */}
        <Card className="p-6 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E1D8] dark:border-[#1D3A31] pb-4">
            <div>
              <h3 className="text-sm font-bold text-[#17211D] dark:text-[#F3F7F5] flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Active User Capacity Meter (250 Included Allowance)
              </h3>
              <p className="text-xs text-[#7D8A82] dark:text-[#8E9D94] mt-0.5">
                Your Standard Plan includes 250 users for <strong>TZS {Number(stats.monthly_price || 100000).toLocaleString()}/mo</strong>.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-[#7D8A82] dark:text-[#8E9D94]">Current active users:</span>
              <div className="text-xl font-bold text-[#17211D] dark:text-[#F3F7F5]">
                {stats.active_users || 13} <span className="text-xs text-[#7D8A82] dark:text-[#8E9D94] font-normal">/ {stats.included_users || 250} included</span>
              </div>
            </div>
          </div>

          {/* Meter Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-3 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden border border-[#E5E1D8] dark:border-slate-700/60">
              <div
                className={`h-full transition-all duration-500 ${
                  usagePercent >= 90 ? 'bg-amber-500' : 'bg-blue-600 dark:bg-blue-500'
                }`}
                style={{ width: `${usagePercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-[#7D8A82] dark:text-[#8E9D94]">
              <span>{usagePercent}% capacity utilized</span>
              <span>{Math.max(0, (stats.included_users || 250) - (stats.active_users || 13))} user slots available before additional charges</span>
            </div>
          </div>
        </Card>

        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-5 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] space-y-2">
            <div className="flex items-center justify-between text-[#7D8A82] dark:text-[#8E9D94]">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Users</span>
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-black text-[#17211D] dark:text-[#F3F7F5]">{stats.active_users || 13}</div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">● Within 250 cap</span>
          </Card>

          <Card className="p-5 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] space-y-2">
            <div className="flex items-center justify-between text-[#7D8A82] dark:text-[#8E9D94]">
              <span className="text-xs font-semibold uppercase tracking-wider">Hardware Assets</span>
              <Laptop className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div className="text-2xl font-black text-[#17211D] dark:text-[#F3F7F5]">{stats.total_assets || 5}</div>
            <span className="text-[11px] text-[#7D8A82] dark:text-[#8E9D94]">Tracked with QR/Barcodes</span>
          </Card>

          <Card className="p-5 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] space-y-2">
            <div className="flex items-center justify-between text-[#7D8A82] dark:text-[#8E9D94]">
              <span className="text-xs font-semibold uppercase tracking-wider">Open Tickets</span>
              <Ticket className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-black text-[#17211D] dark:text-[#F3F7F5]">{stats.open_tickets || 2}</div>
            <span className="text-[11px] text-[#7D8A82] dark:text-[#8E9D94]">SLA Active Incidents</span>
          </Card>

          <Card className="p-5 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] space-y-2">
            <div className="flex items-center justify-between text-[#7D8A82] dark:text-[#8E9D94]">
              <span className="text-xs font-semibold uppercase tracking-wider">Monthly Base</span>
              <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              TZS {Number(stats.monthly_price || 100000).toLocaleString()}
            </div>
            <span className="text-[11px] text-[#7D8A82] dark:text-[#8E9D94]">Auto-renews monthly</span>
          </Card>
        </div>

        {/* Quick Governance Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link to="/users" className="block group">
            <Card className="p-5 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] hover:border-blue-500/50 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#17211D] dark:text-[#F3F7F5] group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  User Role Administration
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#7D8A82] dark:text-[#8E9D94] group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </div>
              <p className="text-xs text-[#7D8A82] dark:text-[#8E9D94]">
                Promote staff, assign roles (Technician, Officer, HOD, Manager), and enforce password policies.
              </p>
            </Card>
          </Link>

          <Link to="/audit" className="block group">
            <Card className="p-5 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] hover:border-blue-500/50 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#17211D] dark:text-[#F3F7F5] group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Organization Audit Logs
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#7D8A82] dark:text-[#8E9D94] group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </div>
              <p className="text-xs text-[#7D8A82] dark:text-[#8E9D94]">
                Review full compliance history, login attempts, user promotions, and asset movements with IP tracking.
              </p>
            </Card>
          </Link>

          <Link to="/reports" className="block group">
            <Card className="p-5 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] hover:border-blue-500/50 transition-all space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#17211D] dark:text-[#F3F7F5] group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Executive Reports
                </span>
                <ArrowUpRight className="w-4 h-4 text-[#7D8A82] dark:text-[#8E9D94] group-hover:text-blue-600 dark:group-hover:text-blue-400" />
              </div>
              <p className="text-xs text-[#7D8A82] dark:text-[#8E9D94]">
                Generate department utilization metrics, SLA compliance charts, and maintenance cost analyses.
              </p>
            </Card>
          </Link>
        </div>
      </div>
    </OrganizationLayout>
  )
}
