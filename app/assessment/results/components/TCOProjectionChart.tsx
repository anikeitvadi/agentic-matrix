'use client'

import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import type { CostEstimate } from '@/lib/cost/types'
import { formatCurrency } from '@/lib/cost/format'

/**
 * Color palette for platform lines.
 * Uses Tailwind color values for consistency.
 */
const PLATFORM_COLORS = [
  '#64748b', // slate-500
  '#10b981', // emerald-500
  '#f59e0b', // amber-500
  '#f43f5e', // rose-500
  '#0ea5e9', // sky-500
  '#8b5cf6', // violet-500
  '#ec4899', // pink-500
  '#14b8a6', // teal-500
]

interface TCOProjectionChartProps {
  estimates: CostEstimate[]
  highlightPlatform?: string // platformId to highlight
}

/**
 * TCO Projection Chart
 *
 * Displays total cost of ownership over 12, 24, and 36 month timeframes
 * using a Recharts AreaChart. Each platform gets its own line/area.
 *
 * Features:
 * - Responsive container that adapts to parent width
 * - Highlighted platform appears with thicker stroke and higher opacity
 * - Custom tooltip showing full TCO breakdown at each period
 * - Formatted currency values on Y-axis (compact mode)
 */
export function TCOProjectionChart({ estimates, highlightPlatform }: TCOProjectionChartProps) {
  // Transform estimates into chart data format
  const chartData = useMemo(() => {
    if (estimates.length === 0) return []

    return [
      {
        period: 'Year 1',
        months: 12,
        ...Object.fromEntries(
          estimates.map((e) => [e.platformId, e.tcoPeriods.months12])
        ),
      },
      {
        period: 'Year 2',
        months: 24,
        ...Object.fromEntries(
          estimates.map((e) => [e.platformId, e.tcoPeriods.months24])
        ),
      },
      {
        period: 'Year 3',
        months: 36,
        ...Object.fromEntries(
          estimates.map((e) => [e.platformId, e.tcoPeriods.months36])
        ),
      },
    ]
  }, [estimates])

  // Create platform-to-name mapping for legend and tooltip
  const platformNames = useMemo(() => {
    return Object.fromEntries(estimates.map((e) => [e.platformId, e.platformName]))
  }, [estimates])

  // Empty state
  if (estimates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-neutral-900 rounded-lg border border-neutral-800">
        <p className="text-neutral-400">No platforms to compare</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">TCO Projection (12-36 months)</h3>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <defs>
              {estimates.map((estimate, index) => (
                <linearGradient
                  key={estimate.platformId}
                  id={`gradient-${estimate.platformId}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={PLATFORM_COLORS[index % PLATFORM_COLORS.length]}
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor={PLATFORM_COLORS[index % PLATFORM_COLORS.length]}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" />
            <XAxis
              dataKey="period"
              stroke="#a3a3a3"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#a3a3a3"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value, { compact: true })}
            />
            <Tooltip
              content={({ active, payload, label }) => (
                <CustomTooltip
                  active={active}
                  payload={payload}
                  label={label}
                  platformNames={platformNames}
                />
              )}
            />
            <Legend
              formatter={(value) => platformNames[value] || value}
              wrapperStyle={{ fontSize: '12px' }}
            />
            {estimates.map((estimate, index) => {
              const isHighlighted = highlightPlatform === estimate.platformId
              return (
                <Area
                  key={estimate.platformId}
                  type="monotone"
                  dataKey={estimate.platformId}
                  name={estimate.platformId}
                  stroke={PLATFORM_COLORS[index % PLATFORM_COLORS.length]}
                  strokeWidth={isHighlighted ? 3 : 2}
                  fill={`url(#gradient-${estimate.platformId})`}
                  fillOpacity={isHighlighted ? 0.4 : 0.1}
                />
              )
            })}
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

/**
 * Custom tooltip component for detailed TCO breakdown.
 */
interface TooltipPayloadEntry {
  dataKey?: string | number
  value?: number
  color?: string
  name?: string
}

interface TooltipProps {
  active?: boolean
  payload?: readonly TooltipPayloadEntry[]
  label?: string | number
  platformNames: Record<string, string>
}

function CustomTooltip({ active, payload, label, platformNames }: TooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  // Sort by value descending
  const sortedPayload = [...payload].sort((a, b) => (b.value ?? 0) - (a.value ?? 0))

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-3 shadow-lg">
      <p className="font-medium text-neutral-200 mb-2">{label}</p>
      <div className="space-y-1">
        {sortedPayload.map((entry) => {
          const key = String(entry.dataKey ?? entry.name ?? 'unknown')
          return (
            <div
              key={key}
              className="flex items-center justify-between gap-4 text-sm"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-neutral-300">
                  {platformNames[key] || key}
                </span>
              </div>
              <span className="font-medium tabular-nums text-neutral-100">
                {formatCurrency(entry.value ?? 0)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export type { TCOProjectionChartProps }
