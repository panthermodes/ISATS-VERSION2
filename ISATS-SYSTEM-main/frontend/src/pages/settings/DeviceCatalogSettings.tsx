import React, { useState, useEffect } from 'react'
import {
  Cpu, Plus, Search, CheckCircle2, XCircle, AlertTriangle,
  Layers, Sliders, RefreshCw, Box, Shield
} from 'lucide-react'
import { OrganizationLayout } from '@/layouts/OrganizationLayout'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StatCard } from '@/components/ui/StatCard'
import { Skeleton } from '@/components/ui/Skeleton'
import { useToast } from '@/context/ToastContext'
import { DeviceTypeIcon } from '@/components/devices/DeviceTypeIcon'
import { CustomDeviceModal, CustomDevicePayload } from '@/components/devices/CustomDeviceModal'

interface OrgDeviceItem {
  id: number
  name: string
  code: string
  category_name: string
  category_slug: string
  icon?: string
  description?: string
  is_custom: boolean
  is_enabled: boolean
  declared_quantity: number
  registered_count: number
  unregistered_count: number
  manufacturer?: string
  model_family?: string
  notes?: string
}

interface SummaryData {
  total_device_types: number
  standard_types_count: number
  custom_types_count: number
  enabled_types_count: number
  disabled_types_count: number
  total_declared_assets: number
  total_registered_assets: number
  total_unregistered_assets: number
  categories_breakdown: Record<string, { declared: number; registered: number }>
}

