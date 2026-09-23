import React from 'react'
import { AlertTriangle, ShieldAlert, WifiOff, RefreshCw } from 'lucide-react'
import { Button } from './Button'

interface ErrorStateProps {
  type?: 'generic' | 'network' | 'permission' | 'notFound'
  title?: string
  message?: string
  onRetry?: () => void
}

export function ErrorState({
  type = 'generic',
  title,
  message,
  onRetry,
}: ErrorStateProps) {
  const defaults = {
    generic: {
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      title: 'Unable to Load Data',
      message: 'An unexpected system condition occurred while retrieving records. Please try again.',
    },
    network: {
      icon: WifiOff,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
      title: 'Connection Interrupted',
      message: 'Unable to communicate with the ISATS backend service. Please check your network connectivity.',
    },
    permission: {
      icon: ShieldAlert,
      iconColor: 'text-rose-500',
      bgColor: 'bg-rose-500/10 border-rose-500/20',
      title: 'Access Restricted',
      message: 'Your current organizational role does not have authorization to access this operational module.',
    },
    notFound: {
      icon: AlertTriangle,
      iconColor: 'text-slate-400',
      bgColor: 'bg-slate-800/40 border-slate-700/60',
      title: 'Record Not Found',
      message: 'The requested resource could not be found or may have been relocated.',
    },
  }

  const config = defaults[type]
  const IconComponent = config.icon

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto space-y-4 rounded-3xl bg-white dark:bg-[#101D2E] border border-slate-200 dark:border-[#1E293B] shadow-sm my-6">
      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${config.bgColor} ${config.iconColor}`}>
        <IconComponent className="w-7 h-7" />
      </div>
      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">{title || config.title}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{message || config.message}</p>
      </div>
      {onRetry && (
        <Button onClick={onRetry} size="sm" variant="outline" className="text-xs gap-1.5 border-slate-700 mt-2">
          <RefreshCw className="w-3.5 h-3.5" /> Retry Operation
        </Button>
      )}
    </div>
  )
}
