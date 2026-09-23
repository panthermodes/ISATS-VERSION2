import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Lock, User, Mail, Phone, Building2, Shield, CheckCircle2 } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Button } from '@/components/ui/Button'
import api from '@/services/api'
import { getDepartments } from '@/services/departments'
import type { Department } from '@/types'

const schema = z
  .object({
    first_name: z.string().min(1, 'First name is required'),
    last_name:  z.string().min(1, 'Last name is required'),
    username:   z.string().min(3, 'Username must be at least 3 characters'),
    email:      z.string().email('Invalid email address'),
    phone_number: z.string().optional(),
    department: z.string().optional(),
    password:   z.string().min(8, 'Password must be at least 8 characters'),
    confirm_password: z.string(),
  })
  .refine((d) => d.password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type FormData = z.infer<typeof schema>

export default function Register() {
  const navigate = useNavigate()
  const [showPwd, setShowPwd] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [serverError, setServerError] = useState('')
  const [departments, setDepartments] = useState<Department[]>([])

  useEffect(() => {
    getDepartments()
      .then((data) => {
        if (Array.isArray(data)) setDepartments(data)
      })
      .catch(() => {})
  }, [])

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      first_name: 'Shebby',
      last_name: 'Panther',
      username: '',
      email: 'shebbyrasheed@gmail.com',
      phone_number: '+255688961487',
      password: '',
      confirm_password: '',
    }
  })

  const onSubmit = async (data: FormData) => {
    setServerError('')
    try {
      await api.post('/api/auth/register/', data)
      navigate('/login?registered=1')
    } catch (err: unknown) {
      const e = err as { response?: { data?: Record<string, any> } }
      const resData = e?.response?.data
      if (resData) {
        if (typeof resData.detail === 'string') {
          setServerError(resData.detail)
        } else if (resData.username) {
          setServerError(Array.isArray(resData.username) ? resData.username[0] : String(resData.username))
        } else if (resData.email) {
          setServerError(Array.isArray(resData.email) ? resData.email[0] : String(resData.email))
        } else {
          const firstVal = Object.values(resData)[0]
          setServerError(Array.isArray(firstVal) ? firstVal[0] : String(firstVal))
        }
      } else {
        setServerError('Registration failed. Please verify credentials and try again.')
      }
    }
  }

  return (
    <AuthLayout
      title="Create Staff Account"
      subtitle="Register as an authorized ICT user in your organization"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5">
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

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="Shebby"
            error={errors.first_name?.message}
            {...register('first_name')}
          />
          <Input
            label="Last Name"
            placeholder="Panther"
            error={errors.last_name?.message}
            {...register('last_name')}
          />
        </div>

        <Input
          label="Username"
          placeholder="e.g. shebby_panther"
          leftIcon={<User className="w-4 h-4" />}
          error={errors.username?.message}
          {...register('username')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Official Email"
            type="email"
            placeholder="shebbyrasheed@gmail.com"
            leftIcon={<Mail className="w-4 h-4" />}
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Phone Number"
            placeholder="+255688961487"
            leftIcon={<Phone className="w-4 h-4" />}
            error={errors.phone_number?.message}
            {...register('phone_number')}
          />
        </div>

        {departments.length > 0 && (
          <Select
            label="Assigned Department"
            placeholder="Select department (optional)"
            options={departments.map((d) => ({ value: d.id, label: d.name }))}
            {...register('department')}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Password"
            type={showPwd ? 'text' : 'password'}
            placeholder="Min. 8 characters"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                tabIndex={-1}
                className="text-[#64706A] hover:text-[#17211D] dark:hover:text-[#F3F7F5]"
              >
                {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            error={errors.password?.message}
            {...register('password')}
          />

          <Input
            label="Confirm Password"
            type={showConfirm ? 'text' : 'password'}
            placeholder="Repeat password"
            leftIcon={<Lock className="w-4 h-4" />}
            rightIcon={
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                tabIndex={-1}
                className="text-[#64706A] hover:text-[#17211D] dark:hover:text-[#F3F7F5]"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            }
            error={errors.confirm_password?.message}
            {...register('confirm_password')}
          />
        </div>

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={isSubmitting}
            className="w-full bg-[#123C32] hover:bg-[#0B1F1A] dark:bg-[#34D399] dark:text-[#07130F] dark:hover:bg-[#34D399]/90 font-bold py-3 text-xs tracking-wider uppercase rounded-xl transition-all"
          >
            Create Staff Account
          </Button>
        </div>

        <div className="pt-3 text-center text-xs text-[#64706A] dark:text-[#94A3A0]">
          Already registered?{' '}
          <Link to="/login" className="text-[#0F766E] dark:text-[#34D399] font-bold hover:underline">
            Sign in to Workspace
          </Link>
        </div>
      </form>
    </AuthLayout>
  )
}
