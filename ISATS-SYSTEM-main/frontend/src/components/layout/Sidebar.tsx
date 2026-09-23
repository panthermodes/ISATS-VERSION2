import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Ticket, Monitor, Package, Users, Building2,
  ShieldCheck, FileBarChart2, Bell, Settings, LogOut, ChevronDown, ChevronRight,
  Wrench, ClipboardList, FolderOpen, ShieldAlert, Activity, Cpu, CreditCard,
  Calendar, Layers, QrCode, FileText, CheckCircle2, UserCheck, AlertTriangle
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import type { UserRole } from '@/types'

interface NavChild {
  label: string
  href: string
  roles?: UserRole[]
}

interface NavGroup {
  group: string
  icon: React.ReactNode
  roles?: UserRole[]
  items: NavChild[]
}

const enterpriseNav: NavGroup[] = [
  {
    group: 'Overview',
    icon: <LayoutDashboard className="w-4 h-4" />,
    items: [
      { label: 'Role Dashboard', href: '/dashboard' },
      { label: 'My Notifications', href: '/notifications' },
    ]
  },
  {
    group: 'Service Management',
    icon: <Ticket className="w-4 h-4" />,
    items: [
      { label: 'All Tickets', href: '/tickets' },
      { label: 'Submit Ticket', href: '/tickets/create' },
      { label: 'Service Requests', href: '/requests' },
    ]
  },
  {
    group: 'Hardware Assets',
    icon: <Monitor className="w-4 h-4" />,
    roles: ['Technician', 'ICT Officer', 'Supervisor', 'HOD', 'Manager', 'Admin', 'SuperAdmin', 'PlatformAdmin'],
    items: [
      { label: 'Asset Inventory', href: '/assets' },
      { label: 'Register Asset', href: '/assets/create', roles: ['Technician', 'ICT Officer', 'Manager', 'Admin', 'SuperAdmin', 'PlatformAdmin'] },
      { label: 'Scan QR / Barcode', href: '/assets/scan' },
      { label: 'Asset Movements', href: '/assets/movements', roles: ['Technician', 'ICT Officer', 'Supervisor', 'Admin', 'SuperAdmin', 'PlatformAdmin'] },
      { label: 'Asset Requisitions', href: '/requests' },
    ]
  },
  {
    group: 'Device Catalog',
    icon: <Cpu className="w-4 h-4" />,
    roles: ['ICT Officer', 'Manager', 'Admin', 'SuperAdmin', 'PlatformAdmin'],
    items: [
      { label: 'Catalog Reconciliation', href: '/settings/device-catalog' },
      { label: 'Hardware Categories', href: '/categories' },
    ]
  },
  {
    group: 'Diagnostics & Maintenance',
    icon: <Wrench className="w-4 h-4" />,
    roles: ['Technician', 'ICT Officer', 'Supervisor', 'Manager', 'Admin', 'SuperAdmin', 'PlatformAdmin'],
    items: [
      { label: 'Predictive Alerts (AI)', href: '/maintenance/predictive' },
      { label: 'Maintenance Log History', href: '/maintenance/history' },
      { label: 'Log Service Work', href: '/maintenance/logs/create', roles: ['Technician', 'ICT Officer', 'Admin', 'SuperAdmin', 'PlatformAdmin'] },
    ]
  },
  {
    group: 'Inventory & Consumables',
    icon: <Package className="w-4 h-4" />,
    roles: ['ICT Officer', 'Supervisor', 'Manager', 'Admin', 'SuperAdmin', 'PlatformAdmin'],
    items: [
      { label: 'Stock Levels', href: '/inventory' },
    ]
  },
  {
    group: 'Organization & Teams',
    icon: <Building2 className="w-4 h-4" />,
    roles: ['HOD', 'Manager', 'Admin', 'SuperAdmin', 'PlatformAdmin'],
    items: [
      { label: 'Employees Directory', href: '/users', roles: ['Admin', 'SuperAdmin', 'PlatformAdmin'] },
      { label: 'Provision User', href: '/users/create', roles: ['Admin', 'SuperAdmin', 'PlatformAdmin'] },
      { label: 'Departments', href: '/departments' },
      { label: 'RBAC Permission Matrix', href: '/roles', roles: ['Admin', 'SuperAdmin', 'PlatformAdmin'] },
    ]
  },
  {
    group: 'Reports & Analytics',
    icon: <FileBarChart2 className="w-4 h-4" />,
    roles: ['Manager', 'Admin', 'SuperAdmin', 'PlatformAdmin'],
    items: [
      { label: 'Executive Analytics', href: '/reports' },
      { label: 'Audit Timeline', href: '/audit' },
    ]
  },
  {
    group: 'Platform Administration',
    icon: <ShieldAlert className="w-4 h-4" />,
    roles: ['SuperAdmin', 'PlatformAdmin'],
    items: [
      { label: 'Tenant Master Overview', href: '/platform/organizations', roles: ['PlatformAdmin'] },
      { label: 'Subscription & Plans', href: '/subscription' },
      { label: 'System Settings', href: '/settings' },
    ]
  },
]

