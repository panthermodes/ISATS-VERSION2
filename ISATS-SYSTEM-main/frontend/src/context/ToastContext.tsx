import React, {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react'
import { createPortal } from 'react-dom'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import clsx from 'clsx'

// ─── Types ────────────────────────────────────────────────
type ToastType = 'success' | 'error' | 'warning' | 'info'

interface ToastItem {
  id: string
  type: ToastType
  message: string
}

interface ToastContextType {
  success: (msg: string) => void
  error: (msg: string) => void
  warning: (msg: string) => void
  info: (msg: string) => void
}

// ─── Context ──────────────────────────────────────────────
const ToastContext = createContext<ToastContextType | null>(null)

// ─── Icon map ─────────────────────────────────────────────
const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5 text-success" />,
  error:   <XCircle className="w-5 h-5 text-danger" />,
  warning: <AlertTriangle className="w-5 h-5 text-warning" />,
  info:    <Info className="w-5 h-5 text-blue" />,
}

const borderColors: Record<ToastType, string> = {
  success: 'border-l-success',
  error:   'border-l-danger',
  warning: 'border-l-warning',
  info:    'border-l-blue',
}

// ─── Provider ─────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const add = useCallback((type: ToastType, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 4000)
  }, [])

  const remove = (id: string) =>
    setToasts((prev) => prev.filter((t) => t.id !== id))

  const ctx: ToastContextType = {
    success: (m) => add('success', m),
    error:   (m) => add('error', m),
    warning: (m) => add('warning', m),
    info:    (m) => add('info', m),
  }

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {createPortal(
        <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full">
          {toasts.map((t) => (
            <div
              key={t.id}
              className={clsx(
                'card border-l-4 px-4 py-3 flex items-start gap-3 shadow-soft',
                'animate-slide-in-right',
                borderColors[t.type]
              )}
            >
              <div className="flex-shrink-0 mt-0.5">{icons[t.type]}</div>
              <p className="text-sm flex-1 text-primary-900 dark:text-slate-100">
                {t.message}
              </p>
              <button
                onClick={() => remove(t.id)}
                className="flex-shrink-0 text-muted hover:text-primary-900 dark:hover:text-slate-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>,
        document.body
      )}
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}
