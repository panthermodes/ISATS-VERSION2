import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, QrCode, Barcode, Edit, Trash2, Calendar, MapPin, Tag, User, Building2 } from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { getAsset, deleteAsset } from '@/services/assets'
import { getStatusBadgeVariant, getPriorityBadgeVariant, formatDate } from '@/utils/formatters'
import type { Asset } from '@/types'

export default function AssetDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const [asset, setAsset] = useState<Asset | null>(null)
  const [loading, setLoading] = useState(true)
  const [qrOpen, setQrOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const canEdit = user && ['ICT Officer', 'Admin', 'SuperAdmin'].includes(user.role)

  useEffect(() => {
    if (!id) return
    getAsset(id).then(setAsset).catch(() => toast.error('Asset not found')).finally(() => setLoading(false))
  }, [id])

  const handleDelete = async () => {
    if (!asset) return
    setDeleting(true)
    try {
      await deleteAsset(asset.asset_id)
      toast.success('Asset deleted')
      navigate('/assets')
    } catch { toast.error('Failed to delete asset') } finally { setDeleting(false) }
  }

  if (loading) {
    return (
      <OrganizationLayout pageTitle="Asset Detail">
        <div className="space-y-4"><Skeleton variant="rect" height="100px" /><Skeleton variant="rect" height="300px" /></div>
      </OrganizationLayout>
    )
  }

  if (!asset) {
    return (
      <OrganizationLayout pageTitle="Not Found">
        <div className="text-center py-20"><p className="text-muted">Asset not found.</p></div>
      </OrganizationLayout>
    )
  }

  const info = [
    { icon: <Tag className="w-4 h-4" />, label: 'Asset Tag', value: asset.asset_tag },
    { icon: <Tag className="w-4 h-4" />, label: 'Serial Number', value: asset.serial_number },
    { icon: <Tag className="w-4 h-4" />, label: 'Type', value: asset.asset_type },
    { icon: <Tag className="w-4 h-4" />, label: 'Category', value: asset.category?.name ?? '—' },
    { icon: <Building2 className="w-4 h-4" />, label: 'Department', value: asset.department?.name ?? '—' },
    { icon: <MapPin className="w-4 h-4" />, label: 'Location', value: asset.location || '—' },
    { icon: <User className="w-4 h-4" />, label: 'Assigned To', value: asset.assigned_to ? `${asset.assigned_to.first_name} ${asset.assigned_to.last_name}` : 'Unassigned' },
    { icon: <Tag className="w-4 h-4" />, label: 'Manufacturer', value: asset.manufacturer },
    { icon: <Tag className="w-4 h-4" />, label: 'Model', value: asset.model },
    { icon: <Calendar className="w-4 h-4" />, label: 'Purchase Date', value: asset.purchase_date ? formatDate(asset.purchase_date) : '—' },
    { icon: <Calendar className="w-4 h-4" />, label: 'Warranty Expiry', value: asset.warranty_expiry ? formatDate(asset.warranty_expiry) : '—' },
    { icon: <Calendar className="w-4 h-4" />, label: 'Last Maintenance', value: asset.last_maintenance_date ? formatDate(asset.last_maintenance_date) : '—' },
  ]

  return (
    <OrganizationLayout pageTitle={asset.asset_name}>
      <PageHeader
        title={asset.asset_name}
        subtitle={asset.asset_tag}
        breadcrumbs={[{ label: 'Assets', href: '/assets' }, { label: asset.asset_name }]}
        actions={
          <div className="flex gap-2">
            <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>Back</Button>
            {asset.qr_code_image && <Button variant="secondary" leftIcon={<QrCode className="w-4 h-4" />} onClick={() => setQrOpen(true)}>QR Code</Button>}
            {canEdit && (
              <>
                <Link to={`/assets/${id}/edit`}><Button variant="primary" leftIcon={<Edit className="w-4 h-4" />}>Edit</Button></Link>
                <Button variant="danger" leftIcon={<Trash2 className="w-4 h-4" />} loading={deleting} onClick={handleDelete}>Delete</Button>
              </>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info grid */}
        <div className="lg:col-span-2">
          <Card title="Asset Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {info.map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="text-muted mt-0.5 flex-shrink-0">{icon}</div>
                  <div>
                    <p className="text-xs text-muted">{label}</p>
                    <p className="text-sm font-medium text-primary-900 dark:text-slate-100">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Status sidebar */}
        <div className="space-y-4">
          <Card title="Status">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted mb-1">Status</p>
                <Badge variant={getStatusBadgeVariant(asset.status)} dot size="md">{asset.status}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Priority</p>
                <Badge variant={getPriorityBadgeVariant(asset.priority_level)} size="md">{asset.priority_level}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Condition</p>
                <p className="text-sm font-medium text-primary-900 dark:text-slate-100">{asset.condition_status}</p>
              </div>
              <div>
                <p className="text-xs text-muted mb-1">Risk Score</p>
                <p className="text-2xl font-bold text-primary-900 dark:text-slate-100">{asset.risk_score}<span className="text-xs text-muted">/100</span></p>
              </div>
            </div>
          </Card>

          {asset.vendor_name && (
            <Card title="Vendor">
              <p className="text-sm text-primary-900 dark:text-slate-100">{asset.vendor_name}</p>
            </Card>
          )}
        </div>
      </div>

      {/* QR Modal */}
      <Modal isOpen={qrOpen} onClose={() => setQrOpen(false)} title={`QR Code — ${asset.asset_tag}`} size="sm">
        <div className="flex flex-col items-center gap-4">
          <img src={`data:image/png;base64,${asset.qr_code_image}`} alt="QR" className="w-48 h-48" />
          <a href={`data:image/png;base64,${asset.qr_code_image}`} download={`${asset.asset_tag}-qr.png`} className="btn-primary text-sm">Download</a>
        </div>
      </Modal>
    </OrganizationLayout>
  )
}
