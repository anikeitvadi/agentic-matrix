'use client'

import { useMemo } from 'react'
import {
  BarChart,
  Bar,
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
 * Color palette for cost categories.
 * Using distinct colors for clear visual differentiation.
 */
const COST_COLORS = {
  platformFees: '#3b82f6', // blue-500 - Platform/subscription costs
  tokenCosts: '#10b981', // emerald-500 - Token/usage costs
  engineering: '#f59e0b', // amber-500 - Engineering implementation
} as const

interface CostComparisonChartProps {
  estimates: CostEstimate[]
  period: 'monthly' | 'yearly' | 'tco36'
}

/**
 * Data point structure for the horizontal bar chart.
 */
interface ChartDataPoint {
  platformId: string
  platformName: string
  platformFees: number
  tokenCosts: number
  engineering: number
  total: number
}

/**
 * Cost Comparison Chart
 *
 * Displays a horizontal stacked bar chart comparing costs across platforms.
 * Each bar shows the breakdown of platform fees, token/usage costs, and
 * engineering implementation costs (for yearly and tco36 views).
 *
 * Features:
 * - Horizontal layout for easy platform name display
 * - Stacked bars showing cost breakdown by category
 * - Custom tooltip with detailed breakdown
 * - Responsive container that adapts to parent width
 * - Period-aware engineering cost display (not shown for monthly)
 */
export function CostComparisonChart({ estimates, period }: CostComparisonChartProps) {
  // Transform estimates into chart data format
  const chartData = useMemo<ChartDataPoint[]>(() => {
    if (estimates.length === 0) return []

    return estimates.map((estimate) => {
      // Calculate costs based on period
      let platformFees: number
      let tokenCosts: number
      let engineering: number

      switch (period) {
        case 'monthly':
          platformFees = estimate.monthlyBaseCost
          tokenCosts = estimate.monthlyUsageCost
          engineering = 0 // Not shown for monthly view
          break
        case 'yearly':
          platformFees = estimate.monthlyBaseCost * 12
          tokenCosts = estimate.monthlyUsageCost * 12
          engineering = estimate.engineeringCost
          break
        case 'tco36':
          platformFees = estimate.monthlyBaseCost * 36
          tokenCosts = estimate.monthlyUsageCost * 36
          engineering = estimate.engineeringCost
          break
      }

      return {
        platformId: estimate.platformId,
        platformName: truncateName(estimate.platformName, 20),
        platformFees,
        tokenCosts,
        engineering,
        total: platformFees + tokenCosts + engineering,
      }
    }).sort((a, b) => a.total - b.total) // Sort by total cost ascending
  }, [estimates, period])

  // Determine if engineering should be shown
  const showEngineering = period !== 'monthly'

  // Empty state
  if (estimates.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 bg-neutral-900 rounded-lg border border-neutral-800">
        <p className="text-neutral-400">No platforms to compare</p>
      </div>
    )
  }

  // Calculate dynamic height based on number of platforms
  const chartHeight = Math.max(300, estimates.length * 50 + 100)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Cost Comparison ({getPeriodLabel(period)})
      </h3>
      <div style={{ height: chartHeight }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 120, bottom: 10 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#404040" horizontal={false} />
            <XAxis
              type="number"
              stroke="#a3a3a3"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => formatCurrency(value, { compact: true })}
            />
            <YAxis
              type="category"
              dataKey="platformName"
              stroke="#a3a3a3"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={110}
            />
            <Tooltip
              content={({ active, payload, label }) => (
                <CustomTooltip
                  active={active}
                  payload={payload}
                  label={label}
                  showEngineering={showEngineering}
                />
              )}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
              formatter={(value) => getLegendLabel(value, showEngineering)}
            />
            <Bar
              dataKey="platformFees"
              stackId="cost"
              fill={COST_COLORS.platformFees}
              name="platformFees"
              radius={[0, 0, 0, 0]}
            />
            <Bar
              dataKey="tokenCosts"
              stackId="cost"
              fill={COST_COLORS.tokenCosts}
              name="tokenCosts"
              radius={[0, 0, 0, 0]}
            />
            {showEngineering && (
              <Bar
                dataKey="engineering"
                stackId="cost"
                fill={COST_COLORS.engineering}
                name="engineering"
                radius={[0, 4, 4, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div className="text-xs text-neutral-500 text-center">
        {getPeriodDescription(period)}
      </div>
    </div>
  )
}

/**
 * Truncate platform name to fit in Y-axis.
 */
function truncateName(name: string, maxLength: number): string {
  if (name.length <= maxLength) return name
  return name.slice(0, maxLength - 3) + '...'
}

/**
 * Get human-readable period label.
 */
function getPeriodLabel(period: 'monthly' | 'yearly' | 'tco36'): string {
  switch (period) {
    case 'monthly':
      return 'Monthly'
    case 'yearly':
      return 'Annual'
    case 'tco36':
      return '3-Year TCO'
  }
}

/**
 * Get period description for chart footer.
 */
function getPeriodDescription(period: 'monthly' | 'yearly' | 'tco36'): string {
  switch (period) {
    case 'monthly':
      return 'Monthly recurring costs only (excludes implementation)'
    case 'yearly':
      return 'Annual costs including one-time implementation'
    case 'tco36':
      return 'Total cost of ownership over 36 months'
  }
}

/**
 * Get legend label for data keys.
 */
function getLegendLabel(value: string, showEngineering: boolean): string {
  switch (value) {
    case 'platformFees':
      return 'Platform Fees'
    case 'tokenCosts':
      return 'Token/Usage Costs'
    case 'engineering':
      return showEngineering ? 'Implementation' : ''
    default:
      return value
  }
}

/**
 * Custom tooltip payload entry type.
 */
interface TooltipPayloadEntry {
  dataKey?: string | number
  value?: number
  color?: string
  name?: string
  payload?: ChartDataPoint
}

/**
 * Custom tooltip component for detailed cost breakdown.
 */
interface TooltipProps {
  active?: boolean
  payload?: readonly TooltipPayloadEntry[]
  label?: string | number
  showEngineering: boolean
}

function CustomTooltip({ active, payload, label, showEngineering }: TooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  // Get the full data point from first payload entry
  const dataPoint = payload[0]?.payload

  if (!dataPoint) {
    return null
  }

  return (
    <div className="bg-neutral-900 border border-neutral-700 rounded-lg p-4 shadow-lg min-w-[200px]">
      <p className="font-semibold text-neutral-100 mb-3">{label}</p>

      <div className="space-y-2">
        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: COST_COLORS.platformFees }}
            />
            <span className="text-sm text-neutral-300">Platform Fees</span>
          </div>
          <span className="font-medium text-sm tabular-nums text-neutral-100">
            {formatCurrency(dataPoint.platformFees)}
          </span>
        </div>

        <div className="flex justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: COST_COLORS.tokenCosts }}
            />
            <span className="text-sm text-neutral-300">Token/Usage</span>
          </div>
          <span className="font-medium text-sm tabular-nums text-neutral-100">
            {formatCurrency(dataPoint.tokenCosts)}
          </span>
        </div>

        {showEngineering && dataPoint.engineering > 0 && (
          <div className="flex justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: COST_COLORS.engineering }}
              />
              <span className="text-sm text-neutral-300">Implementation</span>
            </div>
            <span className="font-medium text-sm tabular-nums text-neutral-100">
              {formatCurrency(dataPoint.engineering)}
            </span>
          </div>
        )}

        <div className="pt-2 mt-2 border-t border-neutral-700">
          <div className="flex justify-between items-center gap-4">
            <span className="text-sm font-medium text-neutral-200">Total</span>
            <span className="font-semibold text-sm tabular-nums text-white">
              {formatCurrency(dataPoint.total)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

export type { CostComparisonChartProps }
