import { Activity, AlertTriangle, ShieldCheck, Clock, CheckCircle2 } from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'

export default function PredictiveAlerts() {
  const alerts = [
    { id: 1, tag: 'AST-SRV-001', name: 'Dell PowerEdge R740 Server', risk: 'High', reason: 'Drive array temperature threshold exceeded 4 times in 7 days.', recommendation: 'Schedule fan & thermal paste preventative servicing.', date: '2026-08-22' },
    { id: 2, tag: 'AST-LPT-042', name: 'Lenovo ThinkPad T14s', risk: 'Medium', reason: 'Battery health degraded below 65% capacity after 850 cycles.', recommendation: 'Proactively replace battery module before field failure.', date: '2026-08-20' },
    { id: 3, tag: 'AST-SW-008', name: 'Cisco Catalyst 2960X Switch', risk: 'Low', reason: 'Uptime exceeded 400 continuous days without reboot.', recommendation: 'Perform scheduled firmware update during weekend maintenance window.', date: '2026-08-15' },
  ]

  return (
    <OrganizationLayout pageTitle="Predictive Hardware Health">
      <PageHeader
        title="Predictive Maintenance Alerts"
        subtitle="AI-driven early failure detection based on hardware telemetry and usage intensity"
        breadcrumbs={[{ label: 'Maintenance', href: '/maintenance' }, { label: 'Predictive Alerts' }]}
      />

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-500">Monitored Assets</span>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">480 Devices</div>
            <div className="text-xs text-emerald-500 font-medium flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> 98% Normal Health
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-500">High Risk Alerts</span>
            <div className="text-2xl font-bold text-rose-600">1 Device</div>
            <div className="text-xs text-rose-500 font-medium flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Action Recommended
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-semibold text-slate-500">Prevented Outages</span>
            <div className="text-2xl font-bold text-blue-600">14 Incidents</div>
            <div className="text-xs text-slate-500 font-medium">In the past 90 days</div>
          </div>
        </div>

        <Card title="Active Predictive Diagnostics">
          <div className="space-y-4">
            {alerts.map((a) => (
              <div key={a.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{a.tag}</span>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">{a.name}</span>
                    <Badge variant={a.risk === 'High' ? 'danger' : a.risk === 'Medium' ? 'warning' : 'info'}>{a.risk} Risk</Badge>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{a.reason}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">💡 Recommendation: {a.recommendation}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Button variant="primary" size="sm">
                    Create Service Ticket
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </OrganizationLayout>
  )
}
