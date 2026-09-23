import { useState } from 'react'
import { Mail, Phone, Building2, Shield, Pencil, Lock } from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { useAuth } from '@/context/AuthContext'
import { useToast } from '@/context/ToastContext'
import { updateUser } from '@/services/users'
import { getRoleBadgeVariant } from '@/utils/formatters'

export default function Profile() {
  const { user, refreshUser } = useAuth()
  const toast = useToast()
  const [editOpen, setEditOpen] = useState(false)
  const [firstName, setFirstName] = useState(user?.first_name ?? '')
  const [lastName,  setLastName]  = useState(user?.last_name  ?? '')
  const [phone,     setPhone]     = useState(user?.phone_number ?? '')
  const [saving, setSaving] = useState(false)

  if (!user) return null

  const initials = (`${user.first_name[0] ?? ''}${user.last_name[0] ?? ''}`).toUpperCase() || user.username[0].toUpperCase()

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateUser(user.id, { first_name: firstName, last_name: lastName, phone_number: phone } as any)
      await refreshUser()
      toast.success('Profile updated!')
      setEditOpen(false)
    } catch { toast.error('Failed to update profile') } finally { setSaving(false) }
  }

  const info = [
    { icon: <Mail className="w-4 h-4" />,     label: 'Email',      value: user.email || '—' },
    { icon: <Phone className="w-4 h-4" />,    label: 'Phone',      value: user.phone_number || '—' },
    { icon: <Building2 className="w-4 h-4" />, label: 'Department', value: user.department?.name || '—' },
    { icon: <Shield className="w-4 h-4" />,   label: 'System Role', value: user.is_staff ? 'Staff' : 'Regular User' },
  ]

  return (
    <OrganizationLayout pageTitle="Profile">
      <PageHeader title="My Profile" breadcrumbs={[{ label: 'Profile' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar card */}
        <Card className="flex flex-col items-center text-center p-8">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue to-cyan flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-glow">
            {initials}
          </div>
          <h2 className="text-xl font-bold text-primary-900 dark:text-slate-100">{user.first_name} {user.last_name}</h2>
          <p className="text-sm text-muted mb-2">@{user.username}</p>
          <Badge variant={getRoleBadgeVariant(user.role)} size="md">{user.role}</Badge>

          <div className="flex flex-col gap-2 mt-6 w-full">
            <Button variant="primary" leftIcon={<Pencil className="w-4 h-4" />} onClick={() => setEditOpen(true)} className="w-full">
              Edit Profile
            </Button>
          </div>
        </Card>

        {/* Info panel */}
        <div className="lg:col-span-2">
          <Card title="Profile Information">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-3">
              {info.map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 dark:bg-primary-700 text-muted flex-shrink-0">{icon}</div>
                  <div>
                    <dt className="text-xs text-muted">{label}</dt>
                    <dd className="text-sm font-medium text-primary-900 dark:text-slate-100 mt-0.5">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>

      {/* Edit modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Profile"
        footer={<><Button variant="secondary" onClick={() => setEditOpen(false)}>Cancel</Button><Button variant="primary" loading={saving} onClick={handleSave}>Save Changes</Button></>}
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            <Input label="Last Name"  value={lastName}  onChange={(e) => setLastName(e.target.value)} />
          </div>
          <Input label="Phone Number" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+255…" />
        </div>
      </Modal>
    </OrganizationLayout>
  )
}
