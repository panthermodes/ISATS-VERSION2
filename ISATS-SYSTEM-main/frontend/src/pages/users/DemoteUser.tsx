import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowDownCircle, AlertTriangle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'

export default function DemoteUser() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [userData, setUserData] = useState<any>(null)
  const [newRole, setNewRole] = useState('User')
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (id) {
      fetch(`/api/users/${id}/`)
        .then(res => res.json())
        .then(data => {
          if (data && !data.detail) setUserData(data)
        })
        .catch(() => {})
    }
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await fetch(`/api/users/${id}/demote/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_role: newRole, reason })
      })
      alert(`User role reallocated to ${newRole} with security audit log recorded.`)
      navigate(`/users/${id}`)
    } catch (err) {
      console.error(err)
      navigate(`/users/${id}`)
    } finally {
      setLoading(false)
    }
  }

  const displayName = userData ? `${userData.first_name} ${userData.last_name} (@${userData.username}) — Current Role: ${userData.role}` : 'Shebby Panther (@shebby) — Current Role: ICT Officer'

  return (
    <OrganizationLayout pageTitle="Demote / Reassign Employee Role">
      <div className="max-w-2xl mx-auto space-y-6 text-[#17211D] dark:text-slate-100">
        <div className="flex items-center gap-3">
          <Link to={id ? `/users/${id}` : '/users'}>
            <Button variant="outline" size="sm" className="text-xs gap-1 border-[#E5E1D8] dark:border-slate-700">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to User Profile
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[#17211D] dark:text-white tracking-tight">Demote User Role</h2>
            <p className="text-xs text-[#7D8A82] dark:text-slate-400 mt-0.5">Revoke elevated permissions with formal justification.</p>
          </div>
        </div>

        <Card className="p-6 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Employee Details"
              value={displayName}
              disabled
              className="bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400"
            />
            <Select
              label="Select New Role *"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              options={[
                { value: 'User', label: 'Staff / User (Standard employee access)' },
                { value: 'Technician', label: 'Technician (Field Diagnostics only)' },
              ]}
            />
            <Input
              label="Reason for Role Reduction *"
              placeholder="e.g. Departmental reorganization / Role duty realignment"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E5E1D8] dark:border-slate-800">
              <Link to={id ? `/users/${id}` : '/users'}>
                <Button variant="outline" size="sm" className="text-xs border-[#E5E1D8] dark:border-slate-700">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="text-xs gap-1.5 bg-rose-600 hover:bg-rose-500 text-white"
              >
                <ArrowDownCircle className="w-4 h-4" /> Confirm Role Demotion
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </OrganizationLayout>
  )
}
