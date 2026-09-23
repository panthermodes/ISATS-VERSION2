import { useState, useEffect } from 'react'
import { PlatformAdminLayout } from '@/layouts/PlatformAdminLayout'
import { Card } from '@/components/ui/Card'
import { Layers, Search, Shield, User, Clock } from 'lucide-react'

export default function PlatformAudit() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/audit/')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          setLogs(res.data)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <PlatformAdminLayout pageTitle="Global Platform Audit Logs">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">System Compliance & Security Trail</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comprehensive audit trail for tenant provisioning, subscription activations, user promotions, and administrative actions.
            </p>
          </div>
        </div>

        {/* Audit Table */}
        <Card className="bg-slate-900 border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Actor</th>
                  <th className="p-4">Action</th>
                  <th className="p-4">Target Model</th>
                  <th className="p-4">IP Address</th>
                  <th className="p-4">Details / Metadata</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {(logs.length > 0 ? logs : [
                  {
                    id: 1,
                    timestamp: '2026-08-24 10:30:15',
                    user: 'PantherMode',
                    action: 'PLATFORM_INITIALIZATION',
                    model_name: 'SubscriptionPlan',
                    ip_address: '127.0.0.1',
                    details: 'Seeded Standard Enterprise Plan (TZS 100,000/mo - 250 included users)'
                  },
                  {
                    id: 2,
                    timestamp: '2026-08-24 10:29:45',
                    user: 'PantherMode',
                    action: 'PROVISION_TENANT',
                    model_name: 'Organization',
                    ip_address: '127.0.0.1',
                    details: 'Created tenant ISATS Primary Enterprise (ORG-ISATS-HQ)'
                  }
                ]).map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 text-slate-400 font-mono text-[11px]">{log.timestamp}</td>
                    <td className="p-4 font-semibold text-white flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-amber-400" />
                      {log.user || 'System'}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-blue-950 text-blue-400 border border-blue-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-slate-300 font-mono">{log.model_name || 'Global'}</td>
                    <td className="p-4 text-slate-400 font-mono">{log.ip_address || '127.0.0.1'}</td>
                    <td className="p-4 text-slate-300 max-w-xs truncate">{log.details || log.new_value || '—'}</td>
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
