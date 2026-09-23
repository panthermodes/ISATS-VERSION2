import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, User, Clock, Tag, AlertCircle } from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { getTicket, updateTicket, closeTicket } from '@/services/tickets'
import { formatDateTime, getStatusBadgeVariant, getPriorityBadgeVariant, getRoleBadgeVariant } from '@/utils/formatters'
import type { Ticket } from '@/types'

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const toast = useToast()
  const [ticket, setTicket] = useState<Ticket | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!id) return
    getTicket(Number(id)).then(setTicket).catch(() => toast.error('Ticket not found')).finally(() => setLoading(false))
  }, [id])

  const handleStatusChange = async (status: string) => {
    if (!ticket) return
    setUpdating(true)
    try {
      const updated = await updateTicket(ticket.id, { status: status as any })
      setTicket(updated)
      toast.success(`Ticket marked as ${status}`)
    } catch { toast.error('Failed to update status') } finally { setUpdating(false) }
  }

  const handleClose = async () => {
    if (!ticket) return
    setUpdating(true)
    try {
      const updated = await closeTicket(ticket.id)
      setTicket(updated)
      toast.success('Ticket closed')
    } catch { toast.error('Failed to close ticket') } finally { setUpdating(false) }
  }

  const canUpdateStatus = user && ['ICT Officer', 'Manager', 'Admin', 'SuperAdmin'].includes(user.role)
  const canClose       = user && ['Manager', 'Admin', 'SuperAdmin'].includes(user.role)

  if (loading) {
    return (
      <OrganizationLayout pageTitle="Ticket Detail">
        <div className="space-y-4"><Skeleton variant="rect" height="120px" /><Skeleton variant="rect" height="200px" /></div>
      </OrganizationLayout>
    )
  }

  if (!ticket) {
    return (
      <OrganizationLayout pageTitle="Ticket Not Found">
        <div className="text-center py-20"><p className="text-muted">Ticket not found.</p><Button variant="secondary" onClick={() => navigate(-1)} className="mt-4">Go Back</Button></div>
      </OrganizationLayout>
    )
  }

  return (
    <OrganizationLayout pageTitle={`Ticket #${ticket.id}`}>
      <PageHeader
        title={`Ticket #${ticket.id}`}
        breadcrumbs={[{ label: 'Tickets', href: '/tickets' }, { label: `#${ticket.id}` }]}
        actions={
          <Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>Back</Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main info */}
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <div className="flex items-start justify-between gap-4 mb-4">
              <h2 className="text-lg font-bold text-primary-900 dark:text-slate-100">{ticket.title}</h2>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge variant={getPriorityBadgeVariant(ticket.priority)}>{ticket.priority}</Badge>
                <Badge variant={getStatusBadgeVariant(ticket.status)} dot>{ticket.status}</Badge>
              </div>
            </div>
            <p className="text-sm text-primary-900 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">{ticket.description}</p>
          </Card>

          {/* Action panel */}
          {(canUpdateStatus || canClose) && ticket.status !== 'Closed' && (
            <Card title="Actions">
              <div className="flex flex-wrap gap-2">
                {canUpdateStatus && ticket.status === 'Open' && (
                  <Button variant="primary" size="sm" loading={updating} onClick={() => handleStatusChange('In Progress')}>Mark In Progress</Button>
                )}
                {canUpdateStatus && ticket.status === 'In Progress' && (
                  <Button variant="success" size="sm" loading={updating} onClick={() => handleStatusChange('Resolved')}>Mark Resolved</Button>
                )}
                {canClose && (
                  <Button variant="danger" size="sm" loading={updating} onClick={handleClose}>Close Ticket</Button>
                )}
              </div>
            </Card>
          )}
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <Card title="Details">
            <dl className="space-y-3 text-sm">
              {[
                { label: 'Submitted By', value: <span>{ticket.submitted_by?.first_name} {ticket.submitted_by?.last_name} <span className="text-xs text-muted">(@{ticket.submitted_by?.username})</span></span>, icon: <User className="w-3.5 h-3.5" /> },
                { label: 'Assigned To', value: ticket.assigned_to ? `${ticket.assigned_to.first_name} ${ticket.assigned_to.last_name}` : <span className="text-muted italic">Unassigned</span>, icon: <User className="w-3.5 h-3.5" /> },
                { label: 'Category', value: ticket.category?.name ?? '—', icon: <Tag className="w-3.5 h-3.5" /> },
                { label: 'Created', value: formatDateTime(ticket.created_at), icon: <Clock className="w-3.5 h-3.5" /> },
                { label: 'Updated', value: formatDateTime(ticket.updated_at), icon: <Clock className="w-3.5 h-3.5" /> },
                ...(ticket.resolved_at ? [{ label: 'Resolved', value: formatDateTime(ticket.resolved_at), icon: <Clock className="w-3.5 h-3.5" /> }] : []),
              ].map(({ label, value, icon }) => (
                <div key={label} className="flex items-start gap-2">
                  <span className="text-muted mt-0.5 flex-shrink-0">{icon}</span>
                  <div>
                    <dt className="text-xs text-muted">{label}</dt>
                    <dd className="text-primary-900 dark:text-slate-100 font-medium">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Card>

          {ticket.asset && (
            <Card title="Related Asset">
              <Link to={`/assets/${ticket.asset.asset_id}`} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-primary-700/50 transition-colors">
                <AlertCircle className="w-4 h-4 text-blue flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-primary-900 dark:text-slate-100">{ticket.asset.asset_name}</p>
                  <p className="text-xs text-muted">{ticket.asset.asset_tag}</p>
                </div>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </OrganizationLayout>
  )
}
