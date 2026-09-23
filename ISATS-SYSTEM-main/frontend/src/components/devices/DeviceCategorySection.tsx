import React, { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { DeviceTypeIcon } from './DeviceTypeIcon'
import { DeviceTypeCard, DeviceItemProps } from './DeviceTypeCard'
import { Badge } from '@/components/ui/Badge'

interface CategorySectionProps {
  category: {
    id?: number | string
    name: string
    slug: string
    icon?: string
    description?: string
    types: DeviceItemProps[]
  }
  selectedDevices: Record<string, number>
  onToggleDevice: (code: string, selected: boolean) => void
  onQuantityChange: (code: string, qty: number) => void
  defaultOpen?: boolean
}

export function DeviceCategorySection({
  category,
  selectedDevices,
  onToggleDevice,
  onQuantityChange,
  defaultOpen = true,
}: CategorySectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  // Count how many devices in this category are selected
  const selectedCount = category.types.filter(
    (t) => (selectedDevices[t.code] || 0) > 0
  ).length

  return (
    <div className="rounded-2xl bg-white dark:bg-[#101D2E] border border-slate-200 dark:border-[#1E293B] overflow-hidden shadow-card transition-all">
      {/* Category Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 sm:px-5 py-3.5 bg-slate-50/70 dark:bg-[#0B1728]/70 hover:bg-slate-100/70 dark:hover:bg-[#152438]/70 transition-colors text-left border-b border-slate-200/70 dark:border-[#1E293B]/70"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
            <DeviceTypeIcon slugOrIcon={category.icon || category.slug} className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                {category.name}
              </h3>
              {selectedCount > 0 && (
                <Badge variant="assigned" size="xs">
                  {selectedCount} selected
                </Badge>
              )}
            </div>
            {category.description && (
              <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5 hidden sm:block">
                {category.description}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            {category.types.length} {category.types.length === 1 ? 'type' : 'types'}
          </span>
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </div>
      </button>

      {/* Grid of Device Cards */}
      {isOpen && (
        <div className="p-4 sm:p-5 bg-slate-50/20 dark:bg-transparent">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {category.types.map((device) => {
              const qty = selectedDevices[device.code] || 0
              const isSelected = qty > 0

              return (
                <DeviceTypeCard
                  key={device.code}
                  device={device}
                  quantity={qty}
                  isSelected={isSelected}
                  onToggle={(selected) => onToggleDevice(device.code, selected)}
                  onQuantityChange={(newQty) => onQuantityChange(device.code, newQty)}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
