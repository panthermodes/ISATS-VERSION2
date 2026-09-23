import { Link } from 'react-router-dom'
import { Shield, QrCode, Ticket, Cpu, CheckCircle2, ArrowRight, Activity } from 'lucide-react'
import { PublicLayout } from '@/layouts/PublicLayout'
import { Button } from '@/components/ui/Button'

export default function LandingPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-32 md:pb-36 transition-colors duration-200">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/60 via-transparent to-transparent dark:from-blue-900/30 dark:via-slate-900 dark:to-slate-900 -z-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-semibold mb-6 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 dark:bg-blue-400 animate-pulse" />
            ISATS Enterprise Platform v2.0 Live
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            The Complete Operating System for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-300">
              ICT Support & Asset Tracking
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Multi-tenant enterprise SaaS to manage hardware lifecycles, QR code tagging, ticketing triage, preventative maintenance, and employee asset clearances in one unified portal.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/onboarding" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-600/25 text-base px-8 py-3.5">
                Register Organization <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link to="/pricing" className="w-full sm:w-auto">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto text-base px-8 py-3.5 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 shadow-sm">
                View Pricing (TZS 100,000/mo)
              </Button>
            </Link>
          </div>

          {/* Highlights */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto text-left">
            {[
              { label: 'Asset Lifecycle', desc: 'Full QR & Barcode generation', icon: <QrCode className="w-5 h-5 text-blue-600 dark:text-blue-400" /> },
              { label: 'Ticket Workflows', desc: 'SLA triage & technician queues', icon: <Ticket className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> },
              { label: 'Hardware Registry', desc: 'Laptops, servers, switches & POS', icon: <Cpu className="w-5 h-5 text-teal-600 dark:text-teal-400" /> },
              { label: 'Predictive Health', desc: 'Proactive maintenance alerts', icon: <Activity className="w-5 h-5 text-emerald-600 dark:text-emerald-400" /> },
            ].map((item, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-white dark:bg-slate-800/50 border border-slate-200/90 dark:border-slate-800 shadow-sm backdrop-blur-sm transition-all hover:shadow-md">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 flex items-center justify-center mb-3">
                  {item.icon}
                </div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.label}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-20 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800/80 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-blue-600 dark:text-blue-400 tracking-wider uppercase mb-2">Enterprise Ready</h2>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Everything your ICT Department Needs</h3>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">Engineered for banks, schools, hospitals, corporations, and government institutions with strict organizational data isolation.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Shield className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Multi-Tenant Isolation</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Each subscribing organization gets a secure, private operational workspace with granular RBAC hierarchy from User to SuperAdmin.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">QR Code & Barcode Tracking</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Generate instant printable QR code tags and Code128 barcodes for hardware asset tagging and field verification.</p>
            </div>

            <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">Full Incident Resolution</h4>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">Direct user ticket submission, technician assignments, resolution audit trails, and automatic email/SMS alerts.</p>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  )
}
