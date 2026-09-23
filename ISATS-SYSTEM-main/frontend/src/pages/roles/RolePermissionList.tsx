import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Shield, Lock, Check, X, Edit2, Key } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { MainLayout } from '@/layouts/MainLayout'

export default function RolePermissionList() {
  const permissionsMatrix = [
    { module: 'Hardware Assets', capability: 'Register New Asset', user: false, tech: true, officer: true, super: true, hod: false, manager: true, admin: true },
    { module: 'Hardware Assets', capability: 'Scan QR & Barcodes', user: true, tech: true, officer: true, super: true, hod: true, manager: true, admin: true },
    { module: 'Hardware Assets', capability: 'Relocate / Move Asset', user: false, tech: true, officer: true, super: true, hod: false, manager: false, admin: true },
    { module: 'Ticketing', capability: 'Open Support Incident', user: true, tech: true, officer: true, super: true, hod: true, manager: true, admin: true },
    { module: 'Ticketing', capability: 'Assign Ticket to Tech', user: false, tech: false, officer: true, super: true, hod: false, manager: true, admin: true },
    { module: 'Ticketing', capability: 'Close Resolved Ticket', user: true, tech: true, officer: true, super: true, hod: false, manager: true, admin: true },
    { module: 'Requisitions', capability: 'Approve Hardware Request', user: false, tech: false, officer: false, super: false, hod: true, manager: true, admin: true },
    { module: 'User Management', capability: 'Promote / Demote Roles', user: false, tech: false, officer: false, super: false, hod: false, manager: false, admin: true },
    { module: 'Subscription', capability: 'Manage Invoices & Payments', user: false, tech: false, officer: false, super: false, hod: false, manager: false, admin: true },
  ]

  return (
    <MainLayout pageTitle="Organization Role Permission Matrix">
      <div className="space-y-6 max-w-6xl mx-auto text-slate-100">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">RBAC Permission Matrix</h2>
          <p className="text-xs text-slate-400 mt-0.5">Matrix of functional access capabilities enforced across all 8 organization roles.</p>
        </div>

        <Card className="bg-slate-900 border-slate-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Module</th>
                  <th className="p-3.5">Action Capability</th>
                  <th className="p-3.5 text-center">User</th>
                  <th className="p-3.5 text-center">Tech</th>
                  <th className="p-3.5 text-center">Officer</th>
                  <th className="p-3.5 text-center">Supervisor</th>
                  <th className="p-3.5 text-center">HOD</th>
                  <th className="p-3.5 text-center">Manager</th>
                  <th className="p-3.5 text-center">Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {permissionsMatrix.map((p, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3.5 font-semibold text-white">{p.module}</td>
                    <td className="p-3.5 text-slate-300">{p.capability}</td>
                    <td className="p-3.5 text-center">{p.user ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                    <td className="p-3.5 text-center">{p.tech ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                    <td className="p-3.5 text-center">{p.officer ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                    <td className="p-3.5 text-center">{p.super ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                    <td className="p-3.5 text-center">{p.hod ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                    <td className="p-3.5 text-center">{p.manager ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                    <td className="p-3.5 text-center">{p.admin ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </MainLayout>
  )
}
