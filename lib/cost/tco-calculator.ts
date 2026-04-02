/**
 * TCO (Total Cost of Ownership) Calculator
 *
 * Aggregates all cost components into a comprehensive cost estimate:
 * - Platform/subscription costs
 * - Token/usage costs
 * - Engineering/implementation costs
 *
 * Provides projections over 12, 24, and 36 month timeframes.
 */

import type {
  CostEstimate,
  CostBreakdown,
  TCODataPoint,
  PricingModel,
  SubscriptionTier,
  PlatformComplexity,
  PlatformTier,
} from './types'
import { calculateTokenCost } from './token-calculator'
import { selectTier, calculateSubscriptionCost } from './subscription-calculator'
import { estimateEngineeringDays, engineeringDaysToCost } from './engineering-estimate'

/**
 * Platform data shape expected by the cost calculator.
 */
interface PlatformForCost {
  slug: string
  title: string
  tier: PlatformTier
  pricing: {
    model: PricingModel
    tokenPricing?: {
      inputPricePerMillion: number
      outputPricePerMillion: number
    }
    tiers?: SubscriptionTier[]
    perConversationRate?: number
    baseSubscription?: number
  }
}

/**
 * Usage parameters for cost calculation.
 */
interface UsageParamsForCost {
  monthlyConversations: number
  monthlyInputTokens: number
  monthlyOutputTokens: number
  complexity: Omit<PlatformComplexity, 'tier'>
}

/**
 * Calculate the complete cost estimate for a platform.
 *
 * Handles all pricing models:
 * - pay-per-use: Token-based costs only
 * - subscription: Tier selection based on usage
 * - per-conversation: Per-interaction charges
 * - hybrid: Base subscription + usage charges
 *
 * @param platform - Platform with pricing data
 * @param usageParams - Expected usage and complexity factors
 * @param engineerRate - Hourly rate for engineering (default: $150)
 * @returns Complete cost estimate with breakdown and TCO projections
 */
