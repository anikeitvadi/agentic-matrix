/**
 * Cost Analysis Types
 *
 * Defines the type contracts for TCO (Total Cost of Ownership) calculations.
 * Supports four pricing models: token-based, subscription, per-conversation, and hybrid.
 * Used by cost calculators to estimate platform costs based on usage parameters.
 */

/**
 * The pricing model used by a platform.
 *
 * Different platforms charge in different ways:
 * - pay-per-use: Token-based pricing (e.g., Anthropic, OpenAI)
 * - subscription: Fixed monthly/annual fee with included capacity (e.g., Tray.ai)
 * - per-conversation: Charge per conversation/interaction (e.g., Salesforce Agentforce)
 * - hybrid: Combination of base subscription plus usage charges (e.g., Microsoft Copilot)
 */
export type PricingModel = 'pay-per-use' | 'subscription' | 'per-conversation' | 'hybrid'

/**
 * Token-based pricing details for pay-per-use and hybrid models.
 *
 * Prices are specified per million tokens, which is the standard unit
 * used by LLM providers. Different model variants may have different costs.
 *
 * @property inputPricePerMillion - Cost per 1M input tokens in USD
 * @property outputPricePerMillion - Cost per 1M output tokens in USD
 * @property cachedInputDiscount - Discount percentage (0-1) for cached/repeated inputs
 * @property modelVariants - Different model tiers with their respective pricing
 */
export interface TokenPricing {
  inputPricePerMillion: number
  outputPricePerMillion: number
  cachedInputDiscount?: number
  modelVariants?: {
    name: string
    inputPrice: number
    outputPrice: number
  }[]
}

/**
 * A subscription tier with its pricing and included capacity.
 *
 * Many platforms offer tiered subscriptions where higher tiers include
 * more capacity and features. The includedUnits field specifies what's
 * bundled in the subscription before overage charges apply.
 *
 * @property name - Tier display name (e.g., 'Professional', 'Enterprise')
 * @property monthlyPrice - Base subscription cost per month in USD
 * @property includedUnits - Number of units included in subscription
 * @property unitType - What the included units measure
 */
export interface SubscriptionTier {
  name: string
  monthlyPrice: number
  includedUnits?: number
  unitType?: 'conversations' | 'users' | 'tasks' | 'tokens'
}

/**
 * Complete pricing data for a platform.
 *
 * This interface matches the extended pricing schema in velite.config.ts
 * and provides all the data needed to calculate costs for any pricing model.
 *
 * @property model - The pricing model type
 * @property details - Human-readable pricing description
 * @property tokenPricing - Token costs (for pay-per-use and hybrid)
 * @property tiers - Subscription tier options
 * @property perConversationRate - Cost per conversation in USD
 * @property includedConversations - Conversations included in base plan
 * @property enterpriseContact - Whether enterprise pricing requires sales contact
 * @property infrastructureCosts - Notes about additional infrastructure costs
 */
export interface PricingData {
  model: PricingModel
  details: string
  tokenPricing?: TokenPricing
  tiers?: SubscriptionTier[]
  perConversationRate?: number
  includedConversations?: number
  enterpriseContact?: boolean
  infrastructureCosts?: string
}

/**
 * User-provided parameters for cost estimation.
 *
 * These inputs drive the cost calculations. Users estimate their expected
 * usage patterns, and the calculator projects costs based on platform pricing.
 *
 * @property monthlyConversations - Expected conversations per month
 * @property monthlyInputTokens - Expected input tokens per month
 * @property monthlyOutputTokens - Expected output tokens per month
 * @property avgTokensPerConversation - Average tokens per conversation (for estimation)
 */
export interface UsageParameters {
  monthlyConversations: number
  monthlyInputTokens: number
  monthlyOutputTokens: number
  avgTokensPerConversation?: number
}

/**
 * A single line item in the cost breakdown.
 *
 * Provides detailed visibility into where costs come from,
 * enabling informed decisions about platform selection.
 *
 * @property category - Cost category for grouping
 * @property item - Specific cost item name
 * @property monthlyCost - Monthly cost in USD
 * @property annualCost - Annual cost in USD
 * @property notes - Additional context about this cost
 */
export interface CostBreakdown {
  category: 'platform' | 'token' | 'infrastructure' | 'personnel'
  item: string
  monthlyCost: number
  annualCost: number
  notes?: string
}

