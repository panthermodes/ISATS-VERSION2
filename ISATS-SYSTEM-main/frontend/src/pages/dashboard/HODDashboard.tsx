import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Building2, Laptop, Users, CheckCircle2, Clock, AlertTriangle,
  ArrowUpRight, ShieldCheck, FileText, Check, X
} from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

export default function HODDashboard() {
  const { user } = useAuth()
  const deptName = user?.department?.name || 'ICT & Infrastructure'

  const [deptStats, setDeptStats] = useState({
    totalDeptAssets: 5,
    activeStaffCount: 13,
    pendingRequisitions: 2,
    policyComplianceRate: '100%',
  })
  const [requests, setRequests] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const fetchRequests = () => {
    fetch('/api/requests/')
      .then(res => res.json())
      .then(data => {
        const list = data.data || data.results || (Array.isArray(data) ? data : [])
        if (list.length > 0) {
          setRequests(list)
          setDeptStats(prev => ({ ...prev, pendingRequisitions: list.filter((r: any) => r.status === 'Pending').length }))
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchRequests()
    fetch('/api/dashboard/')
      .then(res => res.json())
      .then(data => {
        const d = data.data || data
        if (d) {
          setDeptStats(prev => ({
            ...prev,
            totalDeptAssets: d.total_assets ?? prev.totalDeptAssets,
            activeStaffCount: d.active_users ?? prev.activeStaffCount,
          }))
        }
      })
      .catch(() => {})
  }, [])

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    setLoading(true)
    try {
      await fetch(`/api/requests/${id}/${action}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: `HOD review: ${action}d` })
      })
      fetchRequests()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <OrganizationLayout pageTitle="Head of Department Workspace">
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-teal-950/70 via-[#0B1F1A] to-blue-950/70 border border-teal-800/40 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-teal-600/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <Building2 className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white tracking-tight">Head of Department Workspace</h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40 uppercase">
                  HOD — {deptName}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Department Executive: <strong>{user?.first_name ? `${user.first_name} ${user.last_name}` : (user?.username || 'Shebby Panther')}</strong>. Authorize employee hardware requisitions and monitor departmental asset compliance.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/assets">
              <Button size="sm" className="text-xs gap-1.5 bg-teal-600 hover:bg-teal-500 text-white">
                <Laptop className="w-4 h-4" /> View Dept Assets
              </Button>
            </Link>
            <Link to="/reports">
              <Button variant="outline" size="sm" className="text-xs gap-1.5 border-slate-600 text-slate-200 hover:bg-white/10">
                Asset Utilization
              </Button>
            </Link>
          </div>
        </div>

        {/* HOD KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <Card className="p-5 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] space-y-2">
            <div className="flex items-center justify-between text-[#7D8A82] dark:text-[#8E9D94]">
              <span className="text-xs font-semibold uppercase tracking-wider">Dept Hardware</span>
              <Laptop className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            </div>
            <div className="text-2xl font-black text-[#17211D] dark:text-[#F3F7F5]">{deptStats.totalDeptAssets}</div>
            <span className="text-[11px] text-[#7D8A82] dark:text-[#8E9D94]">Assigned equipment</span>
          </Card>

          <Card className="p-5 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] space-y-2">
            <div className="flex items-center justify-between text-[#7D8A82] dark:text-[#8E9D94]">
              <span className="text-xs font-semibold uppercase tracking-wider">Department Staff</span>
              <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-2xl font-black text-[#17211D] dark:text-[#F3F7F5]">{deptStats.activeStaffCount}</div>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">● Active employee accounts</span>
          </Card>

          <Card className="p-5 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] space-y-2">
            <div className="flex items-center justify-between text-[#7D8A82] dark:text-[#8E9D94]">
              <span className="text-xs font-semibold uppercase tracking-wider">Pending Requisitions</span>
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="text-2xl font-black text-amber-600 dark:text-amber-400">{deptStats.pendingRequisitions}</div>
            <span className="text-[11px] text-[#7D8A82] dark:text-[#8E9D94]">Requires HOD authorization</span>
          </Card>

          <Card className="p-5 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] space-y-2">
            <div className="flex items-center justify-between text-[#7D8A82] dark:text-[#8E9D94]">
              <span className="text-xs font-semibold uppercase tracking-wider">Policy Compliance</span>
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{deptStats.policyComplianceRate}</div>
            <span className="text-[11px] text-[#7D8A82] dark:text-[#8E9D94]">Signed IT asset agreements</span>
          </Card>
        </div>

        {/* Staff Requisition Approval Queue */}
        <Card className="p-6 bg-[#FBFAF6] dark:bg-[#0B1F1A] border-[#E5E1D8] dark:border-[#1D3A31] space-y-4">
          <div className="flex items-center justify-between border-b border-[#E5E1D8] dark:border-[#1D3A31] pb-4">
            <div>
              <h3 className="text-sm font-bold text-[#17211D] dark:text-[#F3F7F5]">Staff Hardware Requisition Requests</h3>
              <p className="text-xs text-[#7D8A82] dark:text-[#8E9D94]">Approve or reject equipment requests submitted by members of {deptName}.</p>
            </div>
          </div>

          <div className="divide-y divide-[#E5E1D8] dark:divide-[#1D3A31]">
            {(requests.length > 0 ? requests : [
              {
                id: 1,
                user: { username: 'Shebby Panther' },
                request_type: 'Laptop & Dual Monitor Setup',
                reason: 'Required for departmental financial modeling and infrastructure dashboard oversight',
                status: 'Pending',
                created_at: '2026-09-15'
              },
              {
                id: 2,
                user: { username: 'ICT Officer' },
                request_type: 'High-Capacity Document Scanner (ADF)',
                reason: 'Vendor invoice digitisation and archive management',
                status: 'Pending',
                created_at: '2026-09-15'
              }
            ]).map((req: any) => (
              <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-[#17211D] dark:text-[#F3F7F5]">
                      {req.user?.first_name ? `${req.user.first_name} ${req.user.last_name}` : (req.user?.username || 'Shebby Panther')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      req.status === 'Approved'
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                        : req.status === 'Rejected'
                        ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                    }`}>
                      {req.status}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-teal-600 dark:text-teal-400">{req.request_type || req.item}</div>
                  <div className="text-[11px] text-[#7D8A82] dark:text-[#8E9D94]">Justification: {req.reason}</div>
                </div>

                {req.status === 'Pending' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      disabled={loading}
                      onClick={() => handleAction(req.id, 'approve')}
                      className="text-xs gap-1 bg-teal-600 hover:bg-teal-500 text-white"
                    >
                      <Check className="w-3.5 h-3.5" /> Approve Request
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={loading}
                      onClick={() => handleAction(req.id, 'reject')}
                      className="text-xs gap-1 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-900 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>
    </OrganizationLayout>
  )
}
