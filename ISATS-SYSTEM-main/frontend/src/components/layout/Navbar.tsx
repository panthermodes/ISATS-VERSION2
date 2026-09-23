import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Bell, Sun, Moon, Menu, User, Settings, LogOut, ChevronDown,
  Search, Shield, Building2
} from 'lucide-react'
import clsx from 'clsx'
import { useAuth } from '@/context/AuthContext'
import { useNotifications } from '@/hooks/useNotifications'
import { GlobalSearch } from './GlobalSearch'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface NavbarProps {
  onMenuToggle: () => void
  pageTitle?: string
}

export function Navbar({ onMenuToggle, pageTitle }: NavbarProps) {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Keyboard shortcut Ctrl+K / Cmd+K for search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setSearchOpen((prev) => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const initials = user
    ? (`${user.first_name?.[0] ?? ''}${user.last_name?.[0] ?? ''}`).toUpperCase() || user.username?.[0]?.toUpperCase() || 'U'
    : 'U'

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 left-0 right-0 z-30 h-16',
          'bg-[#FBFAF6]/90 dark:bg-[#0B1F1A]/90 backdrop-blur-md',
          'border-b border-[#E5E1D8] dark:border-[#1D3A31]',
          'flex items-center px-4 sm:px-6 gap-3 sm:gap-4',
          'md:left-[270px] transition-all duration-200'
        )}
      >
        {/* Mobile menu toggle */}
        <button
          onClick={onMenuToggle}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#101D2E] text-slate-500 dark:text-slate-400 transition-colors md:hidden"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Page Title & Workspace Badge */}
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight hidden sm:block">
            {pageTitle ?? 'ISATS'}
          </h1>
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Enterprise Workspace</span>
          </div>
        </div>

        {/* Right Section */}
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          {/* Quick Search Trigger */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#1E293B] bg-slate-50 dark:bg-[#101D2E] text-xs text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Search...</span>
            <kbd className="hidden md:inline text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-[#1E293B] font-mono text-slate-500">
              ⌘K
            </kbd>
          </button>

          {/* Professional White / Dark theme toggle with Nicer Buttons */}
          <div className="hidden sm:block">
            <ThemeToggle variant="buttons" size="sm" />
          </div>
          <div className="sm:hidden">
            <ThemeToggle variant="compact" />
          </div>

          {/* Notifications */}
          <Link
            to="/notifications"
            className="relative p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#101D2E] text-slate-500 dark:text-slate-400 transition-colors"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-[#EF4444] text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </Link>

          {/* User Menu Dropdown */}
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2.5 pl-1.5 pr-2.5 py-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#101D2E] transition-colors"
            >
              <div className="w-8 h-8 rounded-xl bg-[#2563EB] flex items-center justify-center text-xs font-bold text-white shadow-sm">
                {initials}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-900 dark:text-white max-w-[110px] truncate leading-tight">
                  {user?.first_name || user?.username}
                </span>
                <span className="text-[10px] text-slate-400 leading-tight truncate">{user?.role}</span>
              </div>
              <ChevronDown className={clsx('w-3.5 h-3.5 text-slate-400 transition-transform duration-150', userMenuOpen && 'rotate-180')} />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl bg-white dark:bg-[#101D2E] border border-slate-200 dark:border-[#1E293B] shadow-2xl py-1.5 z-50 animate-slide-up">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-[#1E293B] mb-1">
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    {user?.first_name} {user?.last_name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{user?.email}</p>
                  <div className="mt-1.5 inline-block px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold border border-blue-500/20">
                    {user?.role}
                  </div>
                </div>
                <Link
                  to="/profile"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#152438] transition-colors"
                >
                  <User className="w-4 h-4 text-slate-400" /> My Profile
                </Link>
                <Link
                  to="/settings"
                  onClick={() => setUserMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-[#152438] transition-colors"
                >
                  <Settings className="w-4 h-4 text-slate-400" /> Settings
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center gap-2.5 w-full px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors border-t border-slate-100 dark:border-[#1E293B] mt-1"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
