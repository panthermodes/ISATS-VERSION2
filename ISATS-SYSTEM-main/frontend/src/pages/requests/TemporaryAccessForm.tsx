import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, ShieldCheck, Send } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { MainLayout } from '@/layouts/MainLayout'

export default function TemporaryAccessForm() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    accessType: 'Network',
    durationDays: 7,
    reason: '',
    targetSystem: 'VPN / Enterprise ERP / Staging Server',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    alert('Temporary access request submitted for ICT Security approval.')
    navigate('/requests')
  }

  return (
    <MainLayout pageTitle="Temporary Elevated Access Request">
      <div className="max-w-2xl mx-auto space-y-6 text-slate-100">
        <div className="flex items-center gap-3">
          <Link to="/requests">
            <Button variant="outline" size="sm" className="text-xs gap-1 border-slate-700">
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Time-Bound Access Request</h2>
            <p className="text-xs text-slate-400 mt-0.5">Request temporary elevated network, software, or admin credentials.</p>
          </div>
        </div>

        <Card className="p-6 bg-slate-900 border-slate-800 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Select
              label="Access Privilege Category *"
              value={formData.accessType}
              onChange={(e) => setFormData({ ...formData, accessType: e.target.value })}
              options={[
                { value: 'Network', label: 'Remote VPN & Network Subnet Access' },
                { value: 'Software', label: 'Licensed Software / Enterprise Tool Access' },
                { value: 'Admin', label: 'Temporary Server Admin / Root Privileges' },
              ]}
            />
            <Input
              label="Target System / Asset Identifier *"
              placeholder="e.g. SRV-DATABASE-01 / Production ERP"
              value={formData.targetSystem}
              onChange={(e) => setFormData({ ...formData, targetSystem: e.target.value })}
              required
            />
            <Input
              label="Requested Duration (Days) *"
              type="number"
              min="1"
              max="30"
              value={formData.durationDays}
              onChange={(e) => setFormData({ ...formData, durationDays: Number(e.target.value) })}
              required
            />
            <Input
              label="Purpose / Audit Justification *"
              placeholder="Detail the technical task requiring temporary elevated permissions"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
              <Link to="/requests">
                <Button variant="outline" size="sm" className="text-xs border-slate-700">Cancel</Button>
              </Link>
              <Button type="submit" size="sm" className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white">
                <Send className="w-4 h-4" /> Submit for Authorization
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}
