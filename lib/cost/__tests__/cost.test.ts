/**
 * Cost Calculator Tests
 *
 * TDD tests for cost calculation modules:
 * - Token-based pricing calculations
 * - Subscription tier selection
 * - Engineering time estimation (three-point formula)
 * - Total Cost of Ownership (TCO) aggregation
 */

import { describe, it, expect } from 'vitest'
import {
  calculateTokenCost,
  conversationsToTokens,
} from '../token-calculator'
import {
  selectTier,
  calculateSubscriptionCost,
} from '../subscription-calculator'
import {
  estimateEngineeringDays,
  engineeringDaysToCost,
} from '../engineering-estimate'
import {
  calculatePlatformCost,
  generateTCOTimeline,
} from '../tco-calculator'
import type {
  TokenPricing,
  TokenUsage,
  SubscriptionTier,
  CostEstimate,
} from '../types'

// =============================================================================
// Token Calculator Tests
// =============================================================================

describe('Token Calculator', () => {
  describe('calculateTokenCost', () => {
    it('should calculate cost for input and output tokens separately', () => {
      const pricing: TokenPricing = {
        inputPricePerMillion: 3, // $3 per 1M input tokens
        outputPricePerMillion: 15, // $15 per 1M output tokens
      }
      const usage: TokenUsage = {
        monthlyInputTokens: 1_000_000, // 1M input tokens
        monthlyOutputTokens: 250_000, // 250K output tokens
      }

      const cost = calculateTokenCost(pricing, usage)

      // (1M / 1M) * $3 + (250K / 1M) * $15 = $3 + $3.75 = $6.75
      expect(cost).toBe(6.75)
    })

    it('should return 0 for zero tokens', () => {
      const pricing: TokenPricing = {
        inputPricePerMillion: 3,
        outputPricePerMillion: 15,
      }
      const usage: TokenUsage = {
        monthlyInputTokens: 0,
        monthlyOutputTokens: 0,
      }

      const cost = calculateTokenCost(pricing, usage)

      expect(cost).toBe(0)
    })

    it('should return 0 for undefined pricing', () => {
      const usage: TokenUsage = {
        monthlyInputTokens: 1_000_000,
        monthlyOutputTokens: 250_000,
      }

      const cost = calculateTokenCost(undefined, usage)

      expect(cost).toBe(0)
    })

    it('should handle very large token volumes', () => {
      const pricing: TokenPricing = {
        inputPricePerMillion: 3,
        outputPricePerMillion: 15,
      }
      const usage: TokenUsage = {
        monthlyInputTokens: 100_000_000, // 100M input tokens
        monthlyOutputTokens: 25_000_000, // 25M output tokens
      }

      const cost = calculateTokenCost(pricing, usage)

      // (100M / 1M) * $3 + (25M / 1M) * $15 = $300 + $375 = $675
      expect(cost).toBe(675)
    })

    it('should handle fractional token costs correctly', () => {
      const pricing: TokenPricing = {
        inputPricePerMillion: 3,
        outputPricePerMillion: 15,
      }
      const usage: TokenUsage = {
        monthlyInputTokens: 500_000, // 500K
        monthlyOutputTokens: 100_000, // 100K
      }

      const cost = calculateTokenCost(pricing, usage)

      // (0.5M) * $3 + (0.1M) * $15 = $1.50 + $1.50 = $3.00
      expect(cost).toBe(3)
    })
  })

  describe('conversationsToTokens', () => {
    it('should convert conversations to estimated token usage', () => {
      const tokens = conversationsToTokens(1000)

      // Average conversation: 2,000 input tokens, 500 output tokens
      expect(tokens.monthlyInputTokens).toBe(2_000_000)
      expect(tokens.monthlyOutputTokens).toBe(500_000)
    })

    it('should handle zero conversations', () => {
      const tokens = conversationsToTokens(0)

      expect(tokens.monthlyInputTokens).toBe(0)
      expect(tokens.monthlyOutputTokens).toBe(0)
    })
  })
})

