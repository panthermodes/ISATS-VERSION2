import { useState, useEffect } from 'react'
import { PlatformAdminLayout } from '@/layouts/PlatformAdminLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CreditCard, Search, CheckCircle2, Clock, AlertTriangle, XCircle, RefreshCw } from 'lucide-react'

export default function PlatformSubscriptions() {
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/subscription/invoices/')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          setSubscriptions(res.data)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <PlatformAdminLayout pageTitle="Tenant Subscriptions & Lifecycle Management">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Active Tenant Subscriptions</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitor billing periods, capacity utilization (250 included users), auto-renewals, and expirations.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search subscriptions by organization or invoice..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Subscriptions Table */}
        <Card className="bg-slate-900 border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Invoice #</th>
                  <th className="p-4">Billing Period</th>
                  <th className="p-4">Users (Active / Limit)</th>
                  <th className="p-4">Base Plan</th>
                  <th className="p-4">Extra Charges</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {(subscriptions.length > 0 ? subscriptions : [
                  {
                    id: '1',
                    invoice_number: 'INV-202608-ISATS-A49F2',
                    billing_period_start: '2026-08-01',
                    billing_period_end: '2026-08-31',
                    active_users: 142,
                    included_users: 250,
                    additional_users: 0,
                    base_price: 100000,
                    additional_charges: 0,
                    total_amount: 100000,
                    currency: 'TZS',
                    status: 'PAID'
                  }
                ]).map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-medium text-white">{sub.invoice_number}</td>
                    <td className="p-4 text-slate-400">
                      {sub.billing_period_start} → {sub.billing_period_end}
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-white">{sub.active_users}</span>
                      <span className="text-slate-500"> / {sub.included_users} included</span>
                    </td>
                    <td className="p-4 font-medium text-slate-200">
                      TZS {Number(sub.base_price).toLocaleString()}
                    </td>
                    <td className="p-4 text-slate-400">
                      {sub.additional_users > 0 ? (
                        <span className="text-amber-400 font-semibold">
                          +{sub.additional_users} extra (TZS {Number(sub.additional_charges).toLocaleString()})
                        </span>
                      ) : (
                        <span className="text-slate-500">TZS 0 (Within 250 cap)</span>
                      )}
                    </td>
                    <td className="p-4 font-bold text-emerald-400">
                      TZS {Number(sub.total_amount).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> {sub.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <Button variant="outline" size="sm" className="text-xs border-slate-700">
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </PlatformAdminLayout>
  )
}
