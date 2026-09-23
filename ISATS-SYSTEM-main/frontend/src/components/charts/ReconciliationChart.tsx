import React from 'react'
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import { useRechartsTheme } from './RechartsTheme'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export interface ReconciliationItem {
  name: string
  declared: number
  registered: number
  unregistered: number
}

interface ReconciliationChartProps {
  data: ReconciliationItem[]
  height?: number
}

export function ReconciliationChart({ data, height = 280 }: ReconciliationChartProps) {
  const chartTheme = useRechartsTheme()

  if (!data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400">
        <p className="text-xs">No reconciliation data available.</p>
      </div>
    )
  }

  // Format chart items (limit to top 8 for clean visibility)
  const chartData = data.slice(0, 8).map((item) => ({
    name: item.name.length > 14 ? `${item.name.slice(0, 12)}...` : item.name,
    fullName: item.name,
    'Declared Units': item.declared,
    'Tagged Assets': item.registered,
    'Pending Tagging': Math.max(0, item.unregistered),
  }))

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#3B82F6]" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Declared Hardware</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#10B981]" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Individually Tagged</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-[#F59E0B]" />
            <span className="text-slate-600 dark:text-slate-400 font-medium">Pending Registration</span>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 italic">
          * Declared quantity is an estimate; Tagged assets represent physical audited hardware.
        </span>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <RechartsBar
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} vertical={false} />
            <XAxis
              dataKey="name"
              stroke={chartTheme.textMuted}
              fontSize={11}
              tickLine={false}
              interval={0}
              angle={-20}
              textAnchor="end"
            />
            <YAxis
              stroke={chartTheme.textMuted}
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip
              contentStyle={chartTheme.tooltipStyle}
              formatter={(value: any, name: any) => [`${value} units`, name]}
              labelFormatter={(_, payload) => payload?.[0]?.payload?.fullName || ''}
            />
            <Bar dataKey="Declared Units" fill="#3B82F6" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="Tagged Assets" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={28} />
            <Bar dataKey="Pending Tagging" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </RechartsBar>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
