import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Wrench, Plus, Search, Calendar, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MainLayout } from '@/layouts/MainLayout'

export default function MaintenanceHistory() {
  const [logs, setLogs] = useState<any[]>([])

  useEffect(() => {
    setLogs([
      {
        id: 1,
        asset_tag: 'AST-DELL-8812',
        maintenance_type: 'Preventive',
        performed_by: 'Michael M. (Technician)',
        date: '2026-08-20',
        notes: 'Internal dust cleaning, fan thermal test, OS kernel patching.',
      },
      {
        id: 2,
        asset_tag: 'AST-HP-9921',
        maintenance_type: 'Corrective',
        performed_by: 'David T. (Technician)',
        date: '2026-08-18',
        notes: 'Replaced failed power supply unit (PSU 500W).',
      },
    ])
  }, [])

  return (
    <MainLayout pageTitle="Hardware Maintenance History & Logs">
      <div className="space-y-6 max-w-6xl mx-auto text-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Hardware Maintenance Ledger</h2>
            <p className="text-xs text-slate-400 mt-0.5">Chronological record of preventive service and corrective repairs.</p>
          </div>
          <Link to="/maintenance/logs/create">
            <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
              <Plus className="w-4 h-4" /> Log Service Record
            </Button>
          </Link>
        </div>

        <Card className="bg-slate-900 border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Date</th>
                  <th className="p-4">Asset Tag</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Performed By</th>
                  <th className="p-4">Service Notes & Replaced Parts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 text-slate-400 font-mono text-[11px]">{log.date}</td>
                    <td className="p-4 font-mono font-bold text-white">{log.asset_tag}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        log.maintenance_type === 'Preventive'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-amber-500/20 text-amber-400'
                      }`}>
                        {log.maintenance_type}
                      </span>
                    </td>
                    <td className="p-4 text-slate-200">{log.performed_by}</td>
                    <td className="p-4 text-slate-300 max-w-md">{log.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
