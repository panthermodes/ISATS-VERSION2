import React from 'react'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmDialogProps {
  isOpen: boolean
  onConfirm: () => void
  onCancel: () => void
  title?: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'info'
  isLoading?: boolean
}

const variantConfig = {
  danger:  { icon: <Trash2 className="w-6 h-6 text-danger" />, btnVariant: 'danger' as const, bg: 'bg-danger/10' },
  warning: { icon: <AlertTriangle className="w-6 h-6 text-warning" />, btnVariant: 'primary' as const, bg: 'bg-warning/10' },
  info:    { icon: <AlertTriangle className="w-6 h-6 text-blue" />, btnVariant: 'primary' as const, bg: 'bg-blue/10' },
}

export function ConfirmDialog({
  isOpen,
  onConfirm,
  onCancel,
  title = 'Confirm Action',
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const cfg = variantConfig[variant]
  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button
            variant={cfg.btnVariant}
            onClick={onConfirm}
            loading={isLoading}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-4">
        <div className={`p-3 rounded-full flex-shrink-0 ${cfg.bg}`}>{cfg.icon}</div>
        <div>
          <h3 className="font-semibold text-primary-900 dark:text-slate-100 mb-1">{title}</h3>
          <p className="text-sm text-muted">{message}</p>
        </div>
      </div>
    </Modal>
  )
}
