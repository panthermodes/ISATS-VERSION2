import React from 'react'
import {
  ShieldCheck, UserCheck, Key, Laptop, Ticket, AlertTriangle,
  RotateCcw, ArrowRightLeft, CreditCard
} from 'lucide-react'

export interface AuditEventItem {
  id: number | string
  timestamp: string
  actor: string
  action: string
  module: 'AUTH' | 'ASSET' | 'TICKET' | 'ROLE' | 'BILLING' | 'MAINTENANCE' | 'SECURITY'
  details: string
  ip_address?: string
}

interface AuditTimelineProps {
  events: AuditEventItem[]
  title?: string
}

export function AuditTimeline({ events, title = 'Security & Operational Audit Trail' }: AuditTimelineProps) {
  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'AUTH':
      case 'SECURITY':
        return <Key className="w-3.5 h-3.5 text-amber-400" />
      case 'ROLE':
        return <UserCheck className="w-3.5 h-3.5 text-blue-400" />
      case 'ASSET':
        return <Laptop className="w-3.5 h-3.5 text-emerald-400" />
      case 'TICKET':
        return <Ticket className="w-3.5 h-3.5 text-cyan-400" />
      case 'BILLING':
        return <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
      case 'MAINTENANCE':
        return <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
      default:
        return <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
    }
  }

  return (
    <div className="space-y-4">
      {title && (
        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" /> {title}
        </h4>
      )}

      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-800">
        {events.map((evt) => (
          <div key={evt.id} className="relative group">
            <div className="absolute -left-6 top-0.5 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
              {getModuleIcon(evt.module)}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-white">{evt.action}</span>
                <span className="text-[10px] text-slate-500 font-mono">by @{evt.actor}</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">{evt.details}</p>
              <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
                <span>{evt.timestamp}</span>
                {evt.ip_address && <span>IP: {evt.ip_address}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
