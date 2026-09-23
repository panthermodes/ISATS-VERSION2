import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts'
import { useRechartsTheme } from './RechartsTheme'

export interface LineDataPoint {
  label: string
  value: number
}

interface LineChartProps {
  data: LineDataPoint[]
  height?: number
  strokeColor?: string
  fillColor?: string
  showGrid?: boolean
}

export function LineChart({
  data,
  height = 180,
  strokeColor,
  fillColor,
  showGrid = true,
}: LineChartProps) {
  const chartTheme = useRechartsTheme()

  if (!data || data.length === 0) return null

  const stroke = strokeColor || chartTheme.colors.primary
  const fill = fillColor || `${stroke}20` // 20 hex = 12% opacity

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          {showGrid && (
            <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridStroke} vertical={false} />
          )}
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
          <Area
            type="monotone"
            dataKey="value"
            stroke={stroke}
            strokeWidth={2.5}
            fill={fill}
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
