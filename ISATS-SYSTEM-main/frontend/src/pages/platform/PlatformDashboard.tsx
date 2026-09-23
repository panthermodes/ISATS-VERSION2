import { Building2, CreditCard, Users, ShieldAlert, CheckCircle2, TrendingUp } from 'lucide-react'
import { PlatformAdminLayout } from '@/layouts/PlatformAdminLayout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export default function PlatformDashboard() {
  const metrics = [
    { label: 'Subscribing Organizations', value: '48', change: '+12% this month', icon: <Building2 className="w-5 h-5 text-amber-400" /> },
    { label: 'Monthly Recurring Revenue', value: 'TZS 4,800,000', change: 'Standard TZS 100k/mo', icon: <CreditCard className="w-5 h-5 text-emerald-400" /> },
    { label: 'Total Managed Devices', value: '4,892', change: 'Across all tenants', icon: <Users className="w-5 h-5 text-blue-400" /> },
    { label: 'Platform Health SLA', value: '99.98%', change: 'Zero outages', icon: <CheckCircle2 className="w-5 h-5 text-teal-400" /> },
  ]

  const recentTenants = [
    { name: 'Kigamboni District Hospital', slug: 'kigamboni-hospital', plan: 'Standard', users: 184, status: 'Active', mrr: 'TZS 100,000' },
    { name: 'Mlimani Tech Hub', slug: 'mlimani-tech', plan: 'Standard', users: 65, status: 'Active', mrr: 'TZS 100,000' },
    { name: 'St. Joseph Academy', slug: 'st-joseph-academy', plan: 'Standard', users: 210, status: 'Active', mrr: 'TZS 100,000' },
    { name: 'Kilimanjaro Logistics Ltd', slug: 'kili-logistics', plan: 'Enterprise Custom', users: 340, status: 'Trial', mrr: 'Custom' },
  ]

  return (
    <PlatformAdminLayout pageTitle="Master Infrastructure Overview">
      <div className="space-y-8">
        {/* KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((m, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400">{m.label}</span>
                <div className="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center">
                  {m.icon}
                </div>
              </div>
              <div className="text-2xl font-bold text-white tracking-tight">{m.value}</div>
              <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> {m.change}
              </div>
            </div>
          ))}
        </div>

        {/* Organizations Table */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Active Tenant Organizations</h3>
            <span className="text-xs text-slate-400">48 total entities</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/50 text-slate-400 uppercase">
                <tr>
                  <th className="px-4 py-3">Entity Name</th>
                  <th className="px-4 py-3">Tenant Slug</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Active Users</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">MRR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {recentTenants.map((t, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{t.name}</td>
                    <td className="px-4 py-3 font-mono text-slate-400">{t.slug}</td>
                    <td className="px-4 py-3 text-slate-300">{t.plan}</td>
                    <td className="px-4 py-3 text-slate-300">{t.users} / 250</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${t.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-slate-200">{t.mrr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PlatformAdminLayout>
  )
}