// =============================================================================
// Subscription Calculator Tests
// =============================================================================

describe('Subscription Calculator', () => {
  const sampleTiers: SubscriptionTier[] = [
    { name: 'Starter', monthlyPrice: 99, includedUnits: 1000, unitType: 'conversations' },
    { name: 'Professional', monthlyPrice: 299, includedUnits: 5000, unitType: 'conversations' },
    { name: 'Enterprise', monthlyPrice: 999, includedUnits: 25000, unitType: 'conversations' },
  ]

  describe('selectTier', () => {
    it('should select the smallest tier that accommodates usage', () => {
      const tier = selectTier(sampleTiers, 3000)

      expect(tier).not.toBeNull()
      expect(tier!.name).toBe('Professional')
    })

    it('should select first tier for usage within first tier', () => {
      const tier = selectTier(sampleTiers, 500)

      expect(tier).not.toBeNull()
      expect(tier!.name).toBe('Starter')
    })

    it('should select highest tier when usage exceeds all tiers', () => {
      const tier = selectTier(sampleTiers, 50000)

      expect(tier).not.toBeNull()
      expect(tier!.name).toBe('Enterprise')
    })

    it('should return null when no tiers provided', () => {
      const tier = selectTier([], 3000)

      expect(tier).toBeNull()
    })

    it('should select tier at exact boundary', () => {
      const tier = selectTier(sampleTiers, 5000)

      // 5000 should fit in Professional tier (includedUnits: 5000)
      expect(tier).not.toBeNull()
      expect(tier!.name).toBe('Professional')
    })
  })

  describe('calculateSubscriptionCost', () => {
    it('should return base price when usage within included units', () => {
      const tier: SubscriptionTier = {
        name: 'Professional',
        monthlyPrice: 299,
        includedUnits: 5000,
        unitType: 'conversations',
      }

      const cost = calculateSubscriptionCost(tier, 3000)

      expect(cost).toBe(299)
    })

    it('should add overage cost when usage exceeds included units', () => {
      const tier: SubscriptionTier = {
        name: 'Professional',
        monthlyPrice: 299,
        includedUnits: 5000,
        unitType: 'conversations',
      }

      // 7000 usage, 5000 included = 2000 overage at $2/unit
      const cost = calculateSubscriptionCost(tier, 7000, 2)

      expect(cost).toBe(299 + 2000 * 2) // $299 + $4000 = $4299
    })

    it('should return base price when no overage rate provided', () => {
      const tier: SubscriptionTier = {
        name: 'Professional',
        monthlyPrice: 299,
        includedUnits: 5000,
        unitType: 'conversations',
      }

      // No overage rate means no overage charge
      const cost = calculateSubscriptionCost(tier, 7000)

      expect(cost).toBe(299)
    })

    it('should handle tier with unlimited units', () => {
      const tier: SubscriptionTier = {
        name: 'Unlimited',
        monthlyPrice: 1999,
        unitType: 'conversations',
        // No includedUnits means unlimited
      }

      const cost = calculateSubscriptionCost(tier, 100000, 2)

      // No overage since unlimited
      expect(cost).toBe(1999)
    })
  })
})

// =============================================================================
// Engineering Estimate Tests
// =============================================================================

