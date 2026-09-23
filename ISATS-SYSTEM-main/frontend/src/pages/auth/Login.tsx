import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, User, Shield, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { login } from '@/services/auth'
import { useAuth } from '@/context/AuthContext'

const schema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  remember: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

const demoAccounts = [
  { role: 'Platform Admin', user: 'admin', pass: 'ISATS@2026', name: 'Shebby Panther', color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
  { role: 'Org Admin', user: 'admin_user', pass: 'ISATS@2026', name: 'Khamis Bakari', color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' },
  { role: 'ICT Officer', user: 'officer_user', pass: 'ISATS@2026', name: 'Baraka Mwamba', color: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/30' },
  { role: 'Technician', user: 'tech_user', pass: 'ISATS@2026', name: 'Kelvin Mushi', color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' },
  { role: 'Staff User', user: 'employee_user', pass: 'ISATS@2026', name: 'Neema Tarimo', color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30' },
]

export default function Login() {
  const navigate = useNavigate()
  const { refreshUser } = useAuth()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [selectedDemo, setSelectedDemo] = useState('admin')

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      username: 'admin',
      password: 'ISATS@2026',
      remember: true,
    }
  })

  const fillDemo = (username: string, pass: string) => {
    setValue('username', username)
    setValue('password', pass)
    setSelectedDemo(username)
    setServerError('')
  }

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      await login(data.username, data.password)
      await refreshUser()
      navigate('/dashboard')
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string; non_field_errors?: string[] } } }
      const msg =
        error?.response?.data?.detail ||
        error?.response?.data?.non_field_errors?.[0] ||
        'Invalid username or password. Please try again.'
      setServerError(msg)
    }
  }

  return (
    <AuthLayout
      title="Welcome to ISATS"
      subtitle="Authenticate with your organization credentials"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <AnimatePresence>
          {serverError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-3.5 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-xs font-semibold text-[#DC2626] flex items-center gap-2"
            >
              <Shield className="w-4 h-4 shrink-0" />
              <span>{serverError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <Input
          label="Username / Staff ID"
          placeholder="Enter username (e.g. admin)"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.username?.message}
          {...register('username')}
        />

        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          placeholder="Enter password"
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
              className="text-[#64706A] hover:text-[#17211D] dark:hover:text-[#F3F7F5] transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          error={errors.password?.message}
          {...register('password')}
        />

        <div className="flex items-center justify-between text-xs pt-1">
          <label className="flex items-center gap-2 cursor-pointer text-[#64706A] dark:text-[#94A3A0]">
            <input
              type="checkbox"
              className="rounded border-[#E5E1D8] dark:border-[#1D3A31] w-4 h-4 text-[#123C32] focus:ring-[#0F766E]"
              {...register('remember')}
            />
            Keep me authenticated
          </label>
          <Link
            to="/forgot-password"
            className="text-[#0F766E] dark:text-[#34D399] hover:underline font-semibold"
          >
            Forgot password?
          </Link>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          loading={isSubmitting}
          className="w-full bg-[#123C32] hover:bg-[#0B1F1A] dark:bg-[#34D399] dark:text-[#07130F] dark:hover:bg-[#34D399]/90 font-bold py-3 text-xs tracking-wider uppercase rounded-xl transition-all"
        >
          Sign In to Workspace
        </Button>

        {/* Quick Demo Role Selector */}
        <div className="pt-4 border-t border-[#E5E1D8] dark:border-[#1D3A31] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64706A] dark:text-[#94A3A0] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D97706]" /> Quick Role Switcher (Demo)
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            {demoAccounts.map((acc, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => fillDemo(acc.user, acc.pass)}
                className={`text-left p-2 rounded-xl border text-[11px] transition-all flex items-center justify-between ${
                  selectedDemo === acc.user
                    ? 'border-[#0F766E] dark:border-[#34D399] bg-[#0F766E]/5 dark:bg-[#34D399]/5 font-bold'
                    : 'border-[#E5E1D8] dark:border-[#1D3A31] hover:bg-slate-100 dark:hover:bg-slate-800/40 text-[#64706A] dark:text-[#94A3A0]'
                }`}
              >
                <div>
                  <div className="font-semibold text-[#17211D] dark:text-[#F3F7F5]">{acc.role}</div>
                  <div className="text-[10px] opacity-75">{acc.name}</div>
                </div>
                {selectedDemo === acc.user && <CheckCircle2 className="w-3.5 h-3.5 text-[#0F766E] dark:text-[#34D399]" />}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-3 text-center text-xs text-[#64706A] dark:text-[#94A3A0]">
          Don't have an organization account?{' '}
          <Link to="/register" className="text-[#0F766E] dark:text-[#34D399] font-bold hover:underline">
            Register Organization Staff
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
