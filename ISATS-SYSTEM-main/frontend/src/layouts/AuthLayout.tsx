import React from 'react'
import { motion } from 'framer-motion'
import { Monitor, Shield, BarChart3, Zap, Lock, CheckCircle2, Award } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'

interface AuthLayoutProps {
  children: React.ReactNode
  title?: string
  subtitle?: string
}

const features = [
  { icon: <Monitor className="w-4 h-4" />, title: 'Asset Lifecycle Management', text: 'End-to-end procurement to disposal tracking' },
  { icon: <Shield className="w-4 h-4" />, title: 'Enterprise RBAC Authorization', text: 'Strict multi-tier tenant isolation and security' },
  { icon: <BarChart3 className="w-4 h-4" />, title: 'Predictive Hardware AI', text: 'Early failure warning and SLA monitoring' },
  { icon: <Zap className="w-4 h-4" />, title: 'Smart ITSM Dispatch', text: 'Automated ticket routing and technician triage' },
]

const complianceBadges = [
  { text: 'SOC 2 Type II Certified' },
  { text: 'GDPR & Privacy Compliant' },
  { text: 'TLS 1.3 Encrypted' },
]

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex bg-[#F5F3EC] dark:bg-[#07130F] text-[#17211D] dark:text-[#F3F7F5] transition-colors relative overflow-hidden">
      {/* Top right theme toggle */}
      <div className="absolute top-5 right-5 z-30">
        <ThemeToggle variant="buttons" size="sm" />
      </div>

      {/* Left branding panel */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="hidden lg:flex lg:w-1/2 xl:w-5/12 bg-gradient-to-br from-[#0B1F1A] via-[#123C32] to-[#07130F] text-white border-r border-[#E5E1D8]/20 dark:border-[#1D3A31] flex-col justify-between p-12 relative overflow-hidden"
      >
        {/* Ambient background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#0F766E]/20 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-10 -right-10 w-96 h-96 bg-[#34D399]/10 rounded-full blur-3xl" />
        </div>

        {/* Logo & Header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3.5 mb-10">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#34D399] to-[#0F766E] flex items-center justify-center shadow-glow text-[#07130F]">
              <Monitor className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-white text-xl tracking-tight">ISATS</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#34D399]/20 text-[#34D399] border border-[#34D399]/30 uppercase tracking-wider">
                  Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-300">ICT Support & Tracking System</p>
            </div>
          </div>

          <h2 className="text-3xl font-extrabold text-white leading-tight mb-4 tracking-tight">
            Intelligent ICT Operations &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#34D399] to-[#60A5FA]">
              Enterprise Service Management
            </span>
          </h2>
          <p className="text-slate-300 text-sm leading-relaxed mb-8">
            Empower your organization with multi-tenant hardware reconciliation, automated ticketing dispatch, and predictive maintenance telemetry.
          </p>

          {/* Feature List */}
          <div className="space-y-4 mb-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.1 }}
                className="flex items-start gap-3.5 p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <div className="w-8 h-8 rounded-lg bg-[#34D399]/20 text-[#34D399] flex items-center justify-center shrink-0 mt-0.5">
                  {f.icon}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-tight">{f.title}</h4>
                  <p className="text-[11px] text-slate-300 mt-0.5">{f.text}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Security & Organization Compliance Policy Footer */}
        <div className="relative z-10 pt-6 border-t border-white/10 space-y-3">
          <div className="flex flex-wrap gap-2">
            {complianceBadges.map((b, idx) => (
              <span key={idx} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-white/10 text-slate-200 border border-white/10">
                <CheckCircle2 className="w-3 h-3 text-[#34D399]" /> {b.text}
              </span>
            ))}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center justify-between">
            <span>© {new Date().getFullYear()} ISATS Enterprise SaaS</span>
            <span className="font-semibold text-slate-300">Architected by PantherMode</span>
          </div>
        </div>
      </motion.div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-6 md:p-10 z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          {/* Mobile brand header */}
          <div className="flex items-center gap-3 mb-6 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-[#123C32] dark:bg-[#34D399] text-white dark:text-[#07130F] flex items-center justify-center">
              <Monitor className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-[#17211D] dark:text-[#F3F7F5] text-lg">ISATS Enterprise</span>
              <p className="text-[10px] text-[#64706A] dark:text-[#94A3A0]">ICT Support & Tracking</p>
            </div>
          </div>

          {/* Form Header */}
          {(title || subtitle) && (
            <div className="mb-6">
              {title && (
                <h1 className="text-2xl font-bold text-[#17211D] dark:text-[#F3F7F5] tracking-tight">
                  {title}
                </h1>
              )}
              {subtitle && <p className="text-xs text-[#64706A] dark:text-[#94A3A0] mt-1">{subtitle}</p>}
            </div>
          )}

          {/* Card Container */}
          <div className="p-7 rounded-3xl bg-[#FDFCF9] dark:bg-[#0B1F1A] border border-[#E5E1D8] dark:border-[#1D3A31] shadow-card">
            {children}
          </div>

          {/* Enterprise Policy Note */}
          <div className="mt-6 text-center text-[11px] text-[#64706A] dark:text-[#94A3A0] space-y-1">
            <p className="flex items-center justify-center gap-1.5 font-medium">
              <Lock className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#34D399]" />
              Enterprise End-to-End Encryption & RBAC Enforced
            </p>
            <p className="text-[10px] opacity-80">
              Authorized personnel only. Access subject to organization compliance policies.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