describe('Engineering Estimator', () => {
  describe('estimateEngineeringDays', () => {
    it('should use three-point formula (O + 4M + P) / 6', () => {
      // enterprise-os tier base: O=15, M=25, P=45
      const estimate = estimateEngineeringDays('enterprise-os', {
        hasNativeIntegration: true,
        requiresCustomCode: false,
        complianceRequirements: [],
      })

      // No multipliers: (15 + 4*25 + 45) / 6 = (15 + 100 + 45) / 6 = 160 / 6 = 26.67 ~ 27
      expect(estimate.expectedDays).toBeCloseTo(26.67, 0)
      expect(estimate.optimisticDays).toBe(15)
      expect(estimate.mostLikelyDays).toBe(25)
      expect(estimate.pessimisticDays).toBe(45)
    })

    it('should apply multiplier for custom code requirement', () => {
      // developer-first tier base: O=10, M=20, P=35
      // With custom code: +25% multiplier
      const estimate = estimateEngineeringDays('developer-first', {
        hasNativeIntegration: true,
        requiresCustomCode: true,
        complianceRequirements: [],
      })

      // 1.25 multiplier: O=12.5~13, M=25, P=43.75~44
      // (13 + 4*25 + 44) / 6 = (13 + 100 + 44) / 6 = 157 / 6 = 26.17 ~ 26
      expect(estimate.expectedDays).toBeCloseTo(26, 0)
    })

    it('should apply multiplier for missing native integration', () => {
      // ipaas-agent tier base: O=5, M=10, P=20
      // Without native integration: +30% multiplier
      const estimate = estimateEngineeringDays('ipaas-agent', {
        hasNativeIntegration: false,
        requiresCustomCode: false,
        complianceRequirements: [],
      })

      // 1.3 multiplier: O=6.5~7, M=13, P=26
      // (7 + 4*13 + 26) / 6 = (7 + 52 + 26) / 6 = 85 / 6 = 14.17 ~ 14
      expect(estimate.expectedDays).toBeGreaterThan(10) // Should be ~14
    })

    it('should apply multiplier for compliance requirements', () => {
      // enterprise-os with 2 compliance requirements
      const estimate = estimateEngineeringDays('enterprise-os', {
        hasNativeIntegration: true,
        requiresCustomCode: false,
        complianceRequirements: ['SOC2', 'HIPAA'],
      })

      // +10% per compliance req = 1.2 multiplier
      // Base: O=15, M=25, P=45 -> with 1.2: O=18, M=30, P=54
      // (18 + 4*30 + 54) / 6 = 192 / 6 = 32
      expect(estimate.expectedDays).toBeGreaterThan(26) // Should be ~32
    })

    it('should include confidence range in estimate', () => {
      const estimate = estimateEngineeringDays('developer-first', {
        hasNativeIntegration: true,
        requiresCustomCode: false,
        complianceRequirements: [],
      })

      // Confidence range based on std dev: (P - O) / 6
      expect(estimate.confidenceRange).toBeDefined()
      expect(estimate.confidenceRange.low).toBeLessThan(estimate.expectedDays)
      expect(estimate.confidenceRange.high).toBeGreaterThan(estimate.expectedDays)
    })

    it('should handle vertical tier (simpler setup)', () => {
      // vertical tier base: O=3, M=7, P=15
      const estimate = estimateEngineeringDays('vertical', {
        hasNativeIntegration: true,
        requiresCustomCode: false,
        complianceRequirements: [],
      })

      // (3 + 4*7 + 15) / 6 = (3 + 28 + 15) / 6 = 46 / 6 = 7.67 ~ 8
      expect(estimate.expectedDays).toBeLessThan(10)
    })
  })

  describe('engineeringDaysToCost', () => {
    it('should calculate cost with default rate and hours', () => {
      // Default: $150/hr, 8 hrs/day
      const cost = engineeringDaysToCost(25)

      // 25 * 8 * 150 = $30,000
      expect(cost).toBe(30000)
    })

    it('should accept custom hourly rate', () => {
      const cost = engineeringDaysToCost(25, 200)

      // 25 * 8 * 200 = $40,000
      expect(cost).toBe(40000)
    })

    it('should accept custom hours per day', () => {
      const cost = engineeringDaysToCost(25, 150, 6)

      // 25 * 6 * 150 = $22,500
      expect(cost).toBe(22500)
    })

    it('should return 0 for 0 days', () => {
      const cost = engineeringDaysToCost(0)

      expect(cost).toBe(0)
    })
  })
})

