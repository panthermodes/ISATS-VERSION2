import React, { useState, useEffect } from 'react'
import { Select } from '@/components/ui/Select'
import { Loader2 } from 'lucide-react'

export interface OrgDeviceTypeOption {
  id: number
  name: string
  code: string
  category_name?: string
  is_custom?: boolean
  declared_quantity?: number
}

interface AssetDeviceTypeSelectProps {
  value?: string | number
  onChange: (e: { target: { value: string } }) => void
  onSelectDevice?: (device: OrgDeviceTypeOption | null) => void
  error?: string
  required?: boolean
  disabled?: boolean
  label?: string
}

export function AssetDeviceTypeSelect({
  value,
  onChange,
  onSelectDevice,
  error,
  required = true,
  disabled = false,
  label = 'Device Type *',
}: AssetDeviceTypeSelectProps) {
  const [deviceTypes, setDeviceTypes] = useState<OrgDeviceTypeOption[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/organization/device-types/')
      .then((res) => res.json())
      .then((res) => {
        if (res.success && Array.isArray(res.data)) {
          setDeviceTypes(res.data)
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e)
    if (onSelectDevice) {
      const selectedId = Number(e.target.value)
      const found = deviceTypes.find((d) => d.id === selectedId) || null
      onSelectDevice(found)
    }
  }

  const options = [
    { value: '', label: loading ? 'Loading organization device types...' : 'Select Device Type from Catalog' },
    ...deviceTypes.map((d) => ({
      value: String(d.id),
      label: `${d.name} (${d.category_name || 'Standard'})${d.is_custom ? ' [Custom]' : ''}`,
    })),
  ]

  return (
    <div className="relative">
      <Select
        label={label}
        value={value ? String(value) : ''}
        onChange={handleChange as any}
        options={options}
        error={error}
        required={required}
        disabled={disabled || loading}
      />
      {loading && (
        <div className="absolute right-3 top-8 pointer-events-none text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      )}
    </div>
  )
}
