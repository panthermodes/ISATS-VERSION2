import React from 'react'
import clsx from 'clsx'

export type BadgeVariant =
  | 'primary'
  | 'active'
  | 'available'
  | 'assigned'
  | 'maintenance'
  | 'retired'
  | 'disabled'
  | 'critical'
  | 'pending'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'neutral'
  | 'cyan'
  | 'purple'

export type BadgeSize = 'xs' | 'sm' | 'md'

export interface BadgeProps {
  variant?: BadgeVariant
  size?: BadgeSize
  dot?: boolean
  children: React.ReactNode
  className?: string
}

const variantStyles: Record<BadgeVariant, { bg: string; text: string; border: string; dot: string }> = {
  primary: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-500/25',
    dot: 'bg-blue-600',
  },
  active: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/25',
    dot: 'bg-emerald-500',
  },
  available: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/25',
    dot: 'bg-emerald-500',
  },
  success: {
    bg: 'bg-emerald-500/10 dark:bg-emerald-500/15',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-500/25',
    dot: 'bg-emerald-500',
  },
  assigned: {
    bg: 'bg-blue-500/10 dark:bg-blue-500/15',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-500/25',
    dot: 'bg-blue-600',
  },
  info: {
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    text: 'text-cyan-700 dark:text-cyan-400',
    border: 'border-cyan-500/25',
    dot: 'bg-cyan-500',
  },
  cyan: {
    bg: 'bg-cyan-500/10 dark:bg-cyan-500/15',
    text: 'text-cyan-700 dark:text-cyan-400',
    border: 'border-cyan-500/25',
    dot: 'bg-cyan-500',
  },
  maintenance: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-500/25',
    dot: 'bg-amber-500',
  },
  pending: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-500/25',
    dot: 'bg-amber-500',
  },
  warning: {
    bg: 'bg-amber-500/10 dark:bg-amber-500/15',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-500/25',
    dot: 'bg-amber-500',
  },
  critical: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-500/25',
    dot: 'bg-rose-500',
  },
  danger: {
    bg: 'bg-rose-500/10 dark:bg-rose-500/15',
    text: 'text-rose-700 dark:text-rose-400',
    border: 'border-rose-500/25',
    dot: 'bg-rose-500',
  },
  retired: {
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/20',
    dot: 'bg-slate-500',
  },
  disabled: {
    bg: 'bg-slate-500/10 dark:bg-slate-500/15',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-500/20',
    dot: 'bg-slate-500',
  },
  neutral: {
    bg: 'bg-slate-100 dark:bg-[#1E293B]',
    text: 'text-slate-700 dark:text-slate-300',
    border: 'border-slate-200 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  purple: {
    bg: 'bg-purple-500/10 dark:bg-purple-500/15',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-500/25',
    dot: 'bg-purple-500',
  },
}

const sizeStyles: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-[10px] gap-1',
  sm: 'px-2 py-0.5 text-xs gap-1.5',
  md: 'px-2.5 py-1 text-xs gap-1.5 font-medium',
}

export function Badge({
  variant = 'neutral',
  size = 'sm',
  dot = false,
  children,
  className,
}: BadgeProps) {
  const normVariant = (variant.toLowerCase() as BadgeVariant) in variantStyles
    ? (variant.toLowerCase() as BadgeVariant)
    : 'neutral'

  const style = variantStyles[normVariant]

  return (
    <span
      className={clsx(
        'inline-flex items-center rounded-full font-semibold border select-none',
        style.bg,
        style.text,
        style.border,
        sizeStyles[size],
        className
      )}
    >
      {dot && <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0 animate-pulse', style.dot)} />}
      <span>{children}</span>
    </span>
  )
}
