import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Shield, KeyRound, CheckCircle2, ArrowRight } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      alert('Passwords do not match.')
      return
    }
    setSubmitted(true)
    setTimeout(() => navigate('/login'), 2000)
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 text-slate-100">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center mx-auto text-blue-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">Set New Password</h1>
          <p className="text-xs text-slate-400">Create a secure password with at least 8 characters.</p>
        </div>

        <Card className="p-6 sm:p-8 bg-slate-900 border-slate-800 space-y-4">
          {submitted ? (
            <div className="text-center py-4 space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h3 className="text-sm font-bold text-white">Password Updated Successfully</h3>
              <p className="text-xs text-slate-400">Redirecting to login...</p>
            </div>
          ) : (
            <form onSubmit={handleReset} className="space-y-4">
              <Input
                label="New Password *"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <Input
                label="Confirm New Password *"
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs py-2.5">
                Update Password & Sign In
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
