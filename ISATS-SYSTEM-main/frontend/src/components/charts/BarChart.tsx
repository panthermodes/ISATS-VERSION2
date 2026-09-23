import React from 'react'
import {
  BarChart as RechartsBar,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell
} from 'recharts'
import { useRechartsTheme } from './RechartsTheme'

export interface BarDataPoint {
  label: string
  value: number
  color?: string
}

interface BarChartProps {
  data: BarDataPoint[]
  height?: number
  defaultColor?: string
}

export function BarChart({
  data,
  height = 180,
  defaultColor,
}: BarChartProps) {
  const chartTheme = useRechartsTheme()

  if (!data || data.length === 0) return null

  const barColor = defaultColor || chartTheme.colors.primary

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsBar data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} vertical={false} />
          <XAxis
            dataKey="label"
            stroke={chartTheme.textMuted}
            fontSize={11}
            tickLine={false}
          />
          <YAxis
            stroke={chartTheme.textMuted}
            fontSize={11}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip contentStyle={chartTheme.tooltipStyle} />
          <Bar dataKey="value" fill={barColor} radius={[4, 4, 0, 0]} maxBarSize={32} animationDuration={800}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color || barColor} />
            ))}
          </Bar>
        </RechartsBar>
      </ResponsiveContainer>
    </div>
  )
}
