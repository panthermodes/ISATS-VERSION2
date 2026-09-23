import React from 'react'
import clsx from 'clsx'

export type SkeletonVariant = 'text' | 'circle' | 'rect' | 'table' | 'device-card' | 'kpi' | 'chart'

interface SkeletonProps {
  variant?: SkeletonVariant
  count?: number
  className?: string
  height?: string
  width?: string
}

function SkeletonBase({
  className,
  style,
}: {
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <div
      className={clsx(
        'animate-pulse bg-slate-200/80 dark:bg-[#1E293B] rounded-lg',
        className
      )}
      style={style}
    />
  )
}

export function Skeleton({
  variant = 'text',
  count = 1,
  className,
  height,
  width,
}: SkeletonProps) {
  const style = {
    height: height,
    width: width,
  }

  if (variant === 'circle') {
    return (
      <SkeletonBase
        className={clsx('rounded-full w-10 h-10 shrink-0', className)}
        style={style}
      />
    )
  }

  if (variant === 'rect') {
    return (
      <SkeletonBase
        className={clsx('rounded-xl', height ? '' : 'h-32 w-full', className)}
        style={style}
      />
    )
  }

  if (variant === 'device-card') {
    return (
      <div className={clsx('grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4', className)}>
        {Array.from({ length: count || 6 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-2xl border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#101D2E] space-y-3"
          >
            <div className="flex items-center justify-between">
              <SkeletonBase className="w-10 h-10 rounded-xl" />
              <SkeletonBase className="w-16 h-5 rounded-full" />
            </div>
            <SkeletonBase className="w-3/4 h-5" />
            <SkeletonBase className="w-full h-3" />
            <div className="pt-2 border-t border-slate-100 dark:border-[#1E293B]/60 flex justify-between items-center">
              <SkeletonBase className="w-16 h-4" />
              <SkeletonBase className="w-20 h-7 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'kpi') {
    return (
      <div className={clsx('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4', className)}>
        {Array.from({ length: count || 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#101D2E] space-y-3"
          >
            <div className="flex justify-between items-center">
              <SkeletonBase className="w-10 h-10 rounded-xl" />
              <SkeletonBase className="w-12 h-4 rounded-full" />
            </div>
            <SkeletonBase className="w-24 h-7" />
            <SkeletonBase className="w-32 h-4" />
          </div>
        ))}
      </div>
    )
  }

  if (variant === 'chart') {
    return (
      <div
        className={clsx(
          'p-5 rounded-2xl border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#101D2E] space-y-4',
          className
        )}
      >
        <div className="flex justify-between items-center">
          <SkeletonBase className="w-36 h-5" />
          <SkeletonBase className="w-20 h-5" />
        </div>
        <SkeletonBase className={clsx('w-full rounded-xl', height || 'h-52')} />
      </div>
    )
  }

  if (variant === 'table') {
    return (
      <div className={clsx('space-y-3 p-4 rounded-2xl border border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#101D2E]', className)}>
        <div className="flex gap-4 pb-3 border-b border-slate-100 dark:border-[#1E293B]">
          <SkeletonBase className="h-4 w-24" />
          <SkeletonBase className="h-4 flex-1" />
          <SkeletonBase className="h-4 w-28" />
          <SkeletonBase className="h-4 w-20" />
        </div>
        {Array.from({ length: count || 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-1">
            <SkeletonBase className="h-4 w-20" />
            <SkeletonBase className="h-4 flex-1" />
            <SkeletonBase className="h-4 w-28" />
            <SkeletonBase className="h-4 w-16" />
          </div>
        ))}
      </div>
    )
  }

  // default: text
  return (
    <div className={clsx('space-y-2', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonBase
          key={i}
          className={clsx(
            'h-4',
            i === count - 1 && count > 1 ? 'w-3/4' : 'w-full'
          )}
          style={style}
        />
      ))}
    </div>
  )
}
