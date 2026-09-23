import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Wrench, CheckCircle2, AlertCircle } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { MainLayout } from '@/layouts/MainLayout'
import api from '@/services/api'
import { motion, AnimatePresence } from 'framer-motion'

interface AssetOption {
  asset_id: string
  asset_tag: string
  asset_name: string
}

export default function MaintenanceLogForm() {
  const navigate = useNavigate()
  const [assets, setAssets] = useState<AssetOption[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [formData, setFormData] = useState({
    asset_id: '',
    asset_tag: '',
    maintenance_type: 'Preventive',
    performed_date: new Date().toISOString().split('T')[0],
    notes: '',
    parts_replaced: '',
  })

  useEffect(() => {
    api.get('/api/assets/')
      .then((res: any) => {
        const list = Array.isArray(res.data?.results)
          ? res.data.results
          : Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
          ? res.data
          : []
        setAssets(list)
      })
      .catch(() => {})
  }, [])

  const handleAssetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = assets.find(a => a.asset_id === e.target.value)
    setFormData(prev => ({
      ...prev,
      asset_id: e.target.value,
      asset_tag: selected?.asset_tag || '',
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.asset_id && !formData.asset_tag) {
      setError('Please select an asset or enter an asset tag.')
      return
    }
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await api.post('/api/maintenance/logs/', {
        asset_id: formData.asset_id,
        asset_tag: formData.asset_tag,
        maintenance_type: formData.maintenance_type,
        performed_date: formData.performed_date,
        notes: formData.notes,
        parts_replaced: formData.parts_replaced,
      })
      setSuccess('Maintenance log recorded successfully.')
      setTimeout(() => navigate('/maintenance/history'), 1500)
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.error ||
        'Failed to record maintenance log. Please try again.'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <MainLayout pageTitle="Record Hardware Service Log">
      <div className="max-w-2xl mx-auto space-y-6 text-[#17211D] dark:text-[#F3F7F5]">
        <div className="flex items-center gap-3">
          <Link to="/maintenance/history">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1 border-[#E5E1D8] dark:border-[#1D3A31] text-[#17211D] dark:text-[#F3F7F5]"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Logs
            </Button>
          </Link>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#17211D] dark:text-[#F3F7F5]">
              Record Hardware Service Log
            </h2>
            <p className="text-xs text-[#64706A] dark:text-[#94A3A0] mt-0.5">
              Document preventive, corrective, or AI-triggered maintenance work on a registered asset.
            </p>
          </div>
        </div>

        <Card className="p-6 bg-[#FDFCF9] dark:bg-[#0B1F1A] border border-[#E5E1D8] dark:border-[#1D3A31] shadow-card space-y-5">
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3.5 rounded-xl bg-[#DC2626]/10 border border-[#DC2626]/20 text-xs font-semibold text-[#DC2626]"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            {success && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{success}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Asset selector */}
            {assets.length > 0 ? (
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#17211D] dark:text-[#F3F7F5] uppercase tracking-wider">
                  Select Asset *
                </label>
                <select
                  value={formData.asset_id}
                  onChange={handleAssetChange}
                  required
                  className="w-full px-3 py-2.5 rounded-xl border border-[#E5E1D8] dark:border-[#1D3A31] bg-[#F5F3EC] dark:bg-[#102A23] text-[#17211D] dark:text-[#F3F7F5] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent placeholder:text-[#94A3A0] dark:placeholder:text-[#64706A] transition-all"
                >
                  <option value="">-- Select an asset to service --</option>
                  {assets.map(a => (
                    <option key={a.asset_id} value={a.asset_id}>
                      {a.asset_tag} — {a.asset_name}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-[#64706A] dark:text-[#94A3A0]">
                  Or enter a tag manually below if the asset is not listed yet.
                </p>
              </div>
            ) : (
              <Input
                label="Asset Tag Identifier *"
                placeholder="e.g. AST-DELL-8812"
                value={formData.asset_tag}
                onChange={e => setFormData({ ...formData, asset_tag: e.target.value, asset_id: '' })}
                required={!formData.asset_id}
                className="rounded-xl border-[#E5E1D8] dark:border-[#1D3A31] bg-[#F5F3EC] dark:bg-[#102A23] placeholder:text-[#94A3A0] dark:placeholder:text-[#64706A] text-xs focus:ring-[#0F766E]"
              />
            )}

            {/* Manual override tag field when asset selected */}
            {assets.length > 0 && (
              <Input
                label="Or Enter Asset Tag Manually"
                placeholder="e.g. AST-HP-1201 (overrides selection above)"
                value={formData.asset_tag}
                onChange={e => setFormData({ ...formData, asset_tag: e.target.value, asset_id: '' })}
                className="rounded-xl border-[#E5E1D8] dark:border-[#1D3A31] bg-[#F5F3EC] dark:bg-[#102A23] placeholder:text-[#94A3A0] dark:placeholder:text-[#64706A] text-xs focus:ring-[#0F766E]"
              />
            )}

            <Select
              label="Maintenance Classification *"
              value={formData.maintenance_type}
              onChange={e => setFormData({ ...formData, maintenance_type: e.target.value })}
              options={[
                { value: 'Preventive', label: 'Preventive — Routine Maintenance (Cleaning / Updates)' },
                { value: 'Corrective', label: 'Corrective — Hardware Repair / Component Replacement' },
                { value: 'Predictive', label: 'Predictive — AI Diagnostic Risk Triggered Service' },
              ]}
              className="rounded-xl border-[#E5E1D8] dark:border-[#1D3A31] bg-[#F5F3EC] dark:bg-[#102A23] text-xs focus:ring-[#0F766E]"
            />

            <Input
              label="Date Performed *"
              type="date"
              value={formData.performed_date}
              onChange={e => setFormData({ ...formData, performed_date: e.target.value })}
              required
              className="rounded-xl border-[#E5E1D8] dark:border-[#1D3A31] bg-[#F5F3EC] dark:bg-[#102A23] text-xs focus:ring-[#0F766E]"
            />

            <Input
              label="Parts Replaced / Upgraded"
              placeholder="e.g. Replaced 512GB SSD, new 65W power brick (leave blank if none)"
              value={formData.parts_replaced}
              onChange={e => setFormData({ ...formData, parts_replaced: e.target.value })}
              className="rounded-xl border-[#E5E1D8] dark:border-[#1D3A31] bg-[#F5F3EC] dark:bg-[#102A23] placeholder:text-[#94A3A0] dark:placeholder:text-[#64706A] text-xs focus:ring-[#0F766E]"
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#17211D] dark:text-[#F3F7F5]">
                Service Notes & Diagnostic Summary <span className="text-[#DC2626]">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Describe work performed, thermal readings, BIOS/firmware versions, test results, and final verification status..."
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                required
                className="w-full px-3 py-2.5 rounded-xl border border-[#E5E1D8] dark:border-[#1D3A31] bg-[#F5F3EC] dark:bg-[#102A23] text-[#17211D] dark:text-[#F3F7F5] text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#0F766E] focus:border-transparent placeholder:text-[#94A3A0] dark:placeholder:text-[#64706A] resize-none transition-all"
              />
            </div>

            <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#E5E1D8] dark:border-[#1D3A31]">
              <Link to="/maintenance/history">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs border-[#E5E1D8] dark:border-[#1D3A31] text-[#64706A] dark:text-[#94A3A0]"
                >
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                loading={loading}
                className="text-xs gap-1.5 bg-[#123C32] hover:bg-[#0B1F1A] dark:bg-[#34D399] dark:text-[#07130F] dark:hover:bg-[#34D399]/90 text-white font-bold px-5 py-2.5 rounded-xl"
              >
                <Wrench className="w-4 h-4" /> Save Maintenance Log
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </MainLayout>
  )
}
