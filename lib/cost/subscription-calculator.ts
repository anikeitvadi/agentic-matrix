/**
 * Subscription Cost Calculator
 *
 * Handles subscription tier selection and cost calculation.
 * Supports tiered pricing where usage determines which tier is needed,
 * and optional overage charges when usage exceeds included units.
 */

import type { SubscriptionTier } from './types'

/**
 * Select the appropriate subscription tier based on monthly usage.
 *
 * Finds the smallest tier that can accommodate the given usage.
 * If usage exceeds all tiers, returns the highest tier.
 * If no tiers provided, returns null.
 *
 * @param tiers - Available subscription tiers sorted by includedUnits ascending
 * @param monthlyUsage - Expected monthly usage (conversations, tasks, etc.)
 * @returns The selected tier, or null if no tiers available
 *
 * @example
 * const tier = selectTier([
 *   { name: 'Starter', monthlyPrice: 99, includedUnits: 1000 },
 *   { name: 'Pro', monthlyPrice: 299, includedUnits: 5000 },
 * ], 3000)
 * // Returns Pro tier (5000 >= 3000)
 */
export function selectTier(
  tiers: SubscriptionTier[],
  monthlyUsage: number
): SubscriptionTier | null {
  if (tiers.length === 0) {
    return null
  }

  // Sort tiers by includedUnits ascending
  const sortedTiers = [...tiers].sort((a, b) => {
    const aUnits = a.includedUnits ?? Infinity
    const bUnits = b.includedUnits ?? Infinity
    return aUnits - bUnits
  })

  // For user-based tiers, don't compare against conversation count.
  // Pick the lowest non-free tier as a baseline estimate since we
  // can't map conversations to user seats without more context.
  const firstTier = sortedTiers[0]
  if (firstTier?.unitType === 'users') {
    // Return lowest non-free tier, or first tier if all are free
    return sortedTiers.find(t => t.monthlyPrice > 0) ?? firstTier
  }

  // For task/conversation-based tiers, find smallest that fits usage
  for (const tier of sortedTiers) {
    const includedUnits = tier.includedUnits ?? Infinity
    if (monthlyUsage <= includedUnits) {
      return tier
    }
  }

  // Usage exceeds all tiers, return the highest one
  return sortedTiers[sortedTiers.length - 1]
}

/**
 * Calculate the total subscription cost including overage charges.
 *
 * Base price is always charged. If usage exceeds included units and
 * an overage rate is provided, additional charges are added.
 *
 * @param tier - The subscription tier
 * @param usage - Actual monthly usage
 * @param perUnitOverageRate - Optional cost per unit over the included amount
 * @returns Total monthly cost in USD
 *
 * @example
 * const cost = calculateSubscriptionCost(
 *   { name: 'Pro', monthlyPrice: 299, includedUnits: 5000 },
 *   7000, // 2000 over limit
 *   2 // $2 per overage unit
 * )
 * // Returns 4299 ($299 + 2000 * $2)
 */
export function calculateSubscriptionCost(
  tier: SubscriptionTier,
  usage: number,
  perUnitOverageRate?: number
): number {
  let totalCost = tier.monthlyPrice

  // Calculate overage if applicable
  if (tier.includedUnits !== undefined && perUnitOverageRate !== undefined) {
    const overageUnits = Math.max(0, usage - tier.includedUnits)
    totalCost += overageUnits * perUnitOverageRate
  }

  return totalCost
}
