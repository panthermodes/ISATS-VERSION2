import { Link } from 'react-router-dom'
import { Check, Shield, ArrowRight } from 'lucide-react'
import { PublicLayout } from '@/layouts/PublicLayout'
import { Button } from '@/components/ui/Button'

export default function Pricing() {
  const tiers = [
    {
      name: 'Standard Organization',
      price: 'TZS 100,000',
      period: '/ month',
      desc: 'Ideal for small to medium organizations, schools, clinics, and business enterprises.',
      users: 'Up to 250 Active Staff & Technicians',
      popular: true,
      features: [
        'Up to 250 Active User Accounts',
        'Unlimited Asset Registry & QR Tagging',
        'Incident Ticketing & Queue Routing',
        'Preventative & Predictive Maintenance Engine',
        'Hardware Movement & Handover Clearances',
        'Multi-Tier RBAC (User to SuperAdmin)',
        'Full Audit Logging & IP Tracking',
        'Self-Serve Department Management',
        'Automated PDF & CSV Report Exports',
      ],
      cta: 'Start Standard Subscription',
      link: '/onboarding'
    },
    {
      name: 'Enterprise Custom',
      price: 'Custom',
      period: '',
      desc: 'For large enterprises, government ministries, and institutions needing unlimited scalability.',
      users: 'Unlimited Users & Dedicated Hosting',
      popular: false,
      features: [
        'Unlimited User Accounts & Departments',
        'Custom Device Taxonomy & Fields',
        'Dedicated On-Premise / VPC Deployment',
        'Custom SMS & Active Directory (LDAP) Sync',
        '24/7 SLA Technical Account Manager',
        'Custom Payment Gateway Integration',
        'Direct Database API Access',
      ],
      cta: 'Contact Sales',
      link: '/contact'
    }
  ]

  return (
    <PublicLayout>
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 transition-colors duration-200">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">Transparent Enterprise Pricing</h1>
          <p className="mt-4 text-base text-slate-600 dark:text-slate-400">Simple, predictable subscription plans with no hidden setup fees. Scale your ICT management effortlessly.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {tiers.map((tier, idx) => (
            <div
              key={idx}
              className={`p-8 rounded-3xl border flex flex-col justify-between transition-all duration-200 ${
                tier.popular
                  ? 'bg-white dark:bg-slate-800/80 border-blue-500/60 ring-2 ring-blue-500/20 shadow-xl shadow-blue-500/10'
                  : 'bg-white dark:bg-slate-900/60 border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">{tier.name}</h3>
                  {tier.popular && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20">
                      Standard SaaS Model
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">{tier.desc}</p>

                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">{tier.price}</span>
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{tier.period}</span>
                </div>
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                  {tier.users}
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-xs text-slate-700 dark:text-slate-300">
                      <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link to={tier.link} className="w-full">
                <Button
                  variant={tier.popular ? 'primary' : 'secondary'}
                  size="lg"
                  className={`w-full justify-center ${
                    tier.popular
                      ? 'bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-600/30'
                      : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                  }`}
                >
                  {tier.cta} <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  )
}
