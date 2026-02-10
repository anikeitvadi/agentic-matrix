/**
 * Engineering Time Estimator
 *
 * Estimates engineering effort for platform implementation using
 * the PERT (Program Evaluation Review Technique) three-point formula:
 * Expected = (Optimistic + 4*MostLikely + Pessimistic) / 6
 *
 * This approach accounts for estimation uncertainty and provides
 * both point estimates and confidence ranges.
 */

import type { EngineeringEstimate, PlatformTier } from './types'

/**
 * Complexity modifiers that affect engineering time.
 */
interface ComplexityModifiers {
  hasNativeIntegration: boolean
  requiresCustomCode: boolean
  complianceRequirements: string[]
}

/**
 * Base engineering estimates by platform tier (in days).
 * O = Optimistic (best case)
 * M = Most Likely (typical case)
 * P = Pessimistic (worst case)
 */
const BASE_ESTIMATES: Record<PlatformTier, { O: number; M: number; P: number }> = {
  'enterprise-os': { O: 15, M: 25, P: 45 },     // Complex setup, governance, SSO
  'ipaas-agent': { O: 5, M: 10, P: 20 },        // Pre-built connectors, guided setup
  'developer-first': { O: 10, M: 20, P: 35 },   // Requires engineering expertise
  'vertical': { O: 3, M: 7, P: 15 },            // Domain-specific, simpler integration
}

/**
 * Multipliers for complexity factors.
 */
const MULTIPLIERS = {
  noNativeIntegration: 0.3,   // +30% for custom integration work
  requiresCustomCode: 0.25,   // +25% for custom development
  perComplianceReq: 0.1,      // +10% per compliance requirement
}

/**
 * Estimate engineering days using three-point PERT formula.
 *
 * @param tier - Platform tier determining base estimate
 * @param modifiers - Complexity factors that affect the estimate
 * @returns Engineering estimate with expected days and confidence range
 *
 * @example
 * const estimate = estimateEngineeringDays('developer-first', {
 *   hasNativeIntegration: true,
 *   requiresCustomCode: true,
 *   complianceRequirements: ['SOC2'],
 * })
 * // Returns estimate with expectedDays ~30
 */
export function estimateEngineeringDays(
  tier: PlatformTier,
  modifiers: ComplexityModifiers
): EngineeringEstimate {
  const base = BASE_ESTIMATES[tier]

  // Calculate total multiplier from complexity factors
  let multiplier = 1.0

  if (!modifiers.hasNativeIntegration) {
    multiplier += MULTIPLIERS.noNativeIntegration
  }

  if (modifiers.requiresCustomCode) {
    multiplier += MULTIPLIERS.requiresCustomCode
  }

  if (modifiers.complianceRequirements.length > 0) {
    multiplier += modifiers.complianceRequirements.length * MULTIPLIERS.perComplianceReq
  }

  // Apply multiplier to base estimates
  const O = Math.round(base.O * multiplier)
  const M = Math.round(base.M * multiplier)
  const P = Math.round(base.P * multiplier)

  // PERT formula: (O + 4M + P) / 6
  const expected = (O + 4 * M + P) / 6

  // Standard deviation for confidence range: (P - O) / 6
  const stdDev = (P - O) / 6

  return {
    optimisticDays: O,
    mostLikelyDays: M,
    pessimisticDays: P,
    expectedDays: Math.round(expected),
    confidenceRange: {
      low: Math.round(expected - stdDev),
      high: Math.round(expected + stdDev),
    },
  }
}

/**
 * Default hourly rate for engineering work.
 * Based on senior software engineer market rates.
 */
const DEFAULT_HOURLY_RATE = 150 // USD

/**
 * Default working hours per day.
 */
const DEFAULT_HOURS_PER_DAY = 8

/**
 * Convert engineering days to cost.
 *
 * @param days - Number of engineering days
 * @param hourlyRate - Hourly rate in USD (default: $150)
 * @param hoursPerDay - Working hours per day (default: 8)
 * @returns Total engineering cost in USD
 *
 * @example
 * const cost = engineeringDaysToCost(25)
 * // Returns 30000 (25 * 8 * 150)
 */
export function engineeringDaysToCost(
  days: number,
  hourlyRate: number = DEFAULT_HOURLY_RATE,
  hoursPerDay: number = DEFAULT_HOURS_PER_DAY
): number {
  return days * hoursPerDay * hourlyRate
}
