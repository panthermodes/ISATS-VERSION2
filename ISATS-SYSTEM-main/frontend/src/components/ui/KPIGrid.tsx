import React from 'react'
import { motion } from 'framer-motion'
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter'
import { Card } from './Card'
import { Badge } from './Badge'
import { staggerContainer, cardVariants } from '@/theme/animations'

export interface KPICardItem {
  id: string | number
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  comparisonPeriod?: string
  icon: React.ComponentType<{ className?: string }>
  statusBadge?: string
  badgeVariant?: 'success' | 'warning' | 'danger' | 'info'
}

interface KPIGridProps {
  items: KPICardItem[]
  columns?: 2 | 3 | 4
}

function KPICard({ item }: { item: KPICardItem }) {
  const Icon = item.icon
  const animatedValue = useAnimatedCounter(item.value)

  return (
    <motion.div variants={cardVariants}>
      <Card hover className="space-y-3 p-5">
        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
          <span className="text-xs font-semibold uppercase tracking-wider">{item.title}</span>
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
          {animatedValue}
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1">
          {item.change && (
            <span
              className={
                item.trend === 'up'
                  ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
                  : item.trend === 'down'
                  ? 'text-rose-600 dark:text-rose-400 font-semibold'
                  : 'text-slate-500'
              }
            >
              {item.trend === 'up' ? '↑ ' : item.trend === 'down' ? '↓ ' : ''}
              {item.change}
            </span>
          )}
          {item.comparisonPeriod && <span>{item.comparisonPeriod}</span>}
          {item.statusBadge && (
            <Badge variant={item.badgeVariant || 'info'} size="xs">
              {item.statusBadge}
            </Badge>
          )}
        </div>
      </Card>
    </motion.div>
  )
}

export function KPIGrid({ items, columns = 4 }: KPIGridProps) {
  const colClass = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  }[columns]

  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={`grid ${colClass} gap-4 sm:gap-5`}
    >
      {items.map((item) => (
        <KPICard key={item.id} item={item} />
      ))}
    </motion.div>
  )
}
