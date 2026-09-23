import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, UserPlus, CheckCircle2, Shield } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { MainLayout } from '@/layouts/MainLayout'
import api from '@/services/api'
import { getDepartments } from '@/services/departments'
import type { Department } from '@/types'

export default function CreateUser() {
  const navigate = useNavigate()
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    firstName: '',
    lastName: '',
    role: 'User',
    department: '',
    phone: '+255688961487',
    password: 'ISATS@2026',
  })

  useEffect(() => {
    getDepartments()
      .then((data) => {
        if (Array.isArray(data)) {
          setDepartments(data)
          if (data.length > 0) {
            setFormData((prev) => ({ ...prev, department: String(data[0].id) }))
          }
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await api.post('/api/users/', {
        username: formData.username,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        role: formData.role,
        department: formData.department ? parseInt(formData.department) : null,
        phone_number: formData.phone,
        password: formData.password,
      })
      navigate('/users')
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.username?.[0] || err?.response?.data?.email?.[0] || 'Failed to create user.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout pageTitle="Provision Employee Account">
      <div className="max-w-2xl mx-auto space-y-6 text-[#17211D] dark:text-[#F3F7F5]">
        <div className="flex items-center gap-3">
          <Link to="/users">
            <Button variant="outline" size="sm" className="text-xs gap-1 border-[#E5E1D8] dark:border-[#1D3A31]">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Users
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold tracking-tight">Provision Employee Account</h2>
            <p className="text-xs text-[#64706A] dark:text-[#94A3A0] mt-0.5">Assign initial role, department, and secure credentials.</p>
          </div>
        </div>

        <Card className="p-6 bg-[#FDFCF9] dark:bg-[#0B1F1A] border border-[#E5E1D8] dark:border-[#1D3A31] shadow-card space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-xs font-semibold text-[#DC2626] flex items-center gap-2">
              <Shield className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="First Name *"
                placeholder="Shebby"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
              <Input
                label="Last Name *"
                placeholder="Panther"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Username *"
                placeholder="e.g. shebby_panther"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
              <Input
                label="Email Address *"
                type="email"
                placeholder="shebbyrasheed@gmail.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Assigned Role *"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                options={[
                  { value: 'User', label: 'Staff / User' },
                  { value: 'Technician', label: 'Field Technician' },
                  { value: 'ICT Officer', label: 'ICT Officer' },
                  { value: 'Supervisor', label: 'ICT Supervisor' },
                  { value: 'HOD', label: 'Head of Department' },
                  { value: 'Manager', label: 'ICT Manager' },
                  { value: 'Admin', label: 'Organization Admin' },
                  { value: 'SuperAdmin', label: 'Organization SuperAdmin' },
                ]}
              />
              <Select
                label="Department"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                options={departments.map((d) => ({ value: String(d.id), label: d.name }))}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                placeholder="+255688961487"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
              <Input
                label="Initial Password *"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="w-full bg-[#123C32] hover:bg-[#0B1F1A] dark:bg-[#34D399] dark:text-[#07130F] font-bold py-2.5 text-xs uppercase tracking-wider rounded-xl"
            >
              Provision Account
            </Button>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}
