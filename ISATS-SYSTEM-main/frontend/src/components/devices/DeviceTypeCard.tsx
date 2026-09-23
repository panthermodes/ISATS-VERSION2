import React from 'react'
import { Check } from 'lucide-react'
import { DeviceTypeIcon } from './DeviceTypeIcon'
import { DeviceQuantityInput } from './DeviceQuantityInput'

export interface DeviceItemProps {
  id?: number | string
  code: string
  name: string
  description?: string
  category_name?: string
  category_slug?: string
  icon?: string
  is_custom?: boolean
  is_enabled?: boolean
}

interface DeviceTypeCardProps {
  device: DeviceItemProps
  quantity: number
  isSelected: boolean
  onToggle: (selected: boolean) => void
  onQuantityChange: (qty: number) => void
}

export function DeviceTypeCard({
  device,
  quantity,
  isSelected,
  onToggle,
  onQuantityChange,
}: DeviceTypeCardProps) {
  const handleCardClick = () => {
    const nextSelected = !isSelected
    onToggle(nextSelected)
    if (nextSelected && quantity <= 0) {
      onQuantityChange(1)
    }
  }

  return (
    <div
      onClick={handleCardClick}
      className={`group relative flex flex-col justify-between p-4 rounded-2xl border transition-all duration-200 cursor-pointer select-none text-left ${
        isSelected
          ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500/40'
          : 'bg-white dark:bg-[#101D2E] border-slate-200 dark:border-[#1E293B] hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm'
      }`}
    >
      {/* Top Row: Icon + Checkbox + Custom Badge */}
      <div className="flex items-start justify-between gap-3 mb-2.5">
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            isSelected
              ? 'bg-[#2563EB] text-white shadow-md shadow-blue-600/30'
              : 'bg-slate-100 dark:bg-[#0B1728] text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-white'
          }`}
        >
          <DeviceTypeIcon slugOrIcon={device.icon || device.category_slug || device.code} className="w-4 h-4" />
        </div>

        <div className="flex items-center gap-2">
          {device.is_custom && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-semibold tracking-wide">
              Custom
            </span>
          )}

          <div
            className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
              isSelected
                ? 'bg-[#2563EB] border-[#2563EB] text-white'
                : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-[#0B1728] text-transparent group-hover:border-slate-400 dark:group-hover:border-slate-600'
            }`}
          >
            <Check className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* Center: Device Info */}
      <div className="flex-1 min-w-0 mb-3">
        <h4 className="text-xs font-bold text-slate-900 dark:text-white tracking-tight truncate group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
          {device.name}
        </h4>
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
          {device.description || 'Standard enterprise hardware component'}
        </p>
      </div>

      {/* Bottom: Selection Status & Quantity */}
      <div className="pt-2.5 border-t border-slate-100 dark:border-[#1E293B] flex items-center justify-between gap-2">
        <span
          className={`text-[11px] font-semibold transition-colors ${
            isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'
          }`}
        >
          {isSelected ? '✓ Selected' : 'Not Selected'}
        </span>

        {isSelected ? (
          <div onClick={(e) => e.stopPropagation()}>
            <DeviceQuantityInput
              size="sm"
              value={quantity}
              onChange={(q) => {
                onQuantityChange(q)
                if (q <= 0) onToggle(false)
              }}
            />
          </div>
        ) : (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Qty: 0</span>
        )}
      </div>
    </div>
  )
}
