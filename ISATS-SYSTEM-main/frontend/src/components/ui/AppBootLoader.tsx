import React from 'react'
import { Shield, RefreshCw } from 'lucide-react'
import { Button } from './Button'

interface AppBootLoaderProps {
  error?: string | null
  onRetry?: () => void
}

export function AppBootLoader({ error, onRetry }: AppBootLoaderProps) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100">
      <div className="w-full max-w-sm flex flex-col items-center text-center space-y-6">
        {/* Brand Icon with Pulse */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shadow-2xl">
            <Shield className="w-10 h-10 animate-pulse" />
          </div>
          {!error && (
            <div className="absolute -inset-1 rounded-3xl bg-blue-500/20 blur-lg -z-10 animate-pulse" />
          )}
        </div>

        {/* Brand Title */}
        <div className="space-y-1">
          <h1 className="text-xl font-black text-white tracking-wider">ISATS</h1>
          <p className="text-xs text-slate-400 font-medium">ICT Support and Tracking System</p>
        </div>

        {error ? (
          <div className="space-y-3 p-4 rounded-2xl bg-rose-950/40 border border-rose-500/30 text-xs text-rose-300 w-full">
            <p className="font-semibold">Unable to initialize application.</p>
            <p className="text-slate-400 text-[11px]">{error}</p>
            {onRetry && (
              <Button onClick={onRetry} size="sm" variant="outline" className="w-full text-xs gap-1.5 border-rose-800 hover:bg-rose-900/40 mt-2">
                <RefreshCw className="w-3.5 h-3.5" /> Retry Startup
              </Button>
            )}
          </div>
        ) : (
          /* Loading Indicator */
          <div className="w-full space-y-2 max-w-xs">
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden border border-slate-700/60">
              <div className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full animate-progress" />
            </div>
            <span className="text-[11px] text-slate-500 font-mono">Initializing secure enterprise session...</span>
          </div>
        )}
      </div>
    </div>
  )
}
