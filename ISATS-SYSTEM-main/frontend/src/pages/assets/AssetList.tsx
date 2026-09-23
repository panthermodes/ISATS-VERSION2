import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, QrCode, Eye, Download, Printer } from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Pagination } from '@/components/ui/Pagination'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/context/AuthContext'
import { getAssets } from '@/services/assets'
import { useDebounce } from '@/hooks/useDebounce'
import { getStatusBadgeVariant } from '@/utils/formatters'
import { exportToCSV } from '@/utils/export'
import type { Asset } from '@/types'

const PAGE_SIZE = 20

export default function AssetList() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [qrAsset, setQrAsset] = useState<Asset | null>(null)
  const debouncedSearch = useDebounce(search, 400)

  const canEdit = user && ['ICT Officer', 'Admin', 'SuperAdmin'].includes(user.role)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAssets({ search: debouncedSearch, status: status || undefined, page })
      setAssets(res.results); setTotal(res.count)
    } catch { setAssets([]) } finally { setLoading(false) }
  }, [debouncedSearch, status, page])

  useEffect(() => { fetch() }, [fetch])
  useEffect(() => { setPage(1) }, [debouncedSearch, status])

  const handleExportCSV = () => {
    exportToCSV('isats_hardware_assets', assets, [
      { key: 'asset_tag', header: 'Asset Tag' },
      { key: 'asset_name', header: 'Device Name' },
      { key: 'asset_type', header: 'Category / Type' },
      { key: 'status', header: 'Status' },
      { key: 'serial_number', header: 'Serial Number' },
      { key: 'department', header: 'Department', format: (v) => v?.name || 'Unassigned' },
      { key: 'assigned_to', header: 'Assigned User', format: (v) => v?.username || 'Unassigned' },
      { key: 'location', header: 'Physical Location' },
      { key: 'purchase_date', header: 'Purchase Date' },
    ])
  }

  const columns = [
    { key: 'asset_tag', header: 'Tag', render: (r: Asset) => <span className="font-mono text-xs font-semibold text-blue">{r.asset_tag}</span> },
    { key: 'asset_name', header: 'Asset Name', render: (r: Asset) => <span className="font-medium text-primary-900 dark:text-slate-100">{r.asset_name}</span> },
    { key: 'asset_type', header: 'Type' },
    { key: 'status', header: 'Status', render: (r: Asset) => <Badge variant={getStatusBadgeVariant(r.status)} dot>{r.status}</Badge> },
    { key: 'department', header: 'Department', render: (r: Asset) => <span className="text-sm">{r.department?.name ?? '—'}</span> },
    { key: 'assigned_to', header: 'Assigned To', render: (r: Asset) => r.assigned_to ? <span className="text-sm">{r.assigned_to.username}</span> : <span className="text-xs text-muted">Unassigned</span> },
    { key: 'location', header: 'Location', render: (r: Asset) => <span className="text-sm">{r.location || '—'}</span> },
    {
      key: 'actions', header: '',
      render: (r: Asset) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => navigate(`/assets/${r.asset_id}`)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-primary-700 text-muted"><Eye className="w-4 h-4" /></button>
          {r.qr_code_image && <button onClick={() => setQrAsset(r)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-primary-700 text-muted"><QrCode className="w-4 h-4" /></button>}
        </div>
      ),
    },
  ]

  return (
    <OrganizationLayout pageTitle="Assets">
      <PageHeader
        title="Asset Management"
        subtitle={`${total} total assets`}
        breadcrumbs={[{ label: 'Assets' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button onClick={handleExportCSV} variant="outline" size="sm" leftIcon={<Download className="w-4 h-4" />}>
              Export CSV
            </Button>
            <Link to="/assets/batch-print">
              <Button variant="outline" size="sm" leftIcon={<Printer className="w-4 h-4" />}>
                Batch Labels
              </Button>
            </Link>
            {canEdit && (
              <Link to="/assets/create">
                <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
                  Add Asset
                </Button>
              </Link>
            )}
          </div>
        }
      />

      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input placeholder="Search assets…" leftIcon={<Search className="w-4 h-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select
          options={[{ value: '', label: 'All Statuses' }, { value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }, { value: 'Maintenance', label: 'Maintenance' }, { value: 'Disposed', label: 'Disposed' }]}
          value={status} onChange={(e) => setStatus(e.target.value)} containerClassName="w-44"
        />
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns as any} data={assets as any[]} isLoading={loading} emptyMessage="No assets found." onRowClick={(r: any) => navigate(`/assets/${r.asset_id}`)} keyField="asset_id" />
        <div className="px-4 border-t border-border dark:border-primary-700">
          <Pagination currentPage={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage} />
        </div>
      </div>

      {/* QR Code modal */}
      <Modal isOpen={!!qrAsset} onClose={() => setQrAsset(null)} title={`QR Code — ${qrAsset?.asset_tag}`} size="sm">
        {qrAsset?.qr_code_image && (
          <div className="flex flex-col items-center gap-4">
            <img src={`data:image/png;base64,${qrAsset.qr_code_image}`} alt="QR Code" className="w-48 h-48" />
            <a
              href={`data:image/png;base64,${qrAsset.qr_code_image}`}
              download={`${qrAsset.asset_tag}-qr.png`}
              className="btn-primary text-sm"
            >
              Download High-Res QR Code
            </a>
          </div>
        )}
      </Modal>
    </OrganizationLayout>
  )
}
