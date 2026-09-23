import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Search, Laptop, Ticket, Users, Building2, X, ArrowRight } from 'lucide-react'

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

export function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const [query, setQuery] = useState('')

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        if (isOpen) onClose()
        else setQuery('')
      }
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const sampleResults = [
    { type: 'ASSET', title: 'Dell Latitude 5420 Workstation', subtitle: 'AST-DELL-5420-01 • ICT & Infrastructure', link: '/assets/AST-DELL-5420-01' },
    { type: 'TICKET', title: 'RAM Upgrade on Dell Latitude', subtitle: '#101 • High Priority • Assigned to Technician', link: '/tickets/1' },
    { type: 'USER', title: 'Shebby Panther', subtitle: '@shebby • SuperAdmin / Tenant Owner • ICT & Infrastructure', link: '/users/1' },
    { type: 'DEPARTMENT', title: 'ICT & Infrastructure', subtitle: '13 Staff • 5 Assets', link: '/departments' },
  ]

  const filtered = query
    ? sampleResults.filter(r => r.title.toLowerCase().includes(query.toLowerCase()) || r.subtitle.toLowerCase().includes(query.toLowerCase()))
    : sampleResults

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Search Header */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-800">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Search assets, tickets, users, departments... (Esc to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
            className="w-full bg-transparent text-sm text-white placeholder-slate-500 focus:outline-none"
          />
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Category List */}
        <div className="p-3 max-h-96 overflow-y-auto divide-y divide-slate-800/60">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => (
              <Link
                key={idx}
                to={item.link}
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-800/60 transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 shrink-0">
                    {item.type === 'ASSET' && <Laptop className="w-4 h-4" />}
                    {item.type === 'TICKET' && <Ticket className="w-4 h-4" />}
                    {item.type === 'USER' && <Users className="w-4 h-4" />}
                    {item.type === 'DEPARTMENT' && <Building2 className="w-4 h-4" />}
                  </div>
                  <div className="min-w-0">
                    <h5 className="text-xs font-bold text-white group-hover:text-blue-400 truncate">{item.title}</h5>
                    <p className="text-[11px] text-slate-400 truncate">{item.subtitle}</p>
                  </div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-blue-400 shrink-0" />
              </Link>
            ))
          ) : (
            <div className="p-8 text-center text-xs text-slate-500">
              No matching records found for "{query}".
            </div>
          )}
        </div>

        {/* Search Footer */}
        <div className="p-3 bg-slate-950/60 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span>Navigation: <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Ctrl+K</kbd> to search</span>
          <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">Esc</kbd> to exit</span>
        </div>
      </div>
    </div>
  )
}
