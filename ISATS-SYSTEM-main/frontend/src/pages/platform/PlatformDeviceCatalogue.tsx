import { useState, useEffect } from 'react'
import { PlatformAdminLayout } from '@/layouts/PlatformAdminLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Cpu, Search, Plus, CheckCircle2, Layers } from 'lucide-react'

export default function PlatformDeviceCatalogue() {
  const [catalogue, setCatalogue] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetch('/api/device-catalogue/')
      .then(res => res.json())
      .then(res => {
        if (res.success && res.data) {
          setCatalogue(res.data)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <PlatformAdminLayout pageTitle="Centralized ICT Device Catalogue">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Enterprise Hardware Taxonomy</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Extensible device categories and device types available across all tenant onboarding workflows.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search hardware categories & device types..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-500"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Catalogue List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {catalogue.map((cat) => (
            <Card key={cat.id} className="p-6 bg-slate-900 border-slate-800 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{cat.name}</h3>
                    <span className="text-[10px] text-slate-500 font-mono">{cat.slug}</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-400">{cat.types?.length || 0} types</span>
              </div>

              <div className="space-y-2">
                {cat.types
                  ?.filter((t: any) => t.name.toLowerCase().includes(search.toLowerCase()))
                  .map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50">
                      <div>
                        <div className="text-xs font-semibold text-slate-200">{t.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{t.code}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                        Active
                      </span>
                    </div>
                  ))}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PlatformAdminLayout>
  )
}
