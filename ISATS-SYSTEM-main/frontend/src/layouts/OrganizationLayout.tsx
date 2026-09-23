import React, { useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import { Sidebar } from '@/components/layout/Sidebar'
import { Navbar } from '@/components/layout/Navbar'
import { ToastProvider } from '@/context/ToastContext'
import { ISATSLoader } from '@/components/loading/ISATSLoader'
import { pageVariants } from '@/theme/animations'

interface OrganizationLayoutProps {
  children: React.ReactNode
  pageTitle?: string
}

export function OrganizationLayout({ children, pageTitle }: OrganizationLayoutProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  if (isLoading) {
    return <ISATSLoader stageText="Authenticating enterprise credentials..." fullScreen />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[#F5F3EC] dark:bg-[#07130F] text-[#17211D] dark:text-[#F3F7F5] transition-colors duration-200">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} pageTitle={pageTitle} />
        
        <AnimatePresence mode="wait">
          <motion.main
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="md:pl-[270px] pt-16 min-h-screen flex flex-col justify-between transition-all duration-200"
          >
            <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">{children}</div>
            <footer className="mt-auto py-6 px-4 sm:px-6 lg:px-8 border-t border-[#E5E1D8] dark:border-[#1D3A31] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#7D8A82] dark:text-[#8E9D94] max-w-7xl w-full mx-auto">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>© {new Date().getFullYear()} ISATS Enterprise System • All systems operational</span>
              </div>
              <span className="font-semibold text-[#123C32] dark:text-[#34D399] tracking-wide">
                Developed and Maintained by PantherMode
              </span>
            </footer>
          </motion.main>
        </AnimatePresence>
      </div>
    </ToastProvider>
  )
}
