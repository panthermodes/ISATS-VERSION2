import React from 'react'
import clsx from 'clsx'
import { motion, HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'success' | 'cyan'
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg'

export interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: ButtonVariant
  size?: ButtonSize
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children?: React.ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-[#2563EB] text-white hover:bg-[#1D4ED8] focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2 dark:focus:ring-offset-[#07111F] shadow-sm hover:shadow-md hover:shadow-blue-500/20 active:bg-[#1E40AF]',
  secondary:
    'bg-slate-100 dark:bg-[#101D2E] text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-[#152438] border border-slate-200 dark:border-[#1E293B] focus:ring-2 focus:ring-slate-300 dark:focus:ring-slate-700',
  danger:
    'bg-[#EF4444] text-white hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-[#07111F] shadow-sm hover:shadow-red-500/20',
  ghost:
    'bg-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#101D2E] focus:ring-2 focus:ring-slate-400',
  outline:
    'bg-transparent border border-slate-200 dark:border-[#1E293B] text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#101D2E] focus:ring-2 focus:ring-[#2563EB]',
  success:
    'bg-[#10B981] text-white hover:bg-emerald-600 focus:ring-2 focus:ring-emerald-500 shadow-sm hover:shadow-emerald-500/20',
  cyan:
    'bg-[#06B6D4] text-white hover:bg-cyan-600 focus:ring-2 focus:ring-cyan-500 shadow-sm hover:shadow-cyan-500/20',
}

const sizeClasses: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-xs rounded-md gap-1',
  sm: 'px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5',
  md: 'px-4 py-2 text-sm font-medium rounded-lg gap-2',
  lg: 'px-5 py-2.5 text-base font-semibold rounded-xl gap-2.5',
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        disabled={disabled || loading}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        transition={{ duration: 0.1 }}
        className={clsx(
          'inline-flex items-center justify-center select-none font-heading font-semibold',
          'focus:outline-none transition-colors duration-150',
          'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin w-4 h-4 shrink-0" />
        ) : (
          leftIcon && <span className="shrink-0 flex items-center">{leftIcon}</span>
        )}
        {children && <span>{children}</span>}
        {!loading && rightIcon && (
          <span className="shrink-0 flex items-center">{rightIcon}</span>
        )}
      </motion.button>
    )
  }
)
Button.displayName = 'Button'
