import { useState, useEffect } from 'react'
import { useNavigate, useParams, Link } from 'react-router-dom'
import {
  QrCode, ArrowLeft, Camera, CheckCircle2, AlertTriangle,
  Tag, User, Building2, MapPin, ExternalLink, RefreshCw
} from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { useToast } from '@/context/ToastContext'
import { DeviceTypeIcon } from '@/components/devices/DeviceTypeIcon'

interface FoundAsset {
  asset_id: string
  asset_tag: string
  asset_name: string
  serial_number: string
  status: string
  location?: string
  department?: string
  assigned_to?: string
  device_type?: {
    id: number
    name: string
    code: string
    category_name: string
    icon?: string
  }
  qr_code_image?: string
  barcode_image?: string
}

export default function ScanAsset() {
  const navigate = useNavigate()
  const { code } = useParams<{ code?: string }>()
  const toast = useToast()

  const [tagInput, setTagInput] = useState(code || '')
  const [loading, setLoading] = useState(false)
  const [foundAsset, setFoundAsset] = useState<FoundAsset | null>(null)
  const [error, setError] = useState<string | null>(null)

  const performLookup = async (lookupCode: string) => {
    if (!lookupCode.trim()) return
    setLoading(true)
    setError(null)
    setFoundAsset(null)

    try {
      const res = await fetch(`/api/assets/scan-lookup/?code=${encodeURIComponent(lookupCode.trim())}`)
      const json = await res.json()

      if (json.success && json.data) {
        setFoundAsset(json.data)
      } else {
        setError(json.error || 'No asset matching this code was found in your organization.')
      }
    } catch {
      setError('Network error looking up asset code.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (code) {
      performLookup(code)
    }
  }, [code])

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault()
    performLookup(tagInput)
  }

  return (
    <OrganizationLayout pageTitle="Asset Scanner & Verification">
      <PageHeader
        title="Asset Scanner & Verification"
        subtitle="Look up hardware specifications, ownership, and history by barcode or QR code"
        breadcrumbs={[{ label: 'Assets', href: '/assets' }, { label: 'Scanner' }]}
        actions={
          <Button variant="secondary" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
            Back to Assets
          </Button>
        }
      />

      <div className="max-w-2xl mx-auto space-y-6">
        {/* Scanner Optical View & Manual Tag Input */}
        <Card className="text-center p-6 sm:p-8 space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
            <Camera className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Optical Scanner Active</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Point your handheld scanner at the asset label or enter the code below.
            </p>
          </div>

          <form onSubmit={handleLookup} className="space-y-3 pt-2 text-left">
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  label="Scan Input / Asset Tag / Serial"
                  placeholder="e.g. AST-2026-0042"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  autoFocus
                  required
                />
              </div>
              <div className="flex items-end">
                <Button type="submit" variant="primary" loading={loading} className="h-10 px-5">
                  Verify
                </Button>
              </div>
            </div>
          </form>
        </Card>

        {/* Verification Result Card */}
        {loading && (
          <Card className="p-8 text-center text-slate-400 text-xs">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
            Querying organization hardware registry...
          </Card>
        )}

        {error && (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Asset Verification Failed</p>
              <p className="mt-0.5 text-rose-500/90 dark:text-rose-300/90">{error}</p>
            </div>
          </div>
        )}

        {foundAsset && (
          <Card className="p-6 space-y-5 border-blue-500/40 shadow-glow">
            <div className="flex items-start justify-between border-b border-slate-100 dark:border-[#1E293B] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                  <DeviceTypeIcon iconName={foundAsset.device_type?.icon} className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {foundAsset.asset_name}
                    </h3>
                    <Badge variant={foundAsset.status.toLowerCase() as any} size="sm">
                      {foundAsset.status}
                    </Badge>
                  </div>
                  <p className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
                    {foundAsset.asset_tag}
                  </p>
                </div>
              </div>
              <Link to={`/assets/${foundAsset.asset_id}`}>
                <Button variant="outline" size="sm" rightIcon={<ExternalLink className="w-3.5 h-3.5" />}>
                  View Profile
                </Button>
              </Link>
            </div>

            {/* Hardware Specification Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Device Classification</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {foundAsset.device_type?.name || 'Standard Equipment'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Serial Number</span>
                <p className="font-mono font-bold text-slate-800 dark:text-slate-200">
                  {foundAsset.serial_number || 'N/A'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Assigned User</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {foundAsset.assigned_to || 'Unassigned'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Department</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {foundAsset.department || 'General'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Location</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  {foundAsset.location || 'Headquarters'}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-400 font-medium">Audit Status</span>
                <p className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Verified Authenticated
                </p>
              </div>
            </div>

            {/* QR & Barcode Preview */}
            {(foundAsset.qr_code_image || foundAsset.barcode_image) && (
              <div className="pt-4 border-t border-slate-100 dark:border-[#1E293B] flex flex-wrap items-center justify-around gap-4 bg-slate-50/50 dark:bg-[#07111F]/50 p-4 rounded-xl">
                {foundAsset.qr_code_image && (
                  <div className="text-center space-y-1">
                    <span className="text-[10px] text-slate-400 font-medium block">QR Identifier</span>
                    <img
                      src={`data:image/png;base64,${foundAsset.qr_code_image}`}
                      alt="QR"
                      className="w-20 h-20 mx-auto rounded-lg border border-slate-200 dark:border-[#1E293B] bg-white p-1"
                    />
                  </div>
                )}
                {foundAsset.barcode_image && (
                  <div className="text-center space-y-1">
                    <span className="text-[10px] text-slate-400 font-medium block">Code128 Barcode</span>
                    <img
                      src={`data:image/png;base64,${foundAsset.barcode_image}`}
                      alt="Barcode"
                      className="h-16 mx-auto rounded-lg border border-slate-200 dark:border-[#1E293B] bg-white p-1"
                    />
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </div>
    </OrganizationLayout>
  )
}
