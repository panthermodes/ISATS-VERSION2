import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRightLeft, CheckCircle2, Building2, MapPin } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MainLayout } from '@/layouts/MainLayout'

export default function AssetMovementForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    fromLocation: 'Finance Department (Room 204)',
    toLocation: '',
    purpose: '',
    authorizedBy: 'ICT Support Officer',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Asset relocation logged successfully.')
    navigate(id ? `/assets/${id}` : '/assets')
  }

  return (
    <MainLayout pageTitle="Record Hardware Relocation">
      <div className="max-w-2xl mx-auto space-y-6 text-slate-100">
        <div className="flex items-center gap-3">
          <Link to={id ? `/assets/${id}` : '/assets'}>
            <Button variant="outline" size="sm" className="text-xs gap-1 border-slate-700">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Physical Asset Movement Form</h2>
            <p className="text-xs text-slate-400 mt-0.5">Transfer equipment location with formal custody tracking.</p>
          </div>
        </div>

        <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Current Origin Location"
              value={formData.fromLocation}
              disabled
              className="bg-slate-950 text-slate-400"
            />
            <Input
              label="Target Destination Location *"
              placeholder="e.g. Server Room B / Executive Suite 3"
              value={formData.toLocation}
              onChange={(e) => setFormData({ ...formData, toLocation: e.target.value })}
              required
            />
            <Input
              label="Purpose / Transfer Reason *"
              placeholder="e.g. Employee departmental relocation / Hardware upgrade"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              required
            />

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
              <Link to={id ? `/assets/${id}` : '/assets'}>
                <Button variant="outline" size="sm" className="text-xs border-slate-700">Cancel</Button>
              </Link>
              <Button type="submit" size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
                <CheckCircle2 className="w-4 h-4" /> Confirm & Log Relocation
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}
