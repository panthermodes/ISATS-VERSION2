import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, ArrowRight, Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface PublicLayoutProps {
  children: React.ReactNode
}

export function PublicLayout({ children }: PublicLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#07111F] text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/85 dark:bg-[#07111F]/85 border-b border-slate-200 dark:border-[#1E293B] transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/home" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">ISATS</span>
              <span className="ml-1.5 text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-medium">Enterprise</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <Link to="/features" className="hover:text-blue-600 dark:hover:text-white transition-colors">Features</Link>
            <Link to="/pricing" className="hover:text-blue-600 dark:hover:text-white transition-colors">Pricing</Link>
            <Link to="/contact" className="hover:text-blue-600 dark:hover:text-white transition-colors">Contact</Link>
          </nav>

          {/* Action Buttons & Theme Toggle with Nicer Buttons */}
          <div className="hidden md:flex items-center gap-3.5">
            <ThemeToggle variant="buttons" size="sm" />
            <Link to="/login" className="text-sm font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/onboarding">
              <Button variant="primary" size="sm" className="bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30">
                Get Started <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#101D2E] transition-colors"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden px-4 pt-3 pb-6 bg-white dark:bg-[#0B1728] border-b border-slate-200 dark:border-[#1E293B] space-y-3">
            <Link to="/features" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 dark:text-slate-300 font-medium hover:text-blue-600 dark:hover:text-white">Features</Link>
            <Link to="/pricing" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 dark:text-slate-300 font-medium hover:text-blue-600 dark:hover:text-white">Pricing</Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-slate-700 dark:text-slate-300 font-medium hover:text-blue-600 dark:hover:text-white">Contact</Link>
            <div className="flex items-center justify-between py-2 border-t border-b border-slate-100 dark:border-[#1E293B]">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Theme</span>
              <ThemeToggle variant="buttons" size="sm" />
            </div>
            <div className="pt-2 flex flex-col gap-2.5">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="secondary" className="w-full justify-center">Sign In</Button>
              </Link>
              <Link to="/onboarding" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full justify-center bg-blue-600">Get Started</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 py-12 text-sm transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">ISATS</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              ICT Support and Tracking System. Enterprise multi-tenant asset management, ticket lifecycle, and predictive operations.
            </p>
          </div>
          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold mb-3">Product</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/features" className="hover:text-blue-600 dark:hover:text-white transition-colors">Asset Tracking & QR</Link></li>
              <li><Link to="/features" className="hover:text-blue-600 dark:hover:text-white transition-colors">Incident Ticketing</Link></li>
              <li><Link to="/features" className="hover:text-blue-600 dark:hover:text-white transition-colors">Inventory Control</Link></li>
              <li><Link to="/pricing" className="hover:text-blue-600 dark:hover:text-white transition-colors">Pricing & Plans</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold mb-3">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/contact" className="hover:text-blue-600 dark:hover:text-white transition-colors">Contact Support</Link></li>
              <li><Link to="/onboarding" className="hover:text-blue-600 dark:hover:text-white transition-colors">Organization Onboarding</Link></li>
              <li><Link to="/login" className="hover:text-blue-600 dark:hover:text-white transition-colors">Staff Portal</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-slate-900 dark:text-white font-semibold mb-3">Enterprise</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Powered by PantherMode platform infrastructure.</p>
            <span className="text-xs text-slate-600 dark:text-slate-400 font-mono">Base Plan: TZS 100,000 / month</span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 pt-8 border-t border-slate-200 dark:border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} ISATS Enterprise System. All rights reserved.</span>
          <span className="text-slate-700 dark:text-slate-400 font-medium tracking-wide">Developed and Maintained by PantherMode</span>
        </div>
      </footer>
    </div>
  )
}
