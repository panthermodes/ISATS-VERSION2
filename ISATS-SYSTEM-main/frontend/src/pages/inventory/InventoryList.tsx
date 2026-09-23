import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import clsx from 'clsx'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Table } from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { useToast } from '@/context/ToastContext'
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from '@/services/inventory'
import type { InventoryItem } from '@/types'

function stockStatus(item: InventoryItem): { label: string; variant: 'success' | 'warning' | 'danger' } {
  if (item.quantity <= 0)                      return { label: 'Critical', variant: 'danger' }
  if (item.quantity <= item.reorder_level)     return { label: 'Low',      variant: 'warning' }
  return { label: 'OK', variant: 'success' }
}

const empty = { name: '', quantity: '0', reorder_level: '0', description: '' }

export default function InventoryList() {
  const toast = useToast()
  const [items, setItems] = useState<InventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<InventoryItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<InventoryItem | null>(null)
  const [form, setForm] = useState(empty)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetch = () => { setLoading(true); getInventory().then(setItems).catch(() => {}).finally(() => setLoading(false)) }
  useEffect(() => { fetch() }, [])

  const openAdd  = () => { setEditTarget(null); setForm(empty); setModalOpen(true) }
  const openEdit = (item: InventoryItem) => { setEditTarget(item); setForm({ name: item.name, quantity: String(item.quantity), reorder_level: String(item.reorder_level), description: item.description }); setModalOpen(true) }

  const handleSave = async () => {
    if (!form.name.trim()) return
    setSaving(true)
    const data = { name: form.name, quantity: Number(form.quantity), reorder_level: Number(form.reorder_level), description: form.description }
    try {
      if (editTarget) { await updateInventoryItem(editTarget.id, data); toast.success('Item updated') }
      else            { await createInventoryItem(data);                toast.success('Item added') }
      setModalOpen(false); fetch()
    } catch { toast.error('Failed to save item') } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try { await deleteInventoryItem(deleteTarget.id); toast.success('Item deleted'); setDeleteTarget(null); fetch() }
    catch { toast.error('Failed to delete item') } finally { setDeleting(false) }
  }

  const columns = [
    { key: 'name', header: 'Item Name', render: (r: InventoryItem) => <span className="font-medium text-primary-900 dark:text-slate-100">{r.name}</span> },
    { key: 'quantity', header: 'Quantity', render: (r: InventoryItem) => (
        <span className={clsx('font-bold text-lg', r.quantity <= 0 ? 'text-danger' : r.quantity <= r.reorder_level ? 'text-warning' : 'text-success')}>
          {r.quantity}
        </span>
      )
    },
    { key: 'reorder_level', header: 'Reorder At', render: (r: InventoryItem) => <span className="text-sm text-muted">{r.reorder_level}</span> },
    { key: 'status', header: 'Status', render: (r: InventoryItem) => { const s = stockStatus(r); return <Badge variant={s.variant} dot>{s.label}</Badge> } },
    { key: 'description', header: 'Description', render: (r: InventoryItem) => <span className="text-sm text-muted line-clamp-1">{r.description || '—'}</span> },
    { key: 'actions', header: '', render: (r: InventoryItem) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button onClick={() => openEdit(r)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-primary-700 text-muted"><Pencil className="w-4 h-4" /></button>
          <button onClick={() => setDeleteTarget(r)} className="p-1.5 rounded hover:bg-red-50 text-muted hover:text-danger"><Trash2 className="w-4 h-4" /></button>
        </div>
      )
    },
  ]

  return (
    <OrganizationLayout pageTitle="Inventory">
      <PageHeader
        title="Inventory Management"
        subtitle="Track stock levels and reorder thresholds"
        breadcrumbs={[{ label: 'Inventory' }]}
        actions={<Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={openAdd}>Add Item</Button>}
      />

      <div className="card overflow-hidden">
        <Table columns={columns as any} data={items as any[]} isLoading={loading} emptyMessage="No inventory items." keyField="id" />
      </div>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editTarget ? 'Edit Item' : 'Add Item'}
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button variant="primary" loading={saving} onClick={handleSave}>{editTarget ? 'Update' : 'Add'}</Button></>}
      >
        <div className="space-y-4">
          <Input label="Item Name" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Quantity" type="number" min="0" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} />
            <Input label="Reorder Level" type="number" min="0" value={form.reorder_level} onChange={(e) => setForm({ ...form, reorder_level: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-primary-900 dark:text-slate-200">Description</label>
            <textarea className="input-field min-h-[70px] resize-none" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
        </div>
      </Modal>

      <ConfirmDialog isOpen={!!deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
        title="Delete Inventory Item" message={`Remove "${deleteTarget?.name}" from inventory?`} confirmLabel="Delete" isLoading={deleting}
      />
    </OrganizationLayout>
  )
}
