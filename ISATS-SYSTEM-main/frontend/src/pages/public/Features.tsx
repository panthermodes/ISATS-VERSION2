import { Link } from 'react-router-dom'
import { QrCode, Ticket, Cpu, Activity, Users, ShieldCheck, ArrowRight } from 'lucide-react'
import { PublicLayout } from '@/layouts/PublicLayout'
import { Button } from '@/components/ui/Button'

export default function Features() {
  const features = [
    {
      title: 'Complete Hardware Lifecycle',
      desc: 'Track equipment from procurement to disposal. Record serial numbers, warranty dates, vendors, and maintenance logs with instant QR code generation.',
      icon: <QrCode className="w-6 h-6 text-blue-400" />
    },
    {
      title: 'Smart Ticketing & Triage',
      desc: 'Staff can submit incident reports with asset attachments. ICT Officers receive priority queues, status workflows, and resolution timelines.',
      icon: <Ticket className="w-6 h-6 text-indigo-400" />
    },
    {
      title: 'Broad Device Catalog',
      desc: 'Out-of-the-box support for Laptops, Desktops, Servers, Routers, Switches, Firewalls, POS Terminals, Biometrics, and CCTV systems.',
      icon: <Cpu className="w-6 h-6 text-teal-400" />
    },
    {
      title: 'Predictive Maintenance Engine',
      desc: 'Algorithmic failure risk score calculation based on age, usage intensity, and historical incident volume to prevent critical downtime.',
      icon: <Activity className="w-6 h-6 text-emerald-400" />
    },
    {
      title: 'Employee Asset Clearances',
      desc: 'Digital sign-offs for asset handovers, temporary device authorizations, and inter-employee transfers with legal policy acknowledgments.',
      icon: <Users className="w-6 h-6 text-amber-400" />
    },
    {
      title: 'Enterprise RBAC & Security',
      desc: 'Multi-tier roles from User to SuperAdmin with strict audit logging of every change, login attempts, and permission enforcement.',
      icon: <ShieldCheck className="w-6 h-6 text-rose-400" />
    }
  ]

  return (
    <PublicLayout>
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Platform Capabilities</h1>
          <p className="mt-4 text-base text-slate-400">Everything your IT and operations teams need to maintain complete visibility and control over technology assets.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl bg-slate-800/60 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA banner */}
        <div className="mt-20 p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-blue-900/60 to-indigo-900/60 border border-blue-500/20 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">Ready to elevate your ICT infrastructure?</h2>
          <p className="mt-2 text-sm text-slate-300 max-w-xl mx-auto">Get your entire team onboarded in under 10 minutes with our guided self-registration wizard.</p>
          <div className="mt-6 flex justify-center">
            <Link to="/onboarding">
              <Button variant="primary" size="lg" className="bg-blue-600 hover:bg-blue-500">
                Start Free Onboarding <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
