import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRightLeft, Search, Building2, User, Clock, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MainLayout } from '@/layouts/MainLayout'

export default function AssetMovementHistory() {
  const { id } = useParams()
  const [movements, setMovements] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simulated or backend API fetch for asset movements
    setMovements([
      {
        id: 1,
        asset_tag: 'AST-DELL-8812',
        asset_name: 'Dell Latitude 5420',
        from_location: 'ICT Storage Vault (Room 102)',
        to_location: 'Finance Dept (Desk F-04)',
        moved_by: 'Michael M. (ICT Officer)',
        timestamp: '2026-08-20 14:30',
        notes: 'Handed over to Senior Accountant after policy acknowledgement.',
      },
      {
        id: 2,
        asset_tag: 'AST-DELL-8812',
        asset_name: 'Dell Latitude 5420',
        from_location: 'Vendor Delivery Bay',
        to_location: 'ICT Storage Vault (Room 102)',
        moved_by: 'Grace K. (Procurement Officer)',
        timestamp: '2026-08-15 09:00',
        notes: 'Initial receipt and unboxing inspection.',
      }
    ])
    setLoading(false)
  }, [id])

  return (
    <MainLayout pageTitle="Asset Movement & Relocation Ledger">
      <div className="space-y-6 max-w-6xl mx-auto text-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={id ? `/assets/${id}` : '/assets'}>
              <Button variant="outline" size="sm" className="text-xs gap-1 border-slate-700">
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Asset
              </Button>
            </Link>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Hardware Movement History</h2>
              <p className="text-xs text-slate-400 mt-0.5">Chronological audit ledger of physical relocations and custody changes.</p>
            </div>
          </div>
          <Link to={id ? `/assets/${id}/move` : '/assets'}>
            <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
              <ArrowRightLeft className="w-4 h-4" /> Record New Movement
            </Button>
          </Link>
        </div>

        <Card className="bg-slate-900 border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Asset Tag & Name</th>
                  <th className="p-4">Origin (From)</th>
                  <th className="p-4">Destination (To)</th>
                  <th className="p-4">Authorized Officer</th>
                  <th className="p-4">Purpose / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {movements.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 text-slate-400 font-mono text-[11px]">{m.timestamp}</td>
                    <td className="p-4">
                      <div className="font-bold text-white font-mono">{m.asset_tag}</div>
                      <div className="text-[11px] text-slate-400">{m.asset_name}</div>
                    </td>
                    <td className="p-4 text-slate-300 font-medium">{m.from_location}</td>
                    <td className="p-4 text-emerald-400 font-medium">{m.to_location}</td>
                    <td className="p-4 text-slate-200">{m.moved_by}</td>
                    <td className="p-4 text-slate-400 max-w-xs">{m.notes}</td>
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
