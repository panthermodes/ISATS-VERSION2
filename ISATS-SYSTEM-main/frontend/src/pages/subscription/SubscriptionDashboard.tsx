import { useState } from 'react'
import { Shield, Users, CheckCircle2, CreditCard, Clock, FileText, ArrowUpRight } from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export default function SubscriptionDashboard() {
  const [activeUsers] = useState(142)
  const userLimit = 250
  const usagePercentage = Math.round((activeUsers / userLimit) * 100)

  return (
    <OrganizationLayout pageTitle="Subscription & Billing">
      <PageHeader
        title="Subscription Management"
        subtitle="Manage your organization plan, active user entitlements, and invoices"
        breadcrumbs={[{ label: 'Settings', href: '/settings' }, { label: 'Subscription' }]}
        actions={
          <Button variant="primary" leftIcon={<ArrowUpRight className="w-4 h-4" />}>
            Upgrade Plan
          </Button>
        }
      />

      <div className="space-y-6">
        {/* Current Plan Overview Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <Badge variant="success" dot className="mb-2">Active Subscription</Badge>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Standard Enterprise Tier</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Monthly recurring plan managed via PantherMode billing infrastructure.
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">TZS 100,000</span>
                <span className="text-xs text-slate-500 block">/ month</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-500" /> Active Users Entitlement: {activeUsers} / {userLimit}
                </span>
                <span className="font-mono text-slate-500">{usagePercentage}% Used</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${usagePercentage}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                Your plan supports up to 250 active staff and technicians. To add more users beyond 250, request an entitlement limit increase.
              </p>
            </div>
          </Card>

          {/* Quick Billing Status */}
          <Card title="Billing Details" className="space-y-3">
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Next Billing Date</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">Sept 15, 2026</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Payment Gateway</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">M-Pesa Webhook</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Status</span>
                <span className="text-emerald-500 font-bold">Auto-Renew Enabled</span>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="w-full justify-center mt-3">
              Change Payment Method
            </Button>
          </Card>
        </div>

        {/* Invoice History */}
        <Card title="Recent Invoices & Receipts">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 uppercase">
                <tr>
                  <th className="px-4 py-3">Invoice #</th>
                  <th className="px-4 py-3">Billing Period</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {[
                  { id: 'INV-2026-08', period: 'August 2026', amount: 'TZS 100,000', status: 'Paid', date: '2026-08-01' },
                  { id: 'INV-2026-07', period: 'July 2026', amount: 'TZS 100,000', status: 'Paid', date: '2026-07-01' },
                  { id: 'INV-2026-06', period: 'June 2026', amount: 'TZS 100,000', status: 'Paid', date: '2026-06-01' },
                ].map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="px-4 py-3 font-mono font-medium text-blue-600 dark:text-blue-400">{inv.id}</td>
                    <td className="px-4 py-3 font-medium text-slate-700 dark:text-slate-300">{inv.period}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 dark:text-white">{inv.amount}</td>
                    <td className="px-4 py-3">
                      <Badge variant="success" dot>{inv.status}</Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> PDF
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </OrganizationLayout>
  )
}
