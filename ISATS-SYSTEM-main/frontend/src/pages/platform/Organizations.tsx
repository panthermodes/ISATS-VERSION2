import { useState } from 'react'
import { Building2, Search, Plus, MoreVertical, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react'
import { PlatformAdminLayout } from '@/layouts/PlatformAdminLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function Organizations() {
  const [search, setSearch] = useState('')

  const orgs = [
    { id: 1, name: 'Kigamboni District Hospital', slug: 'kigamboni-hospital', status: 'Active', plan: 'Standard', users: 184, created: '2026-01-12' },
    { id: 2, name: 'Mlimani Tech Hub', slug: 'mlimani-tech', status: 'Active', plan: 'Standard', users: 65, created: '2026-02-05' },
    { id: 3, name: 'St. Joseph Academy', slug: 'st-joseph-academy', status: 'Active', plan: 'Standard', users: 210, created: '2026-03-14' },
    { id: 4, name: 'Kilimanjaro Logistics Ltd', slug: 'kili-logistics', status: 'Trial', plan: 'Enterprise Custom', users: 340, created: '2026-04-20' },
    { id: 5, name: 'Zanzibar Port Operations', slug: 'zan-port', status: 'Active', plan: 'Standard', users: 198, created: '2026-05-18' },
  ]

  const filtered = orgs.filter((o) => o.name.toLowerCase().includes(search.toLowerCase()) || o.slug.includes(search.toLowerCase()))

  return (
    <PlatformAdminLayout pageTitle="Tenant Organizations Management">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Search organizations by name or slug..."
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="primary" className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-bold" leftIcon={<Plus className="w-4 h-4" />}>
            Provision Tenant
          </Button>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/50 text-slate-400 uppercase">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Organization Name</th>
                  <th className="px-4 py-3">Tenant Slug</th>
                  <th className="px-4 py-3">Plan Tier</th>
                  <th className="px-4 py-3">Active Users</th>
                  <th className="px-4 py-3">Created Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-slate-500">#{o.id}</td>
                    <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-amber-400" /> {o.name}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-400">{o.slug}</td>
                    <td className="px-4 py-3 text-slate-300">{o.plan}</td>
                    <td className="px-4 py-3 text-slate-300 font-semibold">{o.users} / 250</td>
                    <td className="px-4 py-3 text-slate-400">{o.created}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${o.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-amber-400 hover:text-amber-300 font-semibold">Manage</button>
                    </td>
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
