import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldAlert, ArrowUpCircle, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'

export default function PromoteUser() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [userData, setUserData] = useState<any>(null)
  const [newRole, setNewRole] = useState('ICT Officer')
  const [reason, setReason] = useState('Annual performance evaluation and elevated technical responsibilities')
  const [confirmAdmin, setConfirmAdmin] = useState(false)
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
      await fetch(`/api/users/${id}/promote/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_role: newRole, reason })
      })
      alert(`User successfully promoted to ${newRole} with security audit log recorded.`)
      navigate(`/users/${id}`)
    } catch (err) {
      console.error(err)
      navigate(`/users/${id}`)
    } finally {
      setLoading(false)
    }
  }

  const isElevated = newRole === 'Admin' || newRole === 'SuperAdmin'
  const displayName = userData ? `${userData.first_name} ${userData.last_name} (@${userData.username}) — Current Role: ${userData.role}` : 'Shebby Panther (@shebby) — Current Role: User'

  return (
    <OrganizationLayout pageTitle="Promote Employee Role & Permissions">
      <div className="max-w-2xl mx-auto space-y-6 text-[#17211D] dark:text-slate-100">
        <div className="flex items-center gap-3">
          <Link to={id ? `/users/${id}` : '/users'}>
            <Button variant="outline" size="sm" className="text-xs gap-1 border-[#E5E1D8] dark:border-slate-700">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to User Profile
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-[#17211D] dark:text-white tracking-tight">Promote User Role</h2>
            <p className="text-xs text-[#7D8A82] dark:text-slate-400 mt-0.5">Hierarchical role promotion with security audit trail.</p>
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
              label="Select Elevated Role Assignment *"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              options={[
                { value: 'Technician', label: 'Technician (Field Diagnostics & Bench Repairs)' },
                { value: 'ICT Officer', label: 'ICT Officer (Ticket Triage & Hardware Ledger)' },
                { value: 'Supervisor', label: 'Supervisor (Team Workload & SLA Oversight)' },
                { value: 'HOD', label: 'Head of Department (Requisition Approvals)' },
                { value: 'Manager', label: 'Manager (Procurement & Analytics)' },
                { value: 'Admin', label: 'Organization Admin (Full Tenant Administration)' },
              ]}
            />
            <Input
              label="Promotion Justification / Authorization Note *"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />

            {isElevated && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-500/40 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-700 dark:text-amber-400">
                  <ShieldAlert className="w-4 h-4" /> Security Notice: Elevated Administrative Role
                </div>
                <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  Promoting a user to <strong>{newRole}</strong> grants broad operational and user governance permissions.
                </p>
                <label className="flex items-center gap-2 pt-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmAdmin}
                    onChange={(e) => setConfirmAdmin(e.target.checked)}
                    required
                    className="rounded bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-amber-500"
                  />
                  <span className="text-amber-800 dark:text-amber-200 font-semibold">
                    I acknowledge and authorize these security permissions
                  </span>
                </label>
              </div>
            )}

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
                className="text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                <ArrowUpCircle className="w-4 h-4" /> Confirm Promotion
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </OrganizationLayout>
  )
}
