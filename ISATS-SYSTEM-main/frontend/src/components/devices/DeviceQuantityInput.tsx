import React from 'react'
import { Plus, Minus } from 'lucide-react'

interface DeviceQuantityInputProps {
  value: number
  onChange: (val: number) => void
  min?: number
  max?: number
  size?: 'sm' | 'md'
  disabled?: boolean
  className?: string
}

export function DeviceQuantityInput({
  value = 0,
  onChange,
  min = 0,
  max = 99999,
  size = 'md',
  disabled = false,
  className = '',
}: DeviceQuantityInputProps) {
  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (disabled) return
    const next = Math.max(min, (Number(value) || 0) - 1)
    onChange(next)
  }

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (disabled) return
    const next = Math.min(max, (Number(value) || 0) + 1)
    onChange(next)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value
    if (raw === '') {
      onChange(0)
      return
    }
    const parsed = parseInt(raw, 10)
    if (isNaN(parsed)) return
    const sanitized = Math.max(min, Math.min(max, parsed))
    onChange(sanitized)
  }

  const isSmall = size === 'sm'

  return (
    <div
      className={`inline-flex items-center rounded-xl bg-slate-100 dark:bg-[#07111F] border border-slate-300 dark:border-[#1E293B] p-0.5 shadow-inner transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500/50'
      } ${className}`}
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={disabled || value <= min}
        onClick={handleDecrement}
        className={`${
          isSmall ? 'w-6 h-6' : 'w-7 h-7'
        } rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#1E293B] disabled:opacity-30 disabled:hover:bg-transparent transition-all`}
      >
        <Minus className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      </button>

      <input
        type="number"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={handleInputChange}
        className={`${
          isSmall ? 'w-10 text-xs' : 'w-14 text-sm'
        } bg-transparent text-center font-bold font-mono text-slate-900 dark:text-white focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`}
      />

      <button
        type="button"
        aria-label="Increase quantity"
        disabled={disabled || value >= max}
        onClick={handleIncrement}
        className={`${
          isSmall ? 'w-6 h-6' : 'w-7 h-7'
        } rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-[#1E293B] disabled:opacity-30 disabled:hover:bg-transparent transition-all`}
      >
        <Plus className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} />
      </button>
    </div>
  )
}
