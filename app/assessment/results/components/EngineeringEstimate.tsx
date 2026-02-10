import type { EngineeringEstimate as EstimateType } from '@/lib/cost/types'
import { formatCurrency, formatDuration, formatRange } from '@/lib/cost/format'

interface EngineeringEstimateProps {
  estimate: EstimateType
  hourlyRate?: number // Default $150
  platformName: string
}

/**
 * Engineering Estimate Display
 *
 * Shows implementation effort with uncertainty ranges using PERT methodology.
 *
 * Features:
 * - Primary estimate prominently displayed
 * - Confidence range with min/max
 * - Three-point breakdown (optimistic, most likely, pessimistic)
 * - Cost equivalent calculation
 * - Visual confidence bar showing estimate range
 */
export function EngineeringEstimate({
  estimate,
  hourlyRate = 150,
  platformName,
}: EngineeringEstimateProps) {
  const hoursPerDay = 8
  const estimatedCost = estimate.expectedDays * hoursPerDay * hourlyRate

  // Calculate bar positions (0-100%)
  const minDays = estimate.optimisticDays
  const maxDays = estimate.pessimisticDays
  const range = maxDays - minDays

  // Avoid division by zero
  const expectedPosition = range > 0
    ? ((estimate.expectedDays - minDays) / range) * 100
    : 50

  const lowPosition = range > 0
    ? ((estimate.confidenceRange.low - minDays) / range) * 100
    : 25

  const highPosition = range > 0
    ? ((estimate.confidenceRange.high - minDays) / range) * 100
    : 75

  return (
    <div className="space-y-4 p-4 rounded-lg bg-neutral-900 border border-neutral-800">
      {/* Primary Estimate */}
      <div className="text-center">
        <div className="text-3xl font-bold tabular-nums">
          ~{formatDuration(estimate.expectedDays)}
        </div>
        <p className="text-sm text-neutral-400 mt-1">
          ({formatRange(estimate.confidenceRange.low, estimate.confidenceRange.high)} range)
        </p>
      </div>

      {/* Three-Point Breakdown */}
      <div className="flex items-center justify-center gap-4 text-sm text-neutral-400">
        <span>
          Best: <span className="text-neutral-200">{formatDuration(estimate.optimisticDays)}</span>
        </span>
        <span className="text-neutral-600">|</span>
        <span>
          Typical: <span className="text-neutral-200">{formatDuration(estimate.mostLikelyDays)}</span>
        </span>
        <span className="text-neutral-600">|</span>
        <span>
          Worst: <span className="text-neutral-200">{formatDuration(estimate.pessimisticDays)}</span>
        </span>
      </div>

      {/* Confidence Bar */}
      <div className="pt-2">
        <div className="relative h-4 bg-neutral-800 rounded-full overflow-hidden">
          {/* Confidence range highlight */}
          <div
            className="absolute top-0 h-full bg-brand-900/50"
            style={{
              left: `${lowPosition}%`,
              width: `${highPosition - lowPosition}%`,
            }}
          />
          {/* Expected value marker */}
          <div
            className="absolute top-0 w-1 h-full bg-brand-500"
            style={{ left: `${expectedPosition}%` }}
          />
        </div>
        {/* Scale labels */}
        <div className="flex justify-between text-xs text-neutral-500 mt-1">
          <span>{formatDuration(minDays)}</span>
          <span>{formatDuration(maxDays)}</span>
        </div>
      </div>

      {/* Cost Equivalent */}
      <div className="pt-4 border-t border-neutral-800">
        <div className="flex items-baseline justify-between">
          <span className="text-sm text-neutral-400">Estimated cost</span>
          <span className="text-lg font-semibold tabular-nums">
            {formatCurrency(estimatedCost)}
          </span>
        </div>
        <p className="text-xs text-neutral-500 mt-1">
          at {formatCurrency(hourlyRate)}/hr ({estimate.expectedDays} days x {hoursPerDay} hrs)
        </p>
      </div>

      {/* Context Note */}
      <p className="text-xs text-neutral-500 text-center pt-2">
        Based on {platformName} complexity and typical integration requirements.
        Estimates assume an experienced team.
      </p>
    </div>
  )
}

export type { EngineeringEstimateProps }
