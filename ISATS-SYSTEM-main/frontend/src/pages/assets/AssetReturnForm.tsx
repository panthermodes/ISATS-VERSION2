import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, RotateCcw, CheckCircle2, ShieldAlert } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { MainLayout } from '@/layouts/MainLayout'

export default function AssetReturnForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    returnCondition: 'Good',
    storageLocation: 'ICT Main Inventory Vault (Room 102)',
    notes: 'Returned in working condition upon contract completion',
    accessoriesIncluded: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Asset returned to central inventory and custodian cleared.')
    navigate(id ? `/assets/${id}` : '/assets')
  }

  return (
    <MainLayout pageTitle="Return Equipment to Inventory">
      <div className="max-w-2xl mx-auto space-y-6 text-slate-100">
        <div className="flex items-center gap-3">
          <Link to={id ? `/assets/${id}` : '/assets'}>
            <Button variant="outline" size="sm" className="text-xs gap-1 border-slate-700">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Return Asset to Stock</h2>
            <p className="text-xs text-slate-400 mt-0.5">Check-in hardware, inspect physical condition, and update inventory.</p>
          </div>
        </div>

        <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Hardware Condition Inspection *"
              value={formData.returnCondition}
              onChange={(e) => setFormData({ ...formData, returnCondition: e.target.value })}
              options={[
                { value: 'Pristine', label: 'Pristine (Like new / no wear)' },
                { value: 'Good', label: 'Good (Normal operational wear)' },
                { value: 'NeedsMaintenance', label: 'Needs Maintenance (Minor damage / clean required)' },
                { value: 'Damaged', label: 'Damaged (Requires repair / diagnostic bench)' },
              ]}
            />
            <Input
              label="Check-in Storage Location *"
              value={formData.storageLocation}
              onChange={(e) => setFormData({ ...formData, storageLocation: e.target.value })}
              required
            />
            <Input
              label="Return Checklist & Inspection Notes *"
              placeholder="e.g. Charger, sleeve, and laptop returned. SSD wiped."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              required
            />

            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formData.accessoriesIncluded}
                onChange={(e) => setFormData({ ...formData, accessoriesIncluded: e.target.checked })}
                className="rounded bg-slate-900 border-slate-700 text-blue-600"
              />
              <span className="text-slate-300">
                All cables, power adapters, and peripherals verified and returned into stock
              </span>
            </label>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
              <Link to={id ? `/assets/${id}` : '/assets'}>
                <Button variant="outline" size="sm" className="text-xs border-slate-700">Cancel</Button>
              </Link>
              <Button type="submit" size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
                <RotateCcw className="w-4 h-4" /> Finalize Check-in
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}
