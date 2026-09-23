import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/context/ToastContext'
import { getAsset } from '@/services/assets'
import api from '@/services/api'

export default function AcknowledgePolicy() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const [asset, setAsset] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [ack, setAck] = useState(false)

  useEffect(() => {
    if (!id) return
    getAsset(id).then(setAsset).catch(() => toast.error('Asset not found')).finally(() => setLoading(false))
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!id) return
    if (!ack) {
      toast.error('Please confirm acknowledgement')
      return
    }
    setSubmitting(true)
    try {
      // Reuse existing Django view which expects a POST form param 'acknowledge' == 'true'
      await api.post(`/assets/${id}/acknowledge_policy/`, { acknowledge: 'true' })
      toast.success('Policy acknowledged')
      navigate('/dashboard')
    } catch (err) {
      toast.error('Failed to acknowledge policy')
    } finally { setSubmitting(false) }
  }

  if (loading) return (
    <OrganizationLayout pageTitle="Acknowledge Policy">
      <div className="p-8">Loading…</div>
    </OrganizationLayout>
  )

  if (!asset) return (
    <OrganizationLayout pageTitle="Acknowledge Policy">
      <div className="p-8">Asset not found.</div>
    </OrganizationLayout>
  )

  return (
    <OrganizationLayout pageTitle="Acknowledge Policy">
      <PageHeader title={`Acknowledge Policy for ${asset.asset_name}`} breadcrumbs={[{ label: 'Assets', href: '/assets' }, { label: asset.asset_name }]} />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-sm text-muted">Please read and acknowledge the asset usage policy before using this equipment.</p>
          <div className="p-4 bg-slate-50 rounded">
            <h3 className="font-semibold">Asset Policy</h3>
            <p className="text-sm text-muted mt-2">By acknowledging you agree to follow the organization's acceptable use policies and return the asset when requested.</p>
          </div>

          <label className="flex items-center gap-3 mt-4">
            <input type="checkbox" checked={ack} onChange={(e) => setAck(e.target.checked)} className="form-checkbox" />
            <span>I have read and agree to the policy</span>
          </label>

          <div>
            <Button type="submit" variant="primary" loading={submitting}>Acknowledge</Button>
            <Button variant="secondary" onClick={() => navigate(-1)} className="ml-2">Cancel</Button>
          </div>
        </form>
      </Card>
    </OrganizationLayout>
  )
}