export function calculatePlatformCost(
  platform: PlatformForCost,
  usageParams: UsageParamsForCost,
  engineerRate: number = 150
): CostEstimate {
  const { pricing } = platform

  let monthlyUsageCost = 0
  let monthlyBaseCost = 0
  const breakdown: CostBreakdown[] = []

  // Calculate costs based on pricing model
  switch (pricing.model) {
    case 'pay-per-use': {
      monthlyUsageCost = calculateTokenCost(pricing.tokenPricing, {
        monthlyInputTokens: usageParams.monthlyInputTokens,
        monthlyOutputTokens: usageParams.monthlyOutputTokens,
      })

      // For open-source/free frameworks ($0 token pricing), estimate LLM provider costs
      // since users still pay their chosen provider (OpenAI, Anthropic, etc.)
      if (monthlyUsageCost === 0 && pricing.tokenPricing &&
          pricing.tokenPricing.inputPricePerMillion === 0 && pricing.tokenPricing.outputPricePerMillion === 0) {
        // Estimate using mid-range LLM pricing (~$2.50/$10 per 1M tokens)
        const estimatedLLMCost =
          (usageParams.monthlyInputTokens / 1_000_000) * 2.5 +
          (usageParams.monthlyOutputTokens / 1_000_000) * 10
        monthlyUsageCost = estimatedLLMCost

        breakdown.push({
          category: 'token',
          item: 'Estimated LLM provider cost',
          monthlyCost: monthlyUsageCost,
          annualCost: monthlyUsageCost * 12,
          notes: `Framework is free — estimated using mid-range LLM pricing ($2.50/$10 per 1M tokens)`,
        })
      } else if (monthlyUsageCost > 0) {
        breakdown.push({
          category: 'token',
          item: 'Token usage',
          monthlyCost: monthlyUsageCost,
          annualCost: monthlyUsageCost * 12,
          notes: `${(usageParams.monthlyInputTokens / 1_000_000).toFixed(1)}M input + ${(usageParams.monthlyOutputTokens / 1_000_000).toFixed(1)}M output tokens/month`,
        })
      }

      monthlyBaseCost = 0
      break
    }

    case 'subscription': {
      if (pricing.tiers && pricing.tiers.length > 0) {
        const tier = selectTier(pricing.tiers, usageParams.monthlyConversations)
        if (tier) {
          monthlyBaseCost = calculateSubscriptionCost(tier, usageParams.monthlyConversations)
          breakdown.push({
            category: 'platform',
            item: `${tier.name} subscription`,
            monthlyCost: monthlyBaseCost,
            annualCost: monthlyBaseCost * 12,
            notes: `Includes ${tier.includedUnits?.toLocaleString() ?? 'unlimited'} ${tier.unitType ?? 'units'}/month`,
          })
        }
      }
      monthlyUsageCost = 0
      break
    }

    case 'per-conversation': {
      monthlyBaseCost = pricing.baseSubscription ?? 0
      monthlyUsageCost = usageParams.monthlyConversations * (pricing.perConversationRate ?? 0)

      if (monthlyBaseCost > 0) {
        breakdown.push({
          category: 'platform',
          item: 'Base subscription',
          monthlyCost: monthlyBaseCost,
          annualCost: monthlyBaseCost * 12,
        })
      }

      if (monthlyUsageCost > 0) {
        breakdown.push({
          category: 'token',
          item: 'Per-conversation charges',
          monthlyCost: monthlyUsageCost,
          annualCost: monthlyUsageCost * 12,
          notes: `${usageParams.monthlyConversations.toLocaleString()} conversations at $${pricing.perConversationRate}/each`,
        })
      }
      break
    }

    case 'hybrid': {
      // Hybrid: base subscription + token usage
      // Check tiers for base cost if baseSubscription isn't set directly
      if (pricing.baseSubscription != null) {
        monthlyBaseCost = pricing.baseSubscription
      } else if (pricing.tiers && pricing.tiers.length > 0) {
        const tier = selectTier(pricing.tiers, usageParams.monthlyConversations)
        if (tier) {
          monthlyBaseCost = calculateSubscriptionCost(tier, usageParams.monthlyConversations)
          breakdown.push({
            category: 'platform',
            item: `${tier.name} subscription`,
            monthlyCost: monthlyBaseCost,
            annualCost: monthlyBaseCost * 12,
            notes: `Includes ${tier.includedUnits?.toLocaleString() ?? 'unlimited'} ${tier.unitType ?? 'units'}/month`,
          })
        }
      }

      monthlyUsageCost = calculateTokenCost(pricing.tokenPricing, {
        monthlyInputTokens: usageParams.monthlyInputTokens,
        monthlyOutputTokens: usageParams.monthlyOutputTokens,
      })

      // For hybrid frameworks with $0 token pricing, estimate LLM costs
      if (monthlyUsageCost === 0 && pricing.tokenPricing &&
          pricing.tokenPricing.inputPricePerMillion === 0 && pricing.tokenPricing.outputPricePerMillion === 0) {
        const estimatedLLMCost =
          (usageParams.monthlyInputTokens / 1_000_000) * 2.5 +
          (usageParams.monthlyOutputTokens / 1_000_000) * 10
        monthlyUsageCost = estimatedLLMCost

        breakdown.push({
          category: 'token',
          item: 'Estimated LLM provider cost',
          monthlyCost: monthlyUsageCost,
          annualCost: monthlyUsageCost * 12,
          notes: `Framework is free — estimated using mid-range LLM pricing ($2.50/$10 per 1M tokens)`,
        })
      }

      if (monthlyBaseCost > 0 && !breakdown.some(b => b.category === 'platform')) {
        breakdown.push({
          category: 'platform',
          item: 'Base subscription',
          monthlyCost: monthlyBaseCost,
          annualCost: monthlyBaseCost * 12,
        })
      }

      if (monthlyUsageCost > 0) {
        breakdown.push({
          category: 'token',
          item: 'Token usage',
          monthlyCost: monthlyUsageCost,
          annualCost: monthlyUsageCost * 12,
        })
      }
      break
    }
  }

  const monthlyTotal = monthlyUsageCost + monthlyBaseCost
  const yearlyTotal = monthlyTotal * 12

  // Calculate engineering costs
  const engineeringEstimate = estimateEngineeringDays(platform.tier, {
    hasNativeIntegration: usageParams.complexity.hasNativeIntegration,
    requiresCustomCode: usageParams.complexity.requiresCustomCode,
    complianceRequirements: usageParams.complexity.complianceRequirements,
  })
  const engineeringCost = engineeringDaysToCost(engineeringEstimate.expectedDays, engineerRate)

  breakdown.push({
    category: 'personnel',
    item: 'Engineering implementation',
    monthlyCost: 0, // One-time cost
    annualCost: engineeringCost,
    notes: `~${engineeringEstimate.expectedDays} days at $${engineerRate}/hr`,
  })

  // Calculate TCO periods (engineering is one-time, added to first year)
  const tcoPeriods = {
    months12: engineeringCost + monthlyTotal * 12,
    months24: engineeringCost + monthlyTotal * 24,
    months36: engineeringCost + monthlyTotal * 36,
  }

  return {
    platformId: platform.slug,
    platformName: platform.title,
    pricingModel: pricing.model,
    monthlyUsageCost,
    monthlyBaseCost,
    monthlyTotal,
    yearlyTotal,
    engineeringDays: engineeringEstimate.expectedDays,
    engineeringCost,
    tcoPeriods,
    breakdown,
  }
}

/**
 * Generate a monthly TCO timeline for visualization.
 *
 * Creates cumulative cost data points for each month, useful for
 * rendering line or area charts showing cost accumulation over time.
 *
 * Engineering costs are spread over the first 3 months (implementation period).
 *
 * @param estimate - Cost estimate to generate timeline from
 * @param months - Number of months to project (default: 36)
 * @returns Array of monthly data points with cumulative costs
 */
export function generateTCOTimeline(
  estimate: CostEstimate,
  months: number = 36
): TCODataPoint[] {
  const personnelPerMonth = estimate.engineeringCost / 3 // Spread over 3 months

  return Array.from({ length: months }, (_, i) => {
    const month = i + 1

    // Cumulative costs
    const cumulativeBase = estimate.monthlyBaseCost * month
    const cumulativeUsage = estimate.monthlyUsageCost * month

    // Personnel costs spread over first 3 months, then capped
    const cumulativePersonnel =
      month <= 3 ? personnelPerMonth * month : estimate.engineeringCost

    return {
      month,
      platformFees: cumulativeBase,
      tokenCosts: cumulativeUsage,
      infrastructure: 0, // Could be extended for cloud infra costs
      personnel: cumulativePersonnel,
      total: cumulativeBase + cumulativeUsage + cumulativePersonnel,
    }
  })
}
