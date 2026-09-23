import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MainLayout } from '@/layouts/MainLayout'

export default function AssetUsageForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    assetTag: 'AST-DELL-8812',
    activityType: 'Production Data Processing',
    durationMinutes: 120,
    activityDate: new Date().toISOString().split('T')[0],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Asset usage runtime recorded.')
    navigate('/assets/usage')
  }

  return (
    <MainLayout pageTitle="Log Asset Utilization">
      <div className="max-w-2xl mx-auto space-y-6 text-slate-100">
        <div className="flex items-center gap-3">
          <Link to="/assets/usage">
            <Button variant="outline" size="sm" className="text-xs gap-1 border-slate-700">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Log Hardware Usage</h2>
            <p className="text-xs text-slate-400 mt-0.5">Record operation runtime and tasks performed.</p>
          </div>
        </div>

        <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Asset Tag Identifier *"
              value={formData.assetTag}
              onChange={(e) => setFormData({ ...formData, assetTag: e.target.value })}
              required
            />
            <Input
              label="Activity / Task Description *"
              placeholder="e.g. Video Rendering, Field Inspection, Point of Sale Shift"
              value={formData.activityType}
              onChange={(e) => setFormData({ ...formData, activityType: e.target.value })}
              required
            />
            <Input
              label="Duration in Minutes *"
              type="number"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: Number(e.target.value) })}
              required
            />
            <Input
              label="Date of Usage *"
              type="date"
              value={formData.activityDate}
              onChange={(e) => setFormData({ ...formData, activityDate: e.target.value })}
              required
            />

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
              <Link to="/assets/usage">
                <Button variant="outline" size="sm" className="text-xs border-slate-700">Cancel</Button>
              </Link>
              <Button type="submit" size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
                <CheckCircle2 className="w-4 h-4" /> Save Usage Entry
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}