/**
 * Complete cost estimate for a single platform.
 *
 * Contains all calculated costs, engineering estimates, and TCO projections.
 * This is the primary output of the cost calculator.
 *
 * @property platformId - Matches platform slug from velite content
 * @property platformName - Display name of the platform
 * @property pricingModel - The platform's pricing model
 * @property monthlyUsageCost - Variable costs from usage (tokens, conversations)
 * @property monthlyBaseCost - Fixed subscription/base costs
 * @property monthlyTotal - Sum of usage and base costs
 * @property yearlyTotal - Annual total cost projection
 * @property engineeringDays - Expected engineering days for implementation
 * @property engineeringCost - Calculated engineering cost in USD
 * @property tcoPeriods - Total Cost of Ownership over different time horizons
 * @property breakdown - Detailed cost breakdown by category
 */
export interface CostEstimate {
  platformId: string
  platformName: string
  pricingModel: PricingModel
  monthlyUsageCost: number
  monthlyBaseCost: number
  monthlyTotal: number
  yearlyTotal: number
  engineeringDays: number
  engineeringCost: number
  tcoPeriods: {
    months12: number
    months24: number
    months36: number
  }
  breakdown: CostBreakdown[]
}

/**
 * Engineering effort estimate using PERT (Program Evaluation Review Technique).
 *
 * PERT formula: Expected = (optimistic + 4*mostLikely + pessimistic) / 6
 * This provides more realistic estimates by accounting for uncertainty.
 *
 * @property optimisticDays - Best case scenario (everything goes perfectly)
 * @property mostLikelyDays - Most probable duration
 * @property pessimisticDays - Worst case scenario (significant complications)
 * @property expectedDays - PERT-weighted expected duration
 * @property confidenceRange - Range within which actual duration likely falls
 */
export interface EngineeringEstimate {
  optimisticDays: number
  mostLikelyDays: number
  pessimisticDays: number
  expectedDays: number
  confidenceRange: {
    low: number
    high: number
  }
}

/**
 * Platform complexity factors that affect engineering effort.
 *
 * Different platform types and integration requirements significantly
 * impact implementation timelines and costs.
 *
 * @property tier - Platform category from velite schema
 * @property hasNativeIntegration - Whether platform has native connectors for target systems
 * @property requiresCustomCode - Whether significant custom development is needed
 * @property complianceRequirements - Compliance standards that must be met
 */
export interface PlatformComplexity {
  tier: 'enterprise-os' | 'ipaas-agent' | 'developer-first' | 'vertical'
  hasNativeIntegration: boolean
  requiresCustomCode: boolean
  complianceRequirements: string[]
}

/**
 * Configuration for TCO calculation.
 *
 * Allows customization of cost assumptions like engineering rates
 * and infrastructure markups.
 *
 * @property engineeringDailyRate - Daily rate for engineering work in USD
 * @property infrastructureMarkup - Percentage (0-1) to add for infrastructure
 * @property contingencyBuffer - Percentage (0-1) buffer for unexpected costs
 */
export interface TcoConfig {
  engineeringDailyRate: number
  infrastructureMarkup: number
  contingencyBuffer: number
}

/**
 * Default TCO configuration values.
 *
 * Based on industry averages:
 * - Engineering daily rate: $800/day (~$100/hr for senior engineer)
 * - Infrastructure markup: 15% for cloud hosting, monitoring, etc.
 * - Contingency buffer: 20% for unexpected costs
 */
export const DEFAULT_TCO_CONFIG: TcoConfig = {
  engineeringDailyRate: 800,
  infrastructureMarkup: 0.15,
  contingencyBuffer: 0.20,
}

/**
 * Token usage for a billing period.
 *
 * Separates input and output tokens because they are priced differently
 * (output tokens typically cost 3-5x more than input tokens).
 */
export interface TokenUsage {
  monthlyInputTokens: number
  monthlyOutputTokens: number
}

/**
 * A data point in the TCO timeline.
 *
 * Used for generating cumulative cost charts over time.
 * Each point represents the total accumulated cost up to that month.
 *
 * @property month - The month number (1-indexed)
 * @property platformFees - Cumulative platform/subscription fees
 * @property tokenCosts - Cumulative token/usage costs
 * @property infrastructure - Cumulative infrastructure costs
 * @property personnel - Cumulative engineering/personnel costs
 * @property total - Total cumulative cost
 */
export interface TCODataPoint {
  month: number
  platformFees: number
  tokenCosts: number
  infrastructure: number
  personnel: number
  total: number
}

/**
 * Platform tier categories that determine base engineering estimates.
 */
export type PlatformTier = 'enterprise-os' | 'ipaas-agent' | 'developer-first' | 'vertical'
