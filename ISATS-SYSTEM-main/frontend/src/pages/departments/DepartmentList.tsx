import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Users } from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/context/ToastContext'
import { getDepartments, createDepartment, updateDepartment, deleteDepartment } from '@/services/departments'
import type { Department } from '@/types'

export default function DepartmentList() {
  const toast = useToast()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<Department | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Department | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const fetch = async () => {
    setLoading(true)
    getDepartments().then(setDepartments).catch(() => {}).finally(() => setLoading(false))
  }
  useEffect(() => { fetch() }, [])

  const openAdd = () => { setEditTarget(null); setName(''); setDescription(''); setModalOpen(true) }
  const openEdit = (d: Department) => { setEditTarget(d); setName(d.name); setDescription(d.description); setModalOpen(true) }

  const handleSave = async () => {
    if (!name.trim()) return
    setSaving(true)
    try {
      if (editTarget) {
        await updateDepartment(editTarget.id, { name, description })
        toast.success('Department updated')
      } else {
        await createDepartment({ name, description })
        toast.success('Department created')
      }
      setModalOpen(false); fetch()
    } catch { toast.error('Failed to save department') } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteDepartment(deleteTarget.id)
      toast.success('Department deleted')
      setDeleteTarget(null); fetch()
    } catch { toast.error('Failed to delete department') } finally { setDeleting(false) }
  }

  return (
    <OrganizationLayout pageTitle="Departments">
      <PageHeader
        title="Departments"
        subtitle="Manage organizational departments"
        breadcrumbs={[{ label: 'Departments' }]}
        actions={<Button variant="primary" leftIcon={<Plus className="w-4 h-4" />} onClick={openAdd}>Add Department</Button>}
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <div key={i} className="card p-5"><Skeleton variant="rect" height="80px" /></div>)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {departments.map((dept) => (
            <Card key={dept.id} hover>
              <div className="flex items-start justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-blue/10">
                  <Users className="w-5 h-5 text-blue" />
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(dept)} className="p-1.5 rounded hover:bg-slate-100 dark:hover:bg-primary-700 text-muted transition-colors"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => setDeleteTarget(dept)} className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-500/10 text-muted hover:text-danger transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <h3 className="font-semibold text-primary-900 dark:text-slate-100 mb-1">{dept.name}</h3>
              <p className="text-xs text-muted line-clamp-2">{dept.description || 'No description.'}</p>
            </Card>
          ))}
          {departments.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted text-sm">No departments yet.</div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editTarget ? 'Edit Department' : 'Add Department'}
        footer={<><Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button><Button variant="primary" loading={saving} onClick={handleSave}>{editTarget ? 'Update' : 'Create'}</Button></>}
      >
        <div className="space-y-4">
          <Input label="Department Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. IT Department" />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-primary-900 dark:text-slate-200">Description</label>
            <textarea className="input-field min-h-[80px] resize-none" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional description…" />
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog isOpen={!!deleteTarget} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)}
        title="Delete Department" message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete" isLoading={deleting}
      />
    </OrganizationLayout>
  )
}
