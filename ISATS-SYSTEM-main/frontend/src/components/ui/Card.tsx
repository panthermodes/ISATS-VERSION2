import React from 'react'
import clsx from 'clsx'

export interface CardProps {
  title?: string
  subtitle?: string
  actions?: React.ReactNode
  children: React.ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

const paddingClasses = {
  none: '',
  sm: 'p-3.5',
  md: 'p-5 sm:p-6',
  lg: 'p-6 sm:p-8',
}

export function Card({
  title,
  subtitle,
  actions,
  children,
  className,
  padding = 'md',
  hover = false,
}: CardProps) {
  return (
    <div
      className={clsx(
        'bg-white dark:bg-[#101D2E] text-slate-900 dark:text-slate-100',
        'border border-slate-200 dark:border-[#1E293B] rounded-2xl shadow-card',
        paddingClasses[padding],
        hover && 'hover:border-[#2563EB]/40 hover:shadow-md dark:hover:border-[#2563EB]/50 transition-all duration-200 cursor-pointer',
        className
      )}
    >
      {(title || actions) && (
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            {title && (
              <h3 className="font-heading text-base sm:text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="font-primary text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
