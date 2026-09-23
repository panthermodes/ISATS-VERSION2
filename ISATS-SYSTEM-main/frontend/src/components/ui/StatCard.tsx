import React from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import { cardVariants } from '@/theme/animations'
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter'

export type ColorVariant = 'blue' | 'green' | 'orange' | 'red' | 'purple' | 'cyan'

export interface StatCardProps {
  title: string
  value: string | number
  icon: React.ReactNode
  trend?: { value: number; direction: 'up' | 'down' | 'neutral' }
  colorVariant?: ColorVariant
  subtitle?: string
  className?: string
}

const lightBg: Record<ColorVariant, string> = {
  blue:   'bg-blue-500/10 text-[#2563EB]',
  green:  'bg-emerald-500/10 text-[#10B981]',
  orange: 'bg-amber-500/10 text-[#F59E0B]',
  red:    'bg-rose-500/10 text-[#EF4444]',
  purple: 'bg-purple-500/10 text-purple-500',
  cyan:   'bg-cyan-500/10 text-[#06B6D4]',
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  colorVariant = 'blue',
  subtitle,
  className,
}: StatCardProps) {
  const animatedValue = useAnimatedCounter(value)

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className={clsx(
        'p-5 rounded-2xl bg-white dark:bg-[#101D2E] text-slate-900 dark:text-slate-100',
        'border border-slate-200 dark:border-[#1E293B] shadow-card hover:shadow-md transition-all',
        className
      )}
    >
      <div className="flex items-center justify-between mb-3">
        <div className={clsx('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', lightBg[colorVariant])}>
          <div className="w-5 h-5 flex items-center justify-center">{icon}</div>
        </div>
        {trend && (
          <span
            className={clsx(
              'text-xs font-semibold px-2 py-0.5 rounded-full border select-none',
              trend.direction === 'up'
                ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                : trend.direction === 'down'
                ? 'text-rose-700 dark:text-rose-400 bg-rose-500/10 border-rose-500/20'
                : 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
            )}
          >
            {trend.direction === 'up' ? '↑ ' : trend.direction === 'down' ? '↓ ' : '→ '}
            {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      <p className="font-heading text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
        {animatedValue}
      </p>
      <p className="font-heading text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
      {subtitle && <p className="font-primary text-[11px] text-slate-400 dark:text-slate-500 mt-1">{subtitle}</p>}
    </motion.div>
  )
}
