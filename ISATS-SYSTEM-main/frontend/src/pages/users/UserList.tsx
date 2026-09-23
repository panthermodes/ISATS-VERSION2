import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Eye } from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Pagination } from '@/components/ui/Pagination'
import { getUsers } from '@/services/users'
import { useDebounce } from '@/hooks/useDebounce'
import { getRoleBadgeVariant, formatRelativeTime } from '@/utils/formatters'
import type { User } from '@/types'

const PAGE_SIZE = 20

export default function UserList() {
  const navigate = useNavigate()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [role, setRole] = useState('')
  const debouncedSearch = useDebounce(search, 400)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getUsers({ search: debouncedSearch, role: role || undefined, page })
      setUsers(res.results); setTotal(res.count)
    } catch { setUsers([]) } finally { setLoading(false) }
  }, [debouncedSearch, role, page])

  useEffect(() => { fetch() }, [fetch])
  useEffect(() => { setPage(1) }, [debouncedSearch, role])

  const columns = [
    { key: 'name', header: 'Name', render: (r: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue/10 flex items-center justify-center text-blue text-xs font-bold flex-shrink-0">
            {`${r.first_name[0] ?? ''}${r.last_name[0] ?? ''}`.toUpperCase() || r.username[0].toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-primary-900 dark:text-slate-100">{r.first_name} {r.last_name}</p>
            <p className="text-xs text-muted">@{r.username}</p>
          </div>
        </div>
      )
    },
    { key: 'email', header: 'Email', render: (r: User) => <span className="text-sm">{r.email}</span> },
    { key: 'role', header: 'Role', render: (r: User) => <Badge variant={getRoleBadgeVariant(r.role)}>{r.role}</Badge> },
    { key: 'department', header: 'Department', render: (r: User) => <span className="text-sm">{r.department?.name ?? '—'}</span> },
    { key: 'last_login', header: 'Last Login', render: (r: User) => <span className="text-xs text-muted">{r.last_login ? formatRelativeTime(r.last_login) : 'Never'}</span> },
    { key: 'actions', header: '', render: (r: User) => (
        <button onClick={(e) => { e.stopPropagation(); navigate(`/users/${r.id}`) }} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-primary-700 text-muted">
          <Eye className="w-4 h-4" />
        </button>
      )
    },
  ]

  return (
    <OrganizationLayout pageTitle="Users">
      <PageHeader
        title="User Management"
        subtitle={`${total} registered users`}
        breadcrumbs={[{ label: 'Users' }]}
      />

      <div className="card p-4 mb-4 flex flex-wrap gap-3">
        <div className="flex-1 min-w-[200px]">
          <Input placeholder="Search users…" leftIcon={<Search className="w-4 h-4" />} value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select
          options={[{ value: '', label: 'All Roles' }, { value: 'User', label: 'User' }, { value: 'ICT Officer', label: 'ICT Officer' }, { value: 'Manager', label: 'Manager' }, { value: 'Admin', label: 'Admin' }, { value: 'SuperAdmin', label: 'SuperAdmin' }]}
          value={role} onChange={(e) => setRole(e.target.value)} containerClassName="w-44"
        />
      </div>

      <div className="card overflow-hidden">
        <Table
          columns={columns as any} data={users as any[]} isLoading={loading}
          emptyMessage="No users found."
          onRowClick={(r: any) => navigate(`/users/${r.id}`)}
          keyField="id"
        />
        <div className="px-4 border-t border-border dark:border-primary-700">
          <Pagination currentPage={page} totalPages={Math.ceil(total / PAGE_SIZE)} onPageChange={setPage} />
        </div>
      </div>
    </OrganizationLayout>
  )
}