export default function DeviceCatalogSettings() {
  const toast = useToast()
  const [devices, setDevices] = useState<OrgDeviceItem[]>([])
  const [summary, setSummary] = useState<SummaryData | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterTab, setFilterTab] = useState<'all' | 'standard' | 'custom' | 'disabled'>('all')
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false)
  const [categoriesList, setCategoriesList] = useState<any[]>([])

  const loadCatalogData = () => {
    setLoading(true)
    Promise.all([
      fetch('/api/organization/device-types/?include_disabled=true').then((r) => r.json()),
      fetch('/api/organization/device-catalog/summary/').then((r) => r.json()),
      fetch('/api/device-catalog/categories/').then((r) => r.json()),
    ])
      .then(([typesRes, sumRes, catRes]) => {
        if (typesRes.success) setDevices(typesRes.data || [])
        if (sumRes.success) setSummary(sumRes.data || null)
        if (catRes.success) setCategoriesList(catRes.data || [])
      })
      .catch((err) => {
        toast.error('Failed to load device catalog')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadCatalogData()
  }, [])

  const handleToggleDevice = async (dev: OrgDeviceItem) => {
    try {
      const res = await fetch(`/api/organization/device-types/${dev.id}/toggle/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_enabled: !dev.is_enabled }),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(json.message)
        loadCatalogData()
      } else {
        toast.error(json.error || 'Failed to update device status')
      }
    } catch {
      toast.error('Network error updating device status')
    }
  }

  const handleAddCustom = async (payload: CustomDevicePayload) => {
    try {
      const res = await fetch('/api/organization/device-types/custom/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (json.success) {
        toast.success(`Custom device '${payload.name}' added to your catalog.`)
        loadCatalogData()
      } else {
        throw new Error(json.error || 'Failed to add custom device type')
      }
    } catch (err: any) {
      toast.error(err.message || 'Error saving custom device')
      throw err
    }
  }

  const filteredDevices = devices.filter((d) => {
    const q = search.toLowerCase().trim()
    const matchesSearch =
      !q ||
      d.name.toLowerCase().includes(q) ||
      d.code.toLowerCase().includes(q) ||
      d.category_name.toLowerCase().includes(q)

    if (!matchesSearch) return false
    if (filterTab === 'standard') return !d.is_custom && d.is_enabled
    if (filterTab === 'custom') return d.is_custom && d.is_enabled
    if (filterTab === 'disabled') return !d.is_enabled
    return true
  })

  return (
    <OrganizationLayout pageTitle="ICT Device Catalog">
      <PageHeader
        title="ICT Device Catalog & Configuration"
        subtitle="Manage standard hardware taxonomy, custom equipment types, and inventory reconciliation"
        breadcrumbs={[{ label: 'Settings', href: '/settings' }, { label: 'Device Catalog' }]}
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={loadCatalogData}
              leftIcon={<RefreshCw className="w-4 h-4" />}
            >
              Refresh
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCustomModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Add Custom Device
            </Button>
          </div>
        }
      />

      <div className="space-y-6 text-left">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Total Device Types"
            value={summary?.total_device_types || devices.length}
            icon={<Cpu />}
            colorVariant="blue"
          />
          <StatCard
            title="Standard Types"
            value={summary?.standard_types_count || devices.filter((d) => !d.is_custom).length}
            icon={<Layers />}
            colorVariant="purple"
          />
          <StatCard
            title="Custom Types"
            value={summary?.custom_types_count || devices.filter((d) => d.is_custom).length}
            icon={<Sliders />}
            colorVariant="orange"
          />
          <StatCard
            title="Declared Assets"
            value={(summary?.total_declared_assets || 0).toLocaleString()}
            icon={<Box />}
            colorVariant="green"
          />
          <StatCard
            title="Unregistered Gap"
            value={(summary?.total_unregistered_assets || 0).toLocaleString()}
            icon={<AlertTriangle />}
            colorVariant="red"
          />
        </div>

        {/* Reconciliation Notice Banner */}
        {summary && summary.total_unregistered_assets > 0 && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-amber-300 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Device Reconciliation Alert:</strong> Your organization declared an estimated{' '}
              <strong>{summary.total_declared_assets.toLocaleString()}</strong> hardware units during setup, but only{' '}
              <strong>{summary.total_registered_assets.toLocaleString()}</strong> individual assets are registered. There are{' '}
              <strong>{summary.total_unregistered_assets.toLocaleString()}</strong> unregistered units pending asset tagging and QR assignment.
            </div>
          </div>
        )}

        {/* Category Breakdown Chips */}
        {summary?.categories_breakdown && Object.keys(summary.categories_breakdown).length > 0 && (
          <Card title="Hardware Distribution by Category">
            <div className="flex flex-wrap gap-2.5 mt-2">
              {Object.entries(summary.categories_breakdown).map(([catName, stats]) => (
                <div
                  key={catName}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-[#07111F] border border-slate-200 dark:border-[#1E293B] text-xs text-slate-700 dark:text-slate-300"
                >
                  <DeviceTypeIcon slugOrIcon={catName} className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="font-semibold text-slate-900 dark:text-white">{catName}:</span>
                  <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">{stats.declared} declared</span>
                  <span className="text-slate-400 font-mono">({stats.registered} tagged)</span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Catalog Table Card */}
        <Card>
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#1E293B]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search catalog by name, code, category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-[#07111F] border border-slate-200 dark:border-[#1E293B] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto">
              {[
                { id: 'all', label: 'All Types' },
                { id: 'standard', label: 'Standard' },
                { id: 'custom', label: 'Custom' },
                { id: 'disabled', label: 'Disabled' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    filterTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-[#0B1728] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="py-8">
              <Skeleton variant="table" count={6} />
            </div>
          ) : filteredDevices.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Box className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No device types match your criteria</p>
              <p className="text-xs text-slate-400">Try adjusting your search query or add a new custom hardware type.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300 mt-2">
                <thead className="text-[11px] uppercase tracking-wider text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-[#0B1728] border-b border-slate-200 dark:border-[#1E293B]">
                  <tr>
                    <th className="py-3 px-4">Hardware Type</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-center">Type Class</th>
                    <th className="py-3 px-4 text-center">Declared Qty</th>
                    <th className="py-3 px-4 text-center">Tagged Assets</th>
                    <th className="py-3 px-4 text-center">Unregistered</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1E293B]/60">
                  {filteredDevices.map((dev) => (
                    <tr key={dev.id} className="hover:bg-slate-50 dark:hover:bg-[#152438]/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                            <DeviceTypeIcon slugOrIcon={dev.icon || dev.category_slug} className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs">{dev.name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{dev.code}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{dev.category_name}</td>

                      <td className="py-3 px-4 text-center">
                        {dev.is_custom ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold">
                            Custom
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold">
                            Standard
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-slate-900 dark:text-white font-mono">
                        {dev.declared_quantity}
                      </td>

                      <td className="py-3 px-4 text-center font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        {dev.registered_count}
                      </td>

                      <td className="py-3 px-4 text-center font-bold font-mono">
                        {dev.unregistered_count > 0 ? (
                          <span className="text-amber-600 dark:text-amber-400">+{dev.unregistered_count}</span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-center">
                        {dev.is_enabled ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Enabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-semibold">
                            <XCircle className="w-3.5 h-3.5" /> Disabled
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <Button
                          variant={dev.is_enabled ? 'danger' : 'secondary'}
                          size="xs"
                          onClick={() => handleToggleDevice(dev)}
                        >
                          {dev.is_enabled ? 'Disable' : 'Enable'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <CustomDeviceModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onSave={handleAddCustom}
        categories={categoriesList}
      />
    </OrganizationLayout>
  )
}
