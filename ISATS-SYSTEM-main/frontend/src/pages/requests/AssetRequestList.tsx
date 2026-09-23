import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, CheckCircle2, Clock, XCircle, ArrowRight, Laptop, FileText } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MainLayout } from '@/layouts/MainLayout'

export default function AssetRequestList() {
  const [requests, setRequests] = useState<any[]>([])
  const [search, setSearch] = useState('')

  useEffect(() => {
    setRequests([
      {
        id: 401,
        user: 'Emmanuel K.',
        department: 'Operations',
        item: 'Dell UltraSharp 27" Monitor',
        urgency: 'Normal',
        status: 'Pending',
        created_at: '2026-08-24 10:15',
        justification: 'Dual display required for logistics tracking.'
      },
      {
        id: 402,
        user: 'Sarah M.',
        department: 'Finance',
        item: 'Lenovo ThinkPad T14 Gen 4',
        urgency: 'Urgent',
        status: 'Approved',
        created_at: '2026-08-22 14:00',
        justification: 'Field audit assignment starting next week.'
      }
    ])
  }, [])

  return (
    <MainLayout pageTitle="Hardware Requisitions & Access Requests">
      <div className="space-y-6 max-w-6xl mx-auto text-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Staff Equipment Requisitions</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage departmental hardware requests and procurement approvals.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/requests/temporary-access">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 border-slate-700">
                <Clock className="w-3.5 h-3.5" /> Temporary Access Request
              </Button>
            </Link>
            <Link to="/requests/create">
              <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
                <Plus className="w-4 h-4" /> Submit Requisition
              </Button>
            </Link>
          </div>
        </div>

        {/* Requests Table */}
        <Card className="bg-slate-900 border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Req #</th>
                  <th className="p-4">Requester</th>
                  <th className="p-4">Department</th>
                  <th className="p-4">Requested Hardware</th>
                  <th className="p-4">Urgency</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Submission Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {requests.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-mono font-bold text-white">#{r.id}</td>
                    <td className="p-4 font-semibold text-slate-200">{r.user}</td>
                    <td className="p-4 text-slate-400">{r.department}</td>
                    <td className="p-4 text-white font-medium">{r.item}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        r.urgency === 'Urgent' ? 'bg-rose-500/20 text-rose-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {r.urgency}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                        r.status === 'Approved'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                      }`}>
                        {r.status === 'Approved' ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {r.status}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">{r.created_at}</td>
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
