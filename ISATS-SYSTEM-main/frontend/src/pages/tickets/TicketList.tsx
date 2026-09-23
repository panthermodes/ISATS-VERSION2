import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Filter } from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Pagination } from '@/components/ui/Pagination'
import { getTickets } from '@/services/tickets'
import { useDebounce } from '@/hooks/useDebounce'
import { formatRelativeTime, getStatusBadgeVariant, getPriorityBadgeVariant } from '@/utils/formatters'
import type { Ticket } from '@/types'

const PAGE_SIZE = 20

const statusOpts = [
  { value: '', label: 'All Statuses' },
  { value: 'Open', label: 'Open' },
  { value: 'In Progress', label: 'In Progress' },
  { value: 'Resolved', label: 'Resolved' },
  { value: 'Closed', label: 'Closed' },
]

const priorityOpts = [
  { value: '', label: 'All Priorities' },
  { value: 'Low', label: 'Low' },
  { value: 'Medium', label: 'Medium' },
  { value: 'High', label: 'High' },
  { value: 'Critical', label: 'Critical' },
]

export default function TicketList() {
  const navigate = useNavigate()
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const debouncedSearch = useDebounce(search, 400)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getTickets({ search: debouncedSearch, status: status || undefined, priority: priority || undefined, page })
      setTickets(res.results)
      setTotal(res.count)
    } catch { setTickets([]) } finally { setLoading(false) }
  }, [debouncedSearch, status, priority, page])

  useEffect(() => { fetch() }, [fetch])
  useEffect(() => { setPage(1) }, [debouncedSearch, status, priority])

  const columns = [
    { key: 'id', header: '#', width: '60px', render: (r: Ticket) => <span className="text-muted text-xs">#{r.id}</span> },
    { key: 'title', header: 'Title', render: (r: Ticket) => <span className="font-medium text-primary-900 dark:text-slate-100">{r.title}</span> },
    { key: 'status', header: 'Status', render: (r: Ticket) => <Badge variant={getStatusBadgeVariant(r.status)} dot>{r.status}</Badge> },
    { key: 'priority', header: 'Priority', render: (r: Ticket) => <Badge variant={getPriorityBadgeVariant(r.priority)}>{r.priority}</Badge> },
    { key: 'submitted_by', header: 'Submitted By', render: (r: Ticket) => <span className="text-sm">{r.submitted_by?.username}</span> },
    { key: 'assigned_to', header: 'Assigned To', render: (r: Ticket) => r.assigned_to ? <span className="text-sm">{r.assigned_to.username}</span> : <span className="text-xs text-muted">Unassigned</span> },
    { key: 'created_at', header: 'Created', render: (r: Ticket) => <span className="text-xs text-muted">{formatRelativeTime(r.created_at)}</span> },
  ]

  return (
    <OrganizationLayout pageTitle="Tickets">
      <PageHeader
        title="Tickets"
        subtitle="Track and manage all support requests"
        breadcrumbs={[{ label: 'Tickets' }]}
        actions={
          <Link to="/tickets/create">
            <Button variant="primary" leftIcon={<Plus className="w-4 h-4" />}>New Ticket</Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input placeholder="Search tickets…" leftIcon={<Search className="w-4 h-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select options={statusOpts} value={status} onChange={(e) => setStatus(e.target.value)} containerClassName="w-40" />
        <Select options={priorityOpts} value={priority} onChange={(e) => setPriority(e.target.value)} containerClassName="w-40" />
        <Button variant="ghost" leftIcon={<Filter className="w-4 h-4" />} onClick={fetch}>Refresh</Button>
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns as any}
          data={tickets as any[]}
          isLoading={loading}
          emptyMessage="No tickets found."
          onRowClick={(row: any) => navigate(`/tickets/${row.id}`)}
          keyField="id"
        />
        <div className="px-4 border-t border-border dark:border-primary-700">
          <Pagination currentPage={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage} />
        </div>
      </div>
    </OrganizationLayout>
  )
}
