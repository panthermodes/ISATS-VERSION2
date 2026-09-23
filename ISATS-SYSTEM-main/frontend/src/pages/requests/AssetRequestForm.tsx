import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Laptop, Send } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { MainLayout } from '@/layouts/MainLayout'

export default function AssetRequestForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    hardwareType: 'LAPTOP',
    modelPreference: 'Dell Latitude / Lenovo ThinkPad',
    urgency: 'normal',
    justification: '',
    requiredByDate: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Hardware requisition submitted to HOD and ICT Manager for approval.')
    navigate('/requests')
  }

  return (
    <MainLayout pageTitle="Submit Hardware Requisition">
      <div className="max-w-2xl mx-auto space-y-6 text-slate-100">
        <div className="flex items-center gap-3">
          <Link to="/requests">
            <Button variant="outline" size="sm" className="text-xs gap-1 border-slate-700">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Requisitions
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">New Hardware Requisition</h2>
            <p className="text-xs text-slate-400 mt-0.5">Request new or replacement IT equipment.</p>
          </div>
        </div>

        <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Hardware Category / Device Type *"
              value={formData.hardwareType}
              onChange={(e) => setFormData({ ...formData, hardwareType: e.target.value })}
              options={[
                { value: 'LAPTOP', label: 'Laptop (Standard / Executive)' },
                { value: 'DESKTOP', label: 'Desktop Workstation' },
                { value: 'MONITOR', label: 'External Monitor (24" / 27")' },
                { value: 'PERIPHERAL', label: 'Keyboard, Mouse & Docking Station' },
                { value: 'PRINTER', label: 'Desktop / Barcode Printer' },
              ]}
            />
            <Input
              label="Preferred Specifications / Model"
              placeholder="e.g. Core i7, 16GB RAM, 512GB SSD"
              value={formData.modelPreference}
              onChange={(e) => setFormData({ ...formData, modelPreference: e.target.value })}
            />
            <Select
              label="Urgency Level *"
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
              options={[
                { value: 'normal', label: 'Normal (1 - 2 weeks)' },
                { value: 'high', label: 'High (3 - 5 days)' },
                { value: 'urgent', label: 'Urgent (1 - 2 days)' },
              ]}
            />
            <Input
              label="Business Justification & Expected Use *"
              placeholder="Explain how this equipment supports your day-to-day workflow"
              value={formData.justification}
              onChange={(e) => setFormData({ ...formData, justification: e.target.value })}
              required
            />
            <Input
              label="Required By Date"
              type="date"
              value={formData.requiredByDate}
              onChange={(e) => setFormData({ ...formData, requiredByDate: e.target.value })}
            />

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
              <Link to="/requests">
                <Button variant="outline" size="sm" className="text-xs border-slate-700">Cancel</Button>
              </Link>
              <Button type="submit" size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
                <Send className="w-4 h-4" /> Submit Requisition
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}
