import React from 'react'
import { motion } from 'framer-motion'
import {
  Laptop, Server, Network, Printer, Camera, Database, Cloud, Shield
} from 'lucide-react'

interface ISATSLoaderProps {
  stageText?: string
  progress?: number
  fullScreen?: boolean
}

const ORBIT_NODES = [
  { icon: Laptop,   label: 'End-User',     angle: 0,   color: '#3B82F6' },
  { icon: Server,   label: 'Datacenter',   angle: 51,  color: '#0EA5E9' },
  { icon: Network,  label: 'Networking',   angle: 102, color: '#06B6D4' },
  { icon: Database, label: 'Data Registry',angle: 154, color: '#6366F1' },
  { icon: Camera,   label: 'Security',     angle: 205, color: '#F59E0B' },
  { icon: Printer,  label: 'Peripherals',  angle: 257, color: '#64748B' },
  { icon: Cloud,    label: 'Cloud SaaS',   angle: 308, color: '#2563EB' },
]

export function ISATSLoader({
  stageText = 'Initializing ISATS ICT Environment...',
  progress,
  fullScreen = true,
}: ISATSLoaderProps) {
  const containerClasses = fullScreen
    ? 'fixed inset-0 z-50 bg-[#07111F] text-slate-100 flex flex-col items-center justify-center p-6 select-none'
    : 'w-full py-16 bg-[#07111F] text-slate-100 flex flex-col items-center justify-center p-6 rounded-2xl border border-[#1E293B]'

  const radius = 96 // distance from center

  return (
    <div className={containerClasses}>
      {/* Background Subtle Grid Effect */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'radial-gradient(#3B82F6 1px, transparent 1px)',
          backgroundSize: '24px 24px',
        }}
      />

      <div className="relative w-72 h-72 flex items-center justify-center">
        {/* Animated Connecting SVG Ring and Rays */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 288 288">
          {/* Subtle Outer Boundary Ring */}
          <circle
            cx="144"
            cy="144"
            r={radius}
            fill="none"
            stroke="#1E293B"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />

          {/* Radiating connector lines from center to nodes */}
          {ORBIT_NODES.map((node, i) => {
            const rad = (node.angle * Math.PI) / 180
            const x = 144 + radius * Math.cos(rad)
            const y = 144 + radius * Math.sin(rad)
            return (
              <line
                key={i}
                x1="144"
                y1="144"
                x2={x}
                y2={y}
                stroke="#1E293B"
                strokeWidth="1"
                className="opacity-40"
              />
            )
          })}
        </svg>

        {/* Orbiting Hardware Nodes */}
        {ORBIT_NODES.map((node, idx) => {
          const NodeIcon = node.icon
          const rad = (node.angle * Math.PI) / 180
          const x = radius * Math.cos(rad)
          const y = radius * Math.sin(rad)

          return (
            <motion.div
              key={idx}
              className="absolute w-9 h-9 rounded-xl flex items-center justify-center border shadow-lg"
              style={{
                x,
                y,
                backgroundColor: '#101D2E',
                borderColor: '#1E293B',
              }}
              animate={{
                scale: [1, 1.08, 1],
                borderColor: ['#1E293B', node.color, '#1E293B'],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: idx * 0.4,
                ease: 'easeInOut',
              }}
            >
              <NodeIcon className="w-4 h-4" style={{ color: node.color }} />
            </motion.div>
          )
        })}

        {/* Central Core ISATS Hub */}
        <motion.div
          className="relative z-10 w-20 h-20 rounded-2xl flex flex-col items-center justify-center bg-[#0B1728] border border-[#2563EB]/40 shadow-2xl shadow-blue-500/20"
          animate={{
            boxShadow: [
              '0 0 15px rgba(37,99,235,0.2)',
              '0 0 30px rgba(6,182,212,0.3)',
              '0 0 15px rgba(37,99,235,0.2)',
            ],
          }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white mb-0.5 shadow-md shadow-blue-500/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-black tracking-widest text-white uppercase">ISATS</span>
        </motion.div>
      </div>

      {/* Loading Status & Staged Feedback */}
      <div className="mt-8 text-center space-y-3 w-full max-w-xs relative z-10">
        <p className="text-xs font-medium text-slate-300 tracking-wide">{stageText}</p>

        {/* Premium Shimmer Progress Bar (4-6px height) */}
        <div className="w-full h-1.5 rounded-full bg-[#101D2E] overflow-hidden border border-[#1E293B] relative">
          <motion.div
            className="h-full bg-gradient-to-r from-[#2563EB] via-[#06B6D4] to-[#2563EB] rounded-full"
            initial={{ width: '15%' }}
            animate={{
              width: progress !== undefined ? `${progress}%` : ['15%', '85%', '35%', '95%'],
            }}
            transition={
              progress !== undefined
                ? { duration: 0.3 }
                : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
            }
          />
        </div>

        {progress !== undefined && (
          <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono">
            <span>Enterprise Workspace</span>
            <span className="text-blue-400 font-semibold">{Math.round(progress)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}
