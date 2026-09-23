import { useState } from 'react'
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react'
import { PublicLayout } from '@/layouts/PublicLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'

export default function Contact() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 800)
  }

  return (
    <PublicLayout>
      <div className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Get in Touch</h1>
          <p className="mt-4 text-base text-slate-400">Have questions about enterprise deployment, custom integrations, or pricing? Our team is here to assist.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="space-y-6">
            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Email Us</h3>
              <p className="text-xs text-slate-400">support@isats.enterprise</p>
              <p className="text-xs text-slate-400">sales@isats.enterprise</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
                <Phone className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">Phone & WhatsApp</h3>
              <p className="text-xs text-slate-400">+255 688 961 487</p>
              <p className="text-xs text-slate-400">Mon - Fri: 8:00 AM - 6:00 PM EAT</p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/60 border border-slate-800 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <MapPin className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-bold text-white">HQ Operations</h3>
              <p className="text-xs text-slate-400">PantherMode ICT Infrastructure Hub</p>
              <p className="text-xs text-slate-400">Dar es Salaam, Tanzania</p>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="p-8 rounded-3xl bg-slate-800/80 border border-slate-800">
              {submitted ? (
                <div className="text-center py-12 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Message Received</h3>
                  <p className="text-sm text-slate-400 max-w-md mx-auto">Thank you for reaching out. An ISATS enterprise solutions engineer will respond to your email within 24 hours.</p>
                  <Button variant="secondary" onClick={() => setSubmitted(false)} className="mt-4">Send Another Message</Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-lg font-bold text-white mb-2">Send us a message</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Full Name" placeholder="Shebby Panther" defaultValue="Shebby Panther" required />
                    <Input label="Business Email" type="email" placeholder="shebbyrasheed@gmail.com" defaultValue="shebbyrasheed@gmail.com" required />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input label="Organization Name" placeholder="e.g. Kigamboni Hospital" required />
                    <Input label="Phone Number" placeholder="+255688961487" defaultValue="+255688961487" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">Your Message / Requirements</label>
                    <textarea
                      rows={4}
                      placeholder="Describe your organization's ICT requirements or trial requests..."
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <Button type="submit" variant="primary" size="lg" loading={loading} className="w-full bg-blue-600 hover:bg-blue-500">
                    Send Message <Send className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
