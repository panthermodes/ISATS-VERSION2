import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FolderTree, Plus, Search, Layers, Edit2, Trash2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MainLayout } from '@/layouts/MainLayout'

export default function CategoryList() {
  const [categories, setCategories] = useState<any[]>([])

  useEffect(() => {
    setCategories([
      { id: 1, name: 'Laptops & Workstations', description: 'Portable and desktop personal computing equipment', is_default: true, asset_count: 85 },
      { id: 2, name: 'Network Infrastructure', description: 'Routers, Managed Switches, Firewalls, and Access Points', is_default: true, asset_count: 24 },
      { id: 3, name: 'Point of Sale (POS)', description: 'POS Terminals, receipt printers, barcode guns, and cash drawers', is_default: false, asset_count: 18 },
      { id: 4, name: 'Surveillance & Security', description: 'CCTV IP Cameras, NVR storage units, and biometric clocks', is_default: false, asset_count: 42 },
    ])
  }, [])

  return (
    <MainLayout pageTitle="Hardware Categories & Asset Taxonomies">
      <div className="space-y-6 max-w-6xl mx-auto text-slate-100">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Hardware Categories</h2>
            <p className="text-xs text-slate-400 mt-0.5">Manage classification taxonomies for IT inventory and asset register.</p>
          </div>
          <Link to="/categories/create">
            <Button size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
              <Plus className="w-4 h-4" /> Add Category
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories.map((cat) => (
            <Card key={cat.id} className="p-5 bg-slate-900 border-slate-800 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400">
                    <FolderTree className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{cat.name}</h3>
                    <span className="text-[11px] text-slate-400">{cat.asset_count} registered assets</span>
                  </div>
                </div>
                {cat.is_default && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    DEFAULT
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">{cat.description}</p>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <Button variant="ghost" size="sm" className="text-xs gap-1 text-slate-400 hover:text-white">
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  )
}
