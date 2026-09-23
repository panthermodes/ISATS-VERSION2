import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, CheckCircle2, ShieldAlert } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { MainLayout } from '@/layouts/MainLayout'

export default function AssetAssignmentForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    targetUser: 'shebby',
    department: 'ICT Support',
    notes: 'Primary workstation assignment',
    overrideLocked: false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Asset assigned successfully with digital policy signature requested.')
    navigate(id ? `/assets/${id}` : '/assets')
  }

  return (
    <MainLayout pageTitle="Assign Hardware to Employee">
      <div className="max-w-2xl mx-auto space-y-6 text-slate-100">
        <div className="flex items-center gap-3">
          <Link to={id ? `/assets/${id}` : '/assets'}>
            <Button variant="outline" size="sm" className="text-xs gap-1 border-slate-700">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Assign Hardware Asset</h2>
            <p className="text-xs text-slate-400 mt-0.5">Assign asset custody and trigger user policy acknowledgement.</p>
          </div>
        </div>

        <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Select Assignee / Employee *"
              value={formData.targetUser}
              onChange={(e) => setFormData({ ...formData, targetUser: e.target.value })}
              options={[
                { value: 'shebby', label: 'Shebby Panther (@shebby) — ICT & Infrastructure' },
                { value: 'asmith', label: 'Alice Smith (@asmith) — Operations' },
                { value: 'smustafa', label: 'Sarah Mustafa (@smustafa) — Finance' },
              ]}
            />
            <Input
              label="Assignment Notes / Conditions *"
              placeholder="e.g. Workstation issued in pristine condition with charger and laptop bag"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              required
            />

            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formData.overrideLocked}
                onChange={(e) => setFormData({ ...formData, overrideLocked: e.target.checked })}
                className="rounded bg-slate-900 border-slate-700 text-blue-600"
              />
              <span className="text-slate-300">
                SuperAdmin Override: Force reassignment if asset is currently marked in-service
              </span>
            </label>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
              <Link to={id ? `/assets/${id}` : '/assets'}>
                <Button variant="outline" size="sm" className="text-xs border-slate-700">Cancel</Button>
              </Link>
              <Button type="submit" size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
                <UserPlus className="w-4 h-4" /> Confirm Assignment
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}
