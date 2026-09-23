import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRightLeft, CheckCircle2, User } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { MainLayout } from '@/layouts/MainLayout'

export default function AssetTransferForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fromUser: 'shebby',
    toUser: 'asmith',
    reason: 'Departmental reassignment for Q3 deliverables',
    clearanceConfirmed: true,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Asset custody transfer recorded with dual clearance.')
    navigate(id ? `/assets/${id}` : '/assets')
  }

  return (
    <MainLayout pageTitle="Transfer Equipment Custody">
      <div className="max-w-2xl mx-auto space-y-6 text-slate-100">
        <div className="flex items-center gap-3">
          <Link to={id ? `/assets/${id}` : '/assets'}>
            <Button variant="outline" size="sm" className="text-xs gap-1 border-slate-700">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Inter-Employee Asset Transfer</h2>
            <p className="text-xs text-slate-400 mt-0.5">Transfer equipment custody between employees with clearance tracking.</p>
          </div>
        </div>

        <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Current Custodian (From)"
              value="Shebby Panther (@shebby) — ICT & Infrastructure"
              disabled
              className="bg-slate-950 text-slate-400"
            />
            <Select
              label="New Recipient Employee (To) *"
              value={formData.toUser}
              onChange={(e) => setFormData({ ...formData, toUser: e.target.value })}
              options={[
                { value: 'asmith', label: 'Alice Smith (@asmith) — Operations' },
                { value: 'smustafa', label: 'Sarah Mustafa (@smustafa) — Finance' },
                { value: 'bwayne', label: 'Bruce Wayne (@bwayne) — Executive' },
              ]}
            />
            <Input
              label="Transfer Reason & Work Order *"
              placeholder="e.g. Project handover and supervisor approval"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />

            <label className="flex items-center gap-2 p-3 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={formData.clearanceConfirmed}
                onChange={(e) => setFormData({ ...formData, clearanceConfirmed: e.target.checked })}
                className="rounded bg-slate-900 border-slate-700 text-blue-600"
              />
              <span className="text-slate-300">
                Both parties have inspected hardware and confirmed handover of physical item and accessories
              </span>
            </label>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
              <Link to={id ? `/assets/${id}` : '/assets'}>
                <Button variant="outline" size="sm" className="text-xs border-slate-700">Cancel</Button>
              </Link>
              <Button type="submit" size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
                <ArrowRightLeft className="w-4 h-4" /> Finalize Transfer
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}
