import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Users, Shield, CheckCircle2, UserCheck } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'

export default function BulkPromote() {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState('ICT Officer')
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])

  const sampleUsers = [
    { id: 10, username: 'shebby', full_name: 'Shebby Panther', current_role: 'User', department: 'ICT Support' },
    { id: 11, username: 'asmith', full_name: 'Alice Smith', current_role: 'User', department: 'Operations' },
    { id: 12, username: 'bwayne', full_name: 'Bruce Wayne', current_role: 'Technician', department: 'ICT Support' },
  ]

  const toggleUser = (id: number) => {
    setSelectedUsers(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const handleBulkPromote = () => {
    if (selectedUsers.length === 0) {
      alert('Please select at least one user.')
      return
    }
    alert(`Successfully transitioned ${selectedUsers.length} user(s) to ${selectedRole} role.`)
    navigate('/users')
  }

  return (
    <OrganizationLayout pageTitle="Batch User Role Transition">
      <div className="max-w-4xl mx-auto space-y-6 text-[#17211D] dark:text-slate-100">
        <div className="flex items-center gap-3">
          <Link to="/users">
            <Button variant="outline" size="sm" className="text-xs gap-1 border-slate-700">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Users
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">Bulk Role Transition</h2>
            <p className="text-xs text-slate-400 mt-0.5">Promote or reassign permissions for multiple organization members simultaneously.</p>
          </div>
        </div>

        <Card className="p-6 bg-slate-900 border-slate-800 space-y-5">
          <div className="max-w-xs">
            <Select
              label="Target Role Assignment *"
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              options={[
                { value: 'Technician', label: 'Technician (Field Diagnostics & Bench Repairs)' },
                { value: 'ICT Officer', label: 'ICT Officer (Ticket Triage & Hardware Ledger)' },
                { value: 'Supervisor', label: 'Supervisor (Team Workload & SLA Monitors)' },
                { value: 'HOD', label: 'Head of Department (Requisition Approvals)' },
                { value: 'Manager', label: 'Manager (Procurement & SLA Analytics)' },
              ]}
            />
          </div>

          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === sampleUsers.length}
                      onChange={(e) => setSelectedUsers(e.target.checked ? sampleUsers.map(u => u.id) : [])}
                    />
                  </th>
                  <th className="p-3.5">Username / Name</th>
                  <th className="p-3.5">Department</th>
                  <th className="p-3.5">Current Role</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {sampleUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 text-center">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(u.id)}
                        onChange={() => toggleUser(u.id)}
                      />
                    </td>
                    <td className="p-3.5 font-semibold text-white">
                      {u.full_name} <span className="text-slate-500 font-normal">(@{u.username})</span>
                    </td>
                    <td className="p-3.5 text-slate-400">{u.department}</td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                        {u.current_role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-4 flex items-center justify-between border-t border-slate-800">
            <span className="text-xs text-slate-400">{selectedUsers.length} user(s) selected</span>
            <Button
              onClick={handleBulkPromote}
              disabled={selectedUsers.length === 0}
              size="sm"
              className="text-xs gap-1.5 bg-blue-600 hover:bg-blue-500 text-white"
            >
              <UserCheck className="w-4 h-4" /> Apply Role Transition
            </Button>
          </div>
        </Card>
      </div>
    </OrganizationLayout>
  )
}
