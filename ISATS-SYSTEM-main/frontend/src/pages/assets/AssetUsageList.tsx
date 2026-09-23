import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Clock, Activity, Plus, Search, User, Laptop } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MainLayout } from '@/layouts/MainLayout'

export default function AssetUsageList() {
  const { id } = useParams()
  const [usageLogs, setUsageLogs] = useState<any[]>([])

  useEffect(() => {
    setUsageLogs([
      {
        id: 1,
        asset_tag: 'AST-DELL-5420-01',
        user: 'shebby',
        activity_type: 'Software Development & Compilation',
        duration_minutes: 240,
        activity_date: '2026-08-24',
      },
      {
        id: 2,
        asset_tag: 'AST-HP-9921',
        user: 'asmith',
        activity_type: 'Financial Audit & Spreadsheet Processing',
        duration_minutes: 180,
        activity_date: '2026-08-23',
      },
    ])
  }, [id])

  return (
    <MainLayout pageTitle="Hardware Utilization & Usage Logs">
      <div className="space-y-6 max-w-6xl mx-auto text-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={id ? `/assets/${id}` : '/assets'}>
              <Button variant="outline" size="sm" className="text-xs gap-1 border-slate-700">
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Asset Usage & Runtime Ledger</h2>
              <p className="text-xs text-slate-400 mt-0.5">Track hardware operator activity, daily runtimes, and duty cycles.</p>
            </div>
          </div>
          <Link to="/assets/usage/create">
            <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
              <Plus className="w-4 h-4" /> Log Runtime
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
                  <th className="p-4">Operator / User</th>
                  <th className="p-4">Activity Type</th>
                  <th className="p-4">Duration (Mins)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {usageLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 text-slate-400 font-mono text-[11px]">{log.activity_date}</td>
                    <td className="p-4 font-mono font-bold text-white">{log.asset_tag}</td>
                    <td className="p-4 text-slate-200">@{log.user}</td>
                    <td className="p-4 text-slate-300">{log.activity_type}</td>
                    <td className="p-4 font-bold text-emerald-400">{log.duration_minutes} mins ({Math.round(log.duration_minutes / 60 * 10) / 10} hrs)</td>
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
