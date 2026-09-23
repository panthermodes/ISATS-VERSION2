import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Shield, Building2, CreditCard, Activity, Settings,
  FileText, LogOut, Package, DollarSign, Layers, Cpu
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface PlatformAdminLayoutProps {
  children: React.ReactNode
  pageTitle?: string
}

export function PlatformAdminLayout({ children, pageTitle = 'Platform Admin' }: PlatformAdminLayoutProps) {
  const { logout } = useAuth()
  const location = useLocation()

  const navItems = [
    { label: 'Overview', href: '/platform/dashboard', icon: <Activity className="w-4 h-4" /> },
    { label: 'Organizations', href: '/platform/organizations', icon: <Building2 className="w-4 h-4" /> },
    { label: 'Plans & Pricing', href: '/platform/plans', icon: <Package className="w-4 h-4" /> },
    { label: 'Subscriptions', href: '/platform/subscriptions', icon: <CreditCard className="w-4 h-4" /> },
    { label: 'Payments & Revenue', href: '/platform/payments', icon: <DollarSign className="w-4 h-4" /> },
    { label: 'Global Invoices', href: '/platform/invoices', icon: <FileText className="w-4 h-4" /> },
    { label: 'Device Catalogue', href: '/platform/device-catalogue', icon: <Cpu className="w-4 h-4" /> },
    { label: 'Global Audit Logs', href: '/platform/audit', icon: <Layers className="w-4 h-4" /> },
    { label: 'Platform Settings', href: '/platform/settings', icon: <Settings className="w-4 h-4" /> },
  ]

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex transition-colors duration-200">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 transition-colors duration-200">
        <div>
          {/* Logo */}
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-base font-bold text-slate-900 dark:text-white tracking-tight">PantherMode</div>
              <div className="text-[10px] text-amber-600 dark:text-amber-400 uppercase tracking-wider font-semibold">Master Platform</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-4 space-y-1 text-sm">
            {navItems.map((item) => {
              const active = location.pathname === item.href
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2 rounded-xl font-medium text-xs transition-colors ${
                    active
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <Link to="/dashboard" className="block text-xs text-center py-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors">
            ← Exit to App Dashboard
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Panel */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 px-8 flex items-center justify-between bg-white/80 dark:bg-slate-900/50 backdrop-blur-md transition-colors duration-200">
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">{pageTitle}</h1>
          <div className="flex items-center gap-4">
            <ThemeToggle variant="buttons" size="sm" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-mono text-slate-500 dark:text-slate-400">PantherMode Engine: Operational</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto flex flex-col justify-between">
          <div>{children}</div>
          <footer className="mt-12 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
            <span>© {new Date().getFullYear()} ISATS Platform Governance</span>
            <span className="font-medium text-slate-700 dark:text-slate-400 tracking-wide">Developed and Maintained by PantherMode</span>
          </footer>
        </main>
      </div>
    </div>
  )
}