// =============================================================================
// TCO Calculator Tests
// =============================================================================

describe('TCO Calculator', () => {
  // Mock platform data for testing
  const mockTokenPlatform = {
    slug: 'anthropic-claude',
    title: 'Anthropic Claude',
    tier: 'developer-first' as const,
    pricing: {
      model: 'pay-per-use' as const,
      tokenPricing: {
        inputPricePerMillion: 3,
        outputPricePerMillion: 15,
      },
    },
  }

  const mockSubscriptionPlatform = {
    slug: 'tray-ai',
    title: 'Tray.ai',
    tier: 'ipaas-agent' as const,
    pricing: {
      model: 'subscription' as const,
      tiers: [
        { name: 'Professional', monthlyPrice: 995, includedUnits: 5000, unitType: 'tasks' as const },
        { name: 'Enterprise', monthlyPrice: 3495, includedUnits: 25000, unitType: 'tasks' as const },
      ],
    },
  }

  const mockUsageParams = {
    monthlyConversations: 10000,
    monthlyInputTokens: 20_000_000,
    monthlyOutputTokens: 5_000_000,
    complexity: {
      hasNativeIntegration: true,
      requiresCustomCode: false,
      complianceRequirements: [] as string[],
    },
  }

  describe('calculatePlatformCost', () => {
    it('should calculate token-based platform costs correctly', () => {
      const estimate = calculatePlatformCost(mockTokenPlatform, mockUsageParams)

      // Token cost: (20M/1M)*$3 + (5M/1M)*$15 = $60 + $75 = $135/month
      expect(estimate.monthlyUsageCost).toBe(135)
      expect(estimate.monthlyBaseCost).toBe(0) // No base subscription
      expect(estimate.monthlyTotal).toBe(135)
    })

    it('should calculate subscription-based platform costs correctly', () => {
      const estimate = calculatePlatformCost(mockSubscriptionPlatform, {
        ...mockUsageParams,
        monthlyConversations: 10000, // Will need Enterprise tier
      })

      // Should select Enterprise tier ($3495) since 10000 > 5000
      expect(estimate.monthlyBaseCost).toBe(3495)
    })

    it('should include engineering cost in TCO', () => {
      const estimate = calculatePlatformCost(mockTokenPlatform, mockUsageParams)

      expect(estimate.engineeringDays).toBeGreaterThan(0)
      expect(estimate.engineeringCost).toBeGreaterThan(0)
    })

    it('should compute 12/24/36 month TCO projections', () => {
      const estimate = calculatePlatformCost(mockTokenPlatform, mockUsageParams)

      expect(estimate.tcoPeriods).toBeDefined()
      expect(estimate.tcoPeriods.months12).toBeGreaterThan(0)
      expect(estimate.tcoPeriods.months24).toBeGreaterThan(estimate.tcoPeriods.months12)
      expect(estimate.tcoPeriods.months36).toBeGreaterThan(estimate.tcoPeriods.months24)
    })

    it('should use provided engineer rate', () => {
      const estimate1 = calculatePlatformCost(mockTokenPlatform, mockUsageParams, 150)
      const estimate2 = calculatePlatformCost(mockTokenPlatform, mockUsageParams, 200)

      // Higher rate should result in higher engineering cost
      expect(estimate2.engineeringCost).toBeGreaterThan(estimate1.engineeringCost)
    })

    it('should return correct platform identification', () => {
      const estimate = calculatePlatformCost(mockTokenPlatform, mockUsageParams)

      expect(estimate.platformId).toBe('anthropic-claude')
      expect(estimate.platformName).toBe('Anthropic Claude')
    })

    it('should include cost breakdown', () => {
      const estimate = calculatePlatformCost(mockTokenPlatform, mockUsageParams)

      expect(estimate.breakdown).toBeDefined()
      expect(estimate.breakdown.length).toBeGreaterThan(0)

      // Should have at least token and personnel categories
      const categories = estimate.breakdown.map((b) => b.category)
      expect(categories).toContain('token')
      expect(categories).toContain('personnel')
    })
  })

  describe('generateTCOTimeline', () => {
    it('should generate monthly cumulative costs', () => {
      const estimate: CostEstimate = {
        platformId: 'test',
        platformName: 'Test Platform',
        pricingModel: 'pay-per-use',
        monthlyUsageCost: 100,
        monthlyBaseCost: 50,
        monthlyTotal: 150,
        yearlyTotal: 1800,
        engineeringDays: 10,
        engineeringCost: 12000,
        tcoPeriods: {
          months12: 13800,
          months24: 15600,
          months36: 17400,
        },
        breakdown: [],
      }

      const timeline = generateTCOTimeline(estimate, 12)

      expect(timeline).toHaveLength(12)
    })

    it('should have increasing total values', () => {
      const estimate: CostEstimate = {
        platformId: 'test',
        platformName: 'Test Platform',
        pricingModel: 'pay-per-use',
        monthlyUsageCost: 100,
        monthlyBaseCost: 50,
        monthlyTotal: 150,
        yearlyTotal: 1800,
        engineeringDays: 10,
        engineeringCost: 12000,
        tcoPeriods: {
          months12: 13800,
          months24: 15600,
          months36: 17400,
        },
        breakdown: [],
      }

      const timeline = generateTCOTimeline(estimate, 12)

      for (let i = 1; i < timeline.length; i++) {
        expect(timeline[i].total).toBeGreaterThanOrEqual(timeline[i - 1].total)
      }
    })

    it('should spread engineering cost over first 3 months', () => {
      const estimate: CostEstimate = {
        platformId: 'test',
        platformName: 'Test Platform',
        pricingModel: 'pay-per-use',
        monthlyUsageCost: 0,
        monthlyBaseCost: 0,
        monthlyTotal: 0,
        yearlyTotal: 0,
        engineeringDays: 10,
        engineeringCost: 12000, // $12K spread over 3 months = $4K/month
        tcoPeriods: {
          months12: 12000,
          months24: 12000,
          months36: 12000,
        },
        breakdown: [],
      }

      const timeline = generateTCOTimeline(estimate, 6)

      // Month 3 should have full engineering cost accumulated
      expect(timeline[2].personnel).toBe(12000)
      // Month 4+ should also have full engineering cost (cumulative, no more adds)
      expect(timeline[3].personnel).toBe(12000)
    })

    it('should default to 36 months', () => {
      const estimate: CostEstimate = {
        platformId: 'test',
        platformName: 'Test Platform',
        pricingModel: 'pay-per-use',
        monthlyUsageCost: 100,
        monthlyBaseCost: 50,
        monthlyTotal: 150,
        yearlyTotal: 1800,
        engineeringDays: 10,
        engineeringCost: 12000,
        tcoPeriods: {
          months12: 13800,
          months24: 15600,
          months36: 17400,
        },
        breakdown: [],
      }

      const timeline = generateTCOTimeline(estimate)

      expect(timeline).toHaveLength(36)
    })

    it('should include correct month numbers', () => {
      const estimate: CostEstimate = {
        platformId: 'test',
        platformName: 'Test Platform',
        pricingModel: 'pay-per-use',
        monthlyUsageCost: 100,
        monthlyBaseCost: 50,
        monthlyTotal: 150,
        yearlyTotal: 1800,
        engineeringDays: 10,
        engineeringCost: 12000,
        tcoPeriods: {
          months12: 13800,
          months24: 15600,
          months36: 17400,
        },
        breakdown: [],
      }

      const timeline = generateTCOTimeline(estimate, 12)

      expect(timeline[0].month).toBe(1)
      expect(timeline[11].month).toBe(12)
    })
  })
})