function roleAllowed(userRole: UserRole, required?: UserRole[]) {
  if (!required || required.length === 0) return true
  if (userRole === 'PlatformAdmin' || userRole === 'SuperAdmin') return true
  return required.includes(userRole)
}

export function Sidebar({ isOpen, onClose }: { isOpen: boolean; onClose?: () => void }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const userRole = user?.role ?? 'User'

  // Expand the group that contains active link
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({})

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => ({ ...prev, [groupName]: !prev[groupName] }))
  }

  // Filter groups and children by user role
  const filteredGroups = enterpriseNav
    .filter((g) => roleAllowed(userRole, g.roles))
    .map((g) => ({
      ...g,
      items: g.items.filter((item) => roleAllowed(userRole, item.roles))
    }))
    .filter((g) => g.items.length > 0)

  return (
    <>
      {/* Overlay on mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'fixed top-0 bottom-0 left-0 z-40 w-[270px] flex flex-col',
          'bg-[#FBFAF6] dark:bg-[#0B1F1A] text-[#17211D] dark:text-[#F3F7F5]',
          'border-r border-[#E5E1D8] dark:border-[#1D3A31] shadow-card',
          'transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E5E1D8] dark:border-[#1D3A31] shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#123C32] dark:bg-[#34D399] text-white dark:text-[#07130F] flex items-center justify-center shadow-md shrink-0">
            <Monitor className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-tight text-[#17211D] dark:text-[#F3F7F5]">ISATS</span>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#0F766E]/10 dark:bg-[#34D399]/20 text-[#0F766E] dark:text-[#34D399] uppercase">
                SaaS
              </span>
            </div>
            <p className="text-[10px] text-[#64706A] dark:text-[#94A3A0] truncate">ICT Operations & ITSM</p>
          </div>
        </div>

        {/* User Role Card */}
        <div className="px-3.5 py-3 border-b border-[#E5E1D8] dark:border-[#1D3A31] shrink-0">
          <div className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F5F3EC] dark:bg-[#102A23] border border-[#E5E1D8] dark:border-[#1D3A31]">
            <div className="w-8 h-8 rounded-lg bg-[#0F766E] dark:bg-[#34D399] text-white dark:text-[#07130F] flex items-center justify-center font-bold text-xs shrink-0">
              {user?.first_name?.[0] || user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold truncate text-[#17211D] dark:text-[#F3F7F5]">
                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-semibold text-[#0F766E] dark:text-[#34D399] truncate">
                  {userRole}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-4 text-xs">
          {filteredGroups.map((group) => {
            const isCollapsed = collapsedGroups[group.group]
            const hasActiveChild = group.items.some((it) => location.pathname === it.href)

            return (
              <div key={group.group} className="space-y-1">
                <button
                  type="button"
                  onClick={() => toggleGroup(group.group)}
                  className="w-full flex items-center justify-between px-2 py-1 text-[11px] font-bold text-[#64706A] dark:text-[#94A3A0] uppercase tracking-wider hover:text-[#17211D] dark:hover:text-[#F3F7F5]"
                >
                  <span className="flex items-center gap-1.5">
                    {group.icon}
                    {group.group}
                  </span>
                  {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>

                {!isCollapsed && (
                  <div className="space-y-0.5 pl-2 border-l border-[#E5E1D8] dark:border-[#1D3A31] ml-2">
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.href
                      return (
                        <Link
                          key={item.href}
                          to={item.href}
                          onClick={onClose}
                          className={clsx(
                            'flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                            isActive
                              ? 'bg-[#123C32] text-white dark:bg-[#34D399] dark:text-[#07130F] font-bold shadow-sm'
                              : 'text-[#17211D] dark:text-[#F3F7F5] hover:bg-[#F5F3EC] dark:hover:bg-[#102A23]'
                          )}
                        >
                          <span className={clsx('w-1.5 h-1.5 rounded-full', isActive ? 'bg-white dark:bg-[#07130F]' : 'bg-[#64706A] opacity-40')} />
                          <span className="truncate">{item.label}</span>
                        </Link>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        {/* Footer actions */}
        <div className="p-3 border-t border-[#E5E1D8] dark:border-[#1D3A31] shrink-0">
          <button
            onClick={() => logout()}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-[#DC2626] hover:bg-[#DC2626]/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Workspace</span>
          </button>
        </div>
      </aside>
    </>
  )
}
