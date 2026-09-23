import React from 'react'
import { Edit2, CheckCircle2, Box } from 'lucide-react'
import { DeviceTypeIcon } from './DeviceTypeIcon'

interface SelectedItem {
  code: string
  name: string
  category: string
  quantity: number
  is_custom?: boolean
}

interface SelectedDevicesSummaryProps {
  selectedMap: Record<string, number>
  catalogue: Array<{
    name: string
    slug: string
    icon?: string
    types: Array<{ code: string; name: string; is_custom?: boolean }>
  }>
  customDevices?: Array<{
    name: string
    category: string
    default_quantity?: number
  }>
  onEdit?: () => void
}

export function SelectedDevicesSummary({
  selectedMap,
  catalogue,
  customDevices = [],
  onEdit,
}: SelectedDevicesSummaryProps) {
  // Group selected items by category
  const grouped: Record<string, SelectedItem[]> = {}

  catalogue.forEach((cat) => {
    cat.types.forEach((t) => {
      const qty = selectedMap[t.code] || 0
      if (qty > 0) {
        if (!grouped[cat.name]) grouped[cat.name] = []
        grouped[cat.name].push({
          code: t.code,
          name: t.name,
          category: cat.name,
          quantity: qty,
          is_custom: false,
        })
      }
    })
  })

  // Add custom devices
  customDevices.forEach((cd) => {
    const qty = cd.default_quantity || selectedMap[cd.name] || 0
    if (qty > 0) {
      const catKey = 'Custom Organization Hardware'
      if (!grouped[catKey]) grouped[catKey] = []
      grouped[catKey].push({
        code: cd.name,
        name: cd.name,
        category: catKey,
        quantity: qty,
        is_custom: true,
      })
    }
  })

  const categoryNames = Object.keys(grouped)
  const totalHardwareUnits = Object.values(grouped)
    .flat()
    .reduce((sum, item) => sum + item.quantity, 0)
  const totalSelectedTypes = Object.values(grouped).flat().length

  if (categoryNames.length === 0) {
    return (
      <div className="p-6 rounded-2xl bg-white dark:bg-[#101D2E] border border-slate-200 dark:border-[#1E293B] text-center space-y-2">
        <Box className="w-8 h-8 text-slate-400 mx-auto" />
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No ICT devices declared yet</p>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Hardware counts can also be configured later in Organization Settings.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 text-left">
      {/* Overview Header */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Your Declared ICT Environment
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {totalSelectedTypes} device types selected • {totalHardwareUnits.toLocaleString()} estimated units
          </p>
        </div>

        {onEdit && (
          <button
            type="button"
            onClick={onEdit}
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit Catalog</span>
          </button>
        )}
      </div>

      {/* Categorized Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {categoryNames.map((catName) => {
          const items = grouped[catName]
          const catTotal = items.reduce((acc, i) => acc + i.quantity, 0)

          return (
            <div
              key={catName}
              className="p-4 rounded-2xl bg-white dark:bg-[#101D2E] border border-slate-200 dark:border-[#1E293B] space-y-2.5 shadow-card"
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-2">
                <div className="flex items-center gap-2">
                  <DeviceTypeIcon slugOrIcon={catName} className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{catName}</span>
                </div>
                <span className="text-[11px] font-mono text-blue-600 dark:text-blue-400 font-bold">
                  {catTotal} units
                </span>
              </div>

              <div className="space-y-1.5">
                {items.map((item) => (
                  <div
                    key={item.code}
                    className="flex items-center justify-between text-xs py-1 px-2.5 rounded-lg bg-slate-50 dark:bg-[#07111F] border border-slate-100 dark:border-[#1E293B]/50"
                  >
                    <span className="text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
                      {item.name}
                      {item.is_custom && (
                        <span className="ml-1.5 text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold border border-amber-500/20">
                          Custom
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">{item.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
