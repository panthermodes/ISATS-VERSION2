import React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts'
import { useRechartsTheme } from './RechartsTheme'

export interface DonutSegment {
  label: string
  value: number
  color?: string
}

interface DonutChartProps {
  segments: DonutSegment[]
  size?: number
  innerRadius?: number
  outerRadius?: number
  centerLabel?: string
  centerValue?: string | number
  showLegend?: boolean
}

export function DonutChart({
  segments,
  size = 180,
  innerRadius = 52,
  outerRadius = 78,
  centerLabel,
  centerValue,
  showLegend = true,
}: DonutChartProps) {
  const chartTheme = useRechartsTheme()

  if (!segments || segments.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-xs text-slate-400">
        No chart data
      </div>
    )
  }

  const total = segments.reduce((sum, s) => sum + s.value, 0)
  const defaultPalette = chartTheme.colors.palette

  const formattedData = segments.map((seg, i) => ({
    name: seg.label,
    value: seg.value,
    color: seg.color || defaultPalette[i % defaultPalette.length],
  }))

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={formattedData}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={3}
              dataKey="value"
              animationDuration={800}
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke={chartTheme.background} strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={chartTheme.tooltipStyle}
              formatter={(val: any, name: any) => [`${val} (${Math.round((val / (total || 1)) * 100)}%)`, name]}
            />
          </PieChart>
        </ResponsiveContainer>

        {centerValue !== undefined && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
            <span className="text-xl font-black text-slate-900 dark:text-white font-mono tracking-tight">
              {centerValue}
            </span>
            {centerLabel && (
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                {centerLabel}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="grid grid-cols-1 gap-1.5 text-xs">
          {formattedData.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
              <span className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-[130px]">
                {item.name}
              </span>
              <span className="text-slate-400 font-mono text-[11px]">
                ({item.value})
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
