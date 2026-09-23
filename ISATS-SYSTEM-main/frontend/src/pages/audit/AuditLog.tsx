import { useEffect, useState, useCallback } from 'react'
import { Search, Download } from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Table } from '@/components/ui/Table'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Pagination } from '@/components/ui/Pagination'
import { getAuditLogs } from '@/services/audit'
import { useDebounce } from '@/hooks/useDebounce'
import { formatDateTime } from '@/utils/formatters'
import type { AuditLog } from '@/types'

const PAGE_SIZE = 20

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 400)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getAuditLogs({ page })
      setLogs(res.results); setTotal(res.count)
    } catch { setLogs([]) } finally { setLoading(false) }
  }, [page])

  useEffect(() => { fetch() }, [fetch])

  const filtered = debouncedSearch
    ? logs.filter((l) =>
        l.action?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        l.user?.username?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        l.object_type?.toLowerCase().includes(debouncedSearch.toLowerCase())
      )
    : logs

  const columns = [
    { key: 'user', header: 'User', render: (r: AuditLog) => <span className="font-medium text-sm">{r.user?.username ?? 'System'}</span> },
    { key: 'action', header: 'Action', render: (r: AuditLog) => <span className="text-sm font-mono text-blue">{r.action}</span> },
    { key: 'object_type', header: 'Object', render: (r: AuditLog) => <span className="text-sm">{r.object_type}</span> },
    { key: 'description', header: 'Description', render: (r: AuditLog) => <span className="text-sm text-muted line-clamp-1">{r.description}</span> },
    { key: 'ip_address', header: 'IP', render: (r: AuditLog) => <span className="text-xs font-mono text-muted">{r.ip_address || '—'}</span> },
    { key: 'timestamp', header: 'Time', render: (r: AuditLog) => <span className="text-xs text-muted">{formatDateTime(r.timestamp)}</span> },
  ]

  return (
    <OrganizationLayout pageTitle="Audit Log">
      <PageHeader
        title="Audit Log"
        subtitle="Complete trail of all system actions"
        breadcrumbs={[{ label: 'Audit Log' }]}
        actions={
          <Button variant="secondary" leftIcon={<Download className="w-4 h-4" />}>Export CSV</Button>
        }
      />

      <div className="card p-4 mb-4">
        <Input placeholder="Filter by user, action, object…" leftIcon={<Search className="w-4 h-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="card overflow-hidden">
        <Table columns={columns as any} data={filtered as any[]} isLoading={loading} emptyMessage="No audit logs found." keyField="id" />
        <div className="px-4 border-t border-border dark:border-primary-700">
          <Pagination currentPage={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage} />
        </div>
      </div>
    </OrganizationLayout>
  )
}
