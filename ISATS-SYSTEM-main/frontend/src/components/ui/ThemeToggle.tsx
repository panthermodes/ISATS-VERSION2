import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon, Sparkles, Check } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'
import clsx from 'clsx'

export interface ThemeToggleProps {
  variant?: 'compact' | 'segmented' | 'buttons' | 'switch' | 'icon'
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  className?: string
}

export function ThemeToggle({
  variant = 'buttons',
  size = 'md',
  showLabels = true,
  className = ''
}: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  // ─── 1. NICER BUTTONS VARIANT (Dual Tactile Buttons with Rich Accents) ─────────
  if (variant === 'buttons') {
    return (
      <div
        className={clsx(
          'inline-flex items-center gap-1.5 p-1 rounded-2xl',
          'bg-slate-100/90 dark:bg-[#0B1728] border border-slate-200 dark:border-[#1E293B]',
          'shadow-sm transition-all duration-200',
          className
        )}
        role="group"
        aria-label="Theme selection buttons"
      >
        {/* Light Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setTheme('light')}
          className={clsx(
            'relative flex items-center gap-2 rounded-xl transition-all duration-200 select-none font-semibold text-xs',
            size === 'sm' && 'px-2.5 py-1.5',
            size === 'md' && 'px-3.5 py-2',
            size === 'lg' && 'px-4 py-2.5 text-sm',
            !isDark
              ? 'bg-white text-slate-900 shadow-md shadow-slate-200/80 border border-slate-200/90 ring-1 ring-amber-400/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
          )}
          aria-pressed={!isDark}
        >
          <div
            className={clsx(
              'w-5 h-5 rounded-lg flex items-center justify-center transition-colors',
              !isDark ? 'bg-amber-100 text-amber-600' : 'text-slate-400'
            )}
          >
            <Sun className={clsx('w-3.5 h-3.5', !isDark && 'animate-[spin_12s_linear_infinite]')} />
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="font-bold">Light</span>
            {size !== 'sm' && (
              <span className="text-[10px] font-normal text-slate-400 mt-0.5">Crisp White</span>
            )}
          </div>
          {!isDark && (
            <motion.span
              layoutId="theme-active-dot"
              className="w-1.5 h-1.5 rounded-full bg-amber-500 ml-1 shadow-sm"
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            />
          )}
        </motion.button>

        {/* Dark Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setTheme('dark')}
          className={clsx(
            'relative flex items-center gap-2 rounded-xl transition-all duration-200 select-none font-semibold text-xs',
            size === 'sm' && 'px-2.5 py-1.5',
            size === 'md' && 'px-3.5 py-2',
            size === 'lg' && 'px-4 py-2.5 text-sm',
            isDark
              ? 'bg-[#101D2E] text-white shadow-lg shadow-black/20 border border-blue-500/40 ring-1 ring-blue-500/30'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/40 dark:hover:bg-white/5'
          )}
          aria-pressed={isDark}
        >
          <div
            className={clsx(
              'w-5 h-5 rounded-lg flex items-center justify-center transition-colors',
              isDark ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400'
            )}
          >
            <Moon className="w-3.5 h-3.5" />
          </div>
          <div className="flex flex-col text-left leading-none">
            <span className="font-bold">Dark</span>
            {size !== 'sm' && (
              <span className="text-[10px] font-normal text-slate-400 mt-0.5">Deep Navy</span>
            )}
          </div>
          {isDark && (
            <motion.span
              layoutId="theme-active-dot"
              className="w-1.5 h-1.5 rounded-full bg-blue-400 ml-1 shadow-sm shadow-blue-400/50"
              transition={{ type: 'spring', stiffness: 450, damping: 30 }}
            />
          )}
        </motion.button>
      </div>
    )
  }

  // ─── 2. SEGMENTED PILL (Linear / Apple Sliding Indicator) ─────────
  if (variant === 'segmented') {
    return (
      <div
        className={clsx(
          'relative inline-flex items-center p-1 rounded-2xl',
          'bg-slate-100 dark:bg-[#0B1728] border border-slate-200 dark:border-[#1E293B]',
          'shadow-inner transition-colors duration-200',
          className
        )}
        role="radiogroup"
        aria-label="Theme mode"
      >
        {/* Light Option */}
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={clsx(
            'relative z-10 flex items-center gap-1.5 rounded-xl font-semibold transition-all duration-150',
            size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs',
            !isDark
              ? 'text-slate-900 font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
          aria-checked={!isDark}
          role="radio"
        >
          <Sun className={clsx('w-3.5 h-3.5', !isDark ? 'text-amber-500' : 'text-slate-400')} />
          <span>Light</span>
          {!isDark && (
            <motion.div
              layoutId="theme-segmented-active"
              className="absolute inset-0 rounded-xl bg-white shadow-sm border border-slate-200/80 -z-10"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
        </button>

        {/* Dark Option */}
        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={clsx(
            'relative z-10 flex items-center gap-1.5 rounded-xl font-semibold transition-all duration-150',
            size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs',
            isDark
              ? 'text-white font-bold'
              : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          )}
          aria-checked={isDark}
          role="radio"
        >
          <Moon className={clsx('w-3.5 h-3.5', isDark ? 'text-blue-400' : 'text-slate-400')} />
          <span>Dark</span>
          {isDark && (
            <motion.div
              layoutId="theme-segmented-active"
              className="absolute inset-0 rounded-xl bg-[#101D2E] shadow-sm border border-blue-500/30 -z-10"
              transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            />
          )}
        </button>
      </div>
    )
  }

  // ─── 3. COMPACT PILL (High-End Navbar Toggle with Tactile Sliders) ────────
  if (variant === 'compact') {
    return (
      <div
        className={clsx(
          'relative inline-flex items-center p-0.5 rounded-full',
          'bg-slate-100/90 dark:bg-[#0E1A2C] border border-slate-200 dark:border-[#1E293B]',
          'shadow-inner transition-colors duration-200',
          className
        )}
        role="group"
        aria-label="Theme quick toggle"
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={clsx(
            'relative z-10 w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-150',
            !isDark ? 'text-amber-500' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
          )}
          title="Switch to Crisp White Theme"
          aria-label="Switch to Crisp White Theme"
        >
          <Sun className="w-3.5 h-3.5" />
          {!isDark && (
            <motion.div
              layoutId="theme-compact-indicator"
              className="absolute inset-0 rounded-full bg-white shadow-md border border-slate-200/90 ring-1 ring-amber-400/20 -z-10"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={clsx(
            'relative z-10 w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-150',
            isDark ? 'text-blue-400' : 'text-slate-400 hover:text-slate-600'
          )}
          title="Switch to Deep Navy Dark Mode"
          aria-label="Switch to Deep Navy Dark Mode"
        >
          <Moon className="w-3.5 h-3.5" />
          {isDark && (
            <motion.div
              layoutId="theme-compact-indicator"
              className="absolute inset-0 rounded-full bg-[#1A283D] shadow-md border border-blue-500/40 ring-1 ring-blue-500/20 -z-10"
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </button>
      </div>
    )
  }

  // ─── 4. SWITCH VARIANT (iOS / macOS Track) ─────────────────────────
  if (variant === 'switch') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={clsx(
          'relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full p-0.5 transition-colors duration-200 ease-in-out',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/40',
          isDark ? 'bg-blue-600/90 border border-blue-400/40' : 'bg-slate-200 border border-slate-300',
          className
        )}
        role="switch"
        aria-checked={isDark}
        aria-label="Toggle dark and light theme"
      >
        <motion.span
          layout
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          className={clsx(
            'pointer-events-none inline-flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md transform transition-transform',
            isDark ? 'translate-x-7 bg-[#07111F] text-blue-400' : 'translate-x-0 text-amber-500'
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {isDark ? (
              <motion.div
                key="moon"
                initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
                transition={{ duration: 0.15 }}
              >
                <Moon className="w-3.5 h-3.5 text-blue-400" />
              </motion.div>
            ) : (
              <motion.div
                key="sun"
                initial={{ opacity: 0, rotate: 90, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: -90, scale: 0.7 }}
                transition={{ duration: 0.15 }}
              >
                <Sun className="w-3.5 h-3.5 text-amber-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.span>
      </button>
    )
  }

  // ─── 5. SINGLE INTERACTIVE BUTTON (Micro-Rotating Luxury Button) ────
  return (
    <motion.button
      type="button"
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.94 }}
      onClick={toggleTheme}
      className={clsx(
        'group relative flex items-center gap-2 p-2 rounded-xl border transition-all duration-200 shadow-sm',
        'border-slate-200 dark:border-[#1E293B] bg-white dark:bg-[#101D2E]',
        'hover:bg-slate-50 dark:hover:bg-[#152438] text-slate-700 dark:text-slate-300',
        'hover:border-slate-300 dark:hover:border-slate-700',
        className
      )}
      title={isDark ? 'Switch to Crisp White Theme' : 'Switch to Deep Navy Dark Mode'}
      aria-label="Toggle theme mode"
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          <motion.div
            key="dark-icon"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center justify-center text-blue-400"
          >
            <Moon className="w-4 h-4" />
          </motion.div>
        ) : (
          <motion.div
            key="light-icon"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="flex items-center justify-center text-amber-500"
          >
            <Sun className="w-4 h-4" />
          </motion.div>
        )}
      </AnimatePresence>

      {showLabels && (
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
          {isDark ? 'Dark Mode' : 'Light Mode'}
        </span>
      )}
    </motion.button>
  )
}
