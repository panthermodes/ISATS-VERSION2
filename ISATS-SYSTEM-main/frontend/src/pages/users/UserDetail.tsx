import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, Building2, Shield } from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/context/ToastContext'
import { useAuth } from '@/context/AuthContext'
import { getUser, promoteUser, demoteUser } from '@/services/users'
import { getRoleBadgeVariant, formatDate } from '@/utils/formatters'
import type { User, UserRole } from '@/types'

const ROLE_ORDER: UserRole[] = ['User', 'ICT Officer', 'Manager', 'Admin', 'SuperAdmin']

export default function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user: currentUser } = useAuth()
  const toast = useToast()
  const [profile, setProfile] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [acting, setActing] = useState(false)

  useEffect(() => {
    if (!id) return
    getUser(Number(id)).then(setProfile).catch(() => toast.error('User not found')).finally(() => setLoading(false))
  }, [id])

  const canManage = currentUser && ['Admin', 'SuperAdmin'].includes(currentUser.role)

  const handlePromote = async () => {
    if (!profile) return
    const idx = ROLE_ORDER.indexOf(profile.role)
    if (idx >= ROLE_ORDER.length - 1) return
    const newRole = ROLE_ORDER[idx + 1]
    setActing(true)
    try {
      const updated = await promoteUser(profile.id, newRole)
      setProfile(updated); toast.success(`Promoted to ${newRole}`)
    } catch { toast.error('Failed to promote user') } finally { setActing(false) }
  }

  const handleDemote = async () => {
    if (!profile) return
    const idx = ROLE_ORDER.indexOf(profile.role)
    if (idx <= 0) return
    setActing(true)
    try {
      const updated = await demoteUser(profile.id)
      setProfile(updated); toast.success('User demoted')
    } catch { toast.error('Failed to demote user') } finally { setActing(false) }
  }

  if (loading) return <OrganizationLayout pageTitle="User"><div className="space-y-4"><Skeleton variant="rect" height="150px" /><Skeleton variant="rect" height="200px" /></div></OrganizationLayout>
  if (!profile) return <OrganizationLayout pageTitle="Not Found"><p className="text-muted">User not found.</p></OrganizationLayout>

  const initials = (`${profile.first_name[0] ?? ''}${profile.last_name[0] ?? ''}`).toUpperCase() || profile.username[0].toUpperCase()

  return (
    <OrganizationLayout pageTitle={`${profile.first_name} ${profile.last_name}`}>
      <PageHeader
        title="User Profile"
        breadcrumbs={[{ label: 'Users', href: '/users' }, { label: profile.username }]}
        actions={<Button variant="secondary" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>Back</Button>}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile card */}
        <Card className="flex flex-col items-center text-center p-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue to-cyan flex items-center justify-center text-3xl font-bold text-white mb-4">
            {initials}
          </div>
          <h2 className="text-xl font-bold text-primary-900 dark:text-slate-100">{profile.first_name} {profile.last_name}</h2>
          <p className="text-sm text-muted mb-3">@{profile.username}</p>
          <Badge variant={getRoleBadgeVariant(profile.role)} size="md">{profile.role}</Badge>

          {canManage && (
            <div className="flex gap-2 mt-6 w-full">
              <Button variant="success" size="sm" className="flex-1" loading={acting} onClick={handlePromote} disabled={profile.role === 'SuperAdmin'}>Promote</Button>
              <Button variant="danger" size="sm" className="flex-1" loading={acting} onClick={handleDemote} disabled={profile.role === 'User'}>Demote</Button>
            </div>
          )}
        </Card>

        {/* Details */}
        <div className="lg:col-span-2 space-y-5">
          <Card title="Contact Information">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
              {[
                { icon: <Mail className="w-4 h-4" />, label: 'Email', value: profile.email || '—' },
                { icon: <Phone className="w-4 h-4" />, label: 'Phone', value: profile.phone_number || '—' },
                { icon: <Building2 className="w-4 h-4" />, label: 'Department', value: profile.department?.name || '—' },
                { icon: <Shield className="w-4 h-4" />, label: 'Staff', value: profile.is_staff ? 'Yes' : 'No' },
              ].map(({ icon, label, value }) => (
                <div key={label} className="flex items-start gap-3">
                  <span className="text-muted mt-0.5">{icon}</span>
                  <div>
                    <dt className="text-xs text-muted">{label}</dt>
                    <dd className="text-sm font-medium text-primary-900 dark:text-slate-100">{value}</dd>
                  </div>
                </div>
              ))}
            </dl>
          </Card>
        </div>
      </div>
    </OrganizationLayout>
  )
}
