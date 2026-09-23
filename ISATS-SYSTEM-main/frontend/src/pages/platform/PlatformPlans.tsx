import { useState, useEffect } from 'react'
import { PlatformAdminLayout } from '@/layouts/PlatformAdminLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Package, Plus, Check, Edit2, Shield, Users, DollarSign } from 'lucide-react'

export default function PlatformPlans() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newPlan, setNewPlan] = useState({
    name: 'Standard Enterprise Plan',
    slug: 'standard-plan',
    monthly_base_price: 100000,
    included_users: 250,
    additional_user_monthly_price: 500,
    description: 'Enterprise ICT asset tracking, ticketing, and preventive maintenance.',
    is_active: true
  })

  useEffect(() => {
    fetch('/api/platform/plans/')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          setPlans(res.data)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const handleSavePlan = async () => {
    try {
      const res = await fetch('/api/platform/plans/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPlan)
      })
      const json = await res.json()
      if (json.success) {
        setShowModal(false)
        window.location.reload()
      }
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <PlatformAdminLayout pageTitle="SaaS Plans & Pricing Architecture">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">SaaS Subscription Plans</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Configure baseline pricing, included user limits (250 users), and incremental user billing rates.
            </p>
          </div>
          <Button onClick={() => setShowModal(true)} className="gap-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-semibold text-xs">
            <Plus className="w-4 h-4" /> Create Custom Plan
          </Button>
        </div>

        {/* Highlight Banner on the 250 Users Business Model */}
        <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-blue-900/20 border border-amber-500/30 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0 text-amber-400">
            <Shield className="w-5 h-5" />
          </div>
          <div className="space-y-1 text-xs">
            <strong className="text-sm text-white block">Official ISATS Commercial Model:</strong>
            <p className="text-slate-300">
              Base Subscription: <strong>TZS 100,000 / month</strong> includes up to <strong>250 active users</strong>.
              Users 1 through 250 are included with zero surcharge. Users 251+ are billed at the configurable rate (default TZS 500/user/mo).
            </p>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(plans.length > 0 ? plans : [
            {
              id: 1,
              name: 'Standard Enterprise Plan',
              monthly_base_price: 100000,
              included_users: 250,
              additional_user_monthly_price: 500,
              description: 'Standard multi-tenant plan with 250 users included and full ICT support features.',
              is_active: true,
              is_default: true,
            }
          ]).map((plan) => (
            <Card key={plan.id} className="p-6 bg-slate-900 border-slate-800 flex flex-col justify-between relative overflow-hidden">
              {plan.is_default && (
                <div className="absolute top-0 right-0 bg-amber-500 text-slate-950 text-[10px] font-bold px-3 py-1 rounded-bl-lg">
                  PRIMARY SAAS PLAN
                </div>
              )}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-amber-400">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">{plan.name}</h3>
                    <span className="text-[11px] text-slate-400">Monthly Plan</span>
                  </div>
                </div>

                <div className="py-2 border-y border-slate-800/80 space-y-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">TZS {Number(plan.monthly_base_price).toLocaleString()}</span>
                    <span className="text-xs text-slate-400">/ month</span>
                  </div>
                  <div className="text-xs text-emerald-400 font-medium">
                    Includes {plan.included_users} active users
                  </div>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  {plan.description || 'Full enterprise support, QR tracking, incident management, and reporting.'}
                </p>

                <div className="space-y-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>Active User Cap: <strong>{plan.included_users} Users</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>Additional User Price: <strong>TZS {Number(plan.additional_user_monthly_price).toLocaleString()} / mo</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>Hardware QR & Barcode Generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400" />
                    <span>Full Incident SLA Routing</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-emerald-400 font-semibold uppercase tracking-wider">
                  ● {plan.is_active ? 'Active' : 'Archived'}
                </span>
                <Button variant="outline" size="sm" className="text-xs gap-1.5 border-slate-700">
                  <Edit2 className="w-3.5 h-3.5" /> Edit Plan
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PlatformAdminLayout>
  )
}
