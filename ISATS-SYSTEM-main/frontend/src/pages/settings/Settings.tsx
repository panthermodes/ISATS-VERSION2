import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Sun, Moon, Lock, Bell, User, Cpu, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useTheme } from '@/context/ThemeContext'
import { useToast } from '@/context/ToastContext'
import { changePassword } from '@/services/auth'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import clsx from 'clsx'

const tabs = ['Appearance', 'Security', 'Notifications', 'ICT Device Catalog'] as const
type Tab = typeof tabs[number]

const pwdSchema = z.object({
  old_password:     z.string().min(1, 'Required'),
  new_password:     z.string().min(8, 'Min 8 characters'),
  confirm_password: z.string(),
}).refine((d) => d.new_password === d.confirm_password, { message: 'Passwords do not match', path: ['confirm_password'] })
type PwdForm = z.infer<typeof pwdSchema>

export default function Settings() {
  const [activeTab, setActiveTab] = useState<Tab>('Appearance')
  const { theme, setTheme } = useTheme()
  const toast = useToast()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<PwdForm>({
    resolver: zodResolver(pwdSchema),
  })

  const onChangePwd = async (data: PwdForm) => {
    try {
      await changePassword(data.old_password, data.new_password)
      toast.success('Password updated successfully')
      reset()
    } catch {
      toast.error('Failed to update password')
    }
  }

  return (
    <OrganizationLayout pageTitle="Settings">
      <PageHeader title="Settings" breadcrumbs={[{ label: 'Settings' }]} subtitle="Manage your account preferences, theme, security, and catalog" />

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border dark:border-primary-700 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === tab
                ? 'border-blue text-blue font-semibold'
                : 'border-transparent text-muted hover:text-primary-900 dark:hover:text-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Appearance' && (
        <div className="max-w-2xl space-y-6">
          <Card title="Workspace Appearance & Color Theme">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100 dark:border-[#1E293B]">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Active Theme Mode</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Toggle immediately across your entire browser session</p>
              </div>
              <ThemeToggle variant="buttons" size="md" />
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 mb-5">
              Customize the look and feel of your enterprise workstation. Choose between crisp enterprise white and ultra-deep navy dark mode.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Light Theme Card */}
              <div
                onClick={() => setTheme('light')}
                className={clsx(
                  'cursor-pointer rounded-2xl p-4 border-2 transition-all select-none relative overflow-hidden group',
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-50/50 shadow-md ring-1 ring-blue-500/20'
                    : 'border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#101D2E] hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                {theme === 'light' && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center text-[11px] font-bold">
                    ✓
                  </span>
                )}
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center mb-3">
                  <Sun className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Crisp White Theme</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  High contrast daylight theme tailored for brightly lit office workstations and paperwork.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1E293B] flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-white border border-slate-300" />
                  <span className="w-3 h-3 rounded-full bg-blue-600" />
                  <span className="w-3 h-3 rounded-full bg-slate-100 border border-slate-300" />
                  <span className="text-[10px] text-slate-400 font-mono ml-auto">Canvas #F8FAFC</span>
                </div>
              </div>

              {/* Dark Theme Card */}
              <div
                onClick={() => setTheme('dark')}
                className={clsx(
                  'cursor-pointer rounded-2xl p-4 border-2 transition-all select-none relative overflow-hidden group',
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-950/20 shadow-md ring-1 ring-blue-500/20'
                    : 'border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#101D2E] hover:border-slate-300 dark:hover:border-slate-700'
                )}
              >
                {theme === 'dark' && (
                  <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-blue-500 text-white flex items-center justify-center text-[11px] font-bold">
                    ✓
                  </span>
                )}
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-3">
                  <Moon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">Deep Navy Dark Mode</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  OLED friendly deep navy foundation (#07111F) with cyan accents designed to reduce eye strain.
                </p>
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#1E293B] flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#07111F] border border-[#1E293B]" />
                  <span className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="w-3 h-3 rounded-full bg-[#101D2E] border border-[#1E293B]" />
                  <span className="text-[10px] text-slate-400 font-mono ml-auto">Foundation #07111F</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'Security' && (
        <div className="max-w-md">
          <Card title="Change Password">
            <form onSubmit={handleSubmit(onChangePwd)} className="space-y-4 mt-2">
              <Input label="Current Password" type="password" required error={errors.old_password?.message} leftIcon={<Lock className="w-4 h-4" />} {...register('old_password')} />
              <Input label="New Password" type="password" required error={errors.new_password?.message} leftIcon={<Lock className="w-4 h-4" />} {...register('new_password')} />
              <Input label="Confirm New Password" type="password" required error={errors.confirm_password?.message} leftIcon={<Lock className="w-4 h-4" />} {...register('confirm_password')} />
              <Button type="submit" variant="primary" loading={isSubmitting}>Update Password</Button>
            </form>
          </Card>
        </div>
      )}

      {activeTab === 'Notifications' && (
        <div className="max-w-md">
          <Card title="Notification Preferences">
            <div className="space-y-4 mt-2">
              {['Email notifications for new tickets', 'Email on ticket assignment', 'Email on asset updates', 'System alerts'].map((label) => (
                <label key={label} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-primary-900 dark:text-slate-200">{label}</span>
                  <div className="relative">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-10 h-6 bg-slate-200 dark:bg-primary-600 rounded-full peer-checked:bg-blue transition-colors" />
                    <div className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-4" />
                  </div>
                </label>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === 'ICT Device Catalog' && (
        <div className="max-w-2xl space-y-4">
          <Card
            title="Organization ICT Device Catalog"
            subtitle="Configure standard platform hardware types, enable/disable equipment, and manage custom organizational assets."
          >
            <div className="space-y-4 mt-2">
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-2">
                <div className="flex items-center gap-2 font-bold text-blue-600 dark:text-blue-400">
                  <Cpu className="w-4 h-4" />
                  <span>Tenant-Isolated ICT Catalog Architecture</span>
                </div>
                <p className="leading-relaxed">
                  Your device catalog defines which hardware types are active for asset registration, QR/barcode generation, inventory tracking, and tickets across your entire organization.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link to="/settings/device-catalog">
                  <Button variant="primary" leftIcon={<Cpu className="w-4 h-4" />} rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Open Device Catalog Manager
                  </Button>
                </Link>
                <Link to="/assets/create">
                  <Button variant="secondary">
                    Register New Asset
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      )}
    </OrganizationLayout>
  )
}
