import React, { useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import clsx from 'clsx'
import { modalBackdropVariants, modalDialogVariants } from '@/theme/animations'

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  subtitle?: string
  children: React.ReactNode
  size?: ModalSize
  hideCloseButton?: boolean
  footer?: React.ReactNode
}

const sizeClasses: Record<ModalSize, string> = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  full: 'max-w-5xl',
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  hideCloseButton = false,
  footer,
}: ModalProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, handleKeyDown])

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Animated Backdrop with Blur */}
          <motion.div
            variants={modalBackdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Animated Modal Dialog (16px radius, #101D2E in dark, #FFFFFF in light) */}
          <motion.div
            variants={modalDialogVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={clsx(
              'relative w-full z-10 my-8 overflow-hidden rounded-2xl shadow-2xl',
              'bg-white dark:bg-[#101D2E] text-slate-900 dark:text-slate-100',
              'border border-slate-200 dark:border-[#1E293B]',
              sizeClasses[size]
            )}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            {(title || !hideCloseButton) && (
              <div className="flex items-start justify-between px-6 py-5 border-b border-slate-100 dark:border-[#1E293B]">
                <div>
                  {title && (
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      {title}
                    </h2>
                  )}
                  {subtitle && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{subtitle}</p>
                  )}
                </div>
                {!hideCloseButton && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#152438] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            <div className="px-6 py-5 max-h-[calc(85vh-130px)] overflow-y-auto">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="px-6 py-4 border-t border-slate-100 dark:border-[#1E293B] bg-slate-50/50 dark:bg-[#0B1728]/50 flex items-center justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}
