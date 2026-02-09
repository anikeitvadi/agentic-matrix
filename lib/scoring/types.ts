/**
 * Scoring Engine Types
 *
 * Defines the type contracts for the SAW (Simple Additive Weighting) scoring system.
 * Used by recommendation engine to compare platforms fairly across different criteria.
 */

import type { Platform } from '.velite'

/**
 * A single scoring criterion with its raw and normalized values.
 *
 * The scoring engine normalizes all criteria to 0-1 scale using min-max normalization,
 * allowing fair comparison between criteria on different scales (e.g., price $0-$10k vs features 0-5).
 *
 * @property name - Criterion identifier (e.g., 'integrationFit', 'budgetFit')
 * @property weight - Importance weight between 0 and 1 (all weights must sum to 1.0)
 * @property value - Raw value before normalization (original scale)
 * @property normalizedValue - Value after min-max normalization (0-1 scale)
 * @property higherIsBetter - Whether higher raw values are better (false for price, timeline)
 */
export interface Criterion {
  name: string
  weight: number
  value: number
  normalizedValue: number
  higherIsBetter: boolean
}

/**
 * Audit trail entry for scoring transparency.
 *
 * Each entry explains how a criterion score was calculated,
 * enabling users to understand and verify recommendation logic.
 *
 * @property criterionName - Which criterion this entry explains
 * @property rawValue - Original value (may be string for display purposes)
 * @property normalizedValue - Value after normalization (0-1)
 * @property weight - The weight applied to this criterion
 * @property weightedScore - Final score contribution (weight * normalizedValue)
 * @property reasoning - Human-readable explanation of the score
 */
export interface AuditEntry {
  criterionName: string
  rawValue: number | string
  normalizedValue: number
  weight: number
  weightedScore: number
  reasoning: string
}

/**
 * Complete scoring result for a single platform.
 *
 * Contains the total score, breakdown by criteria, and full audit trail
 * for transparency and explainability.
 *
 * @property platformId - Matches platform slug from velite content
 * @property platformName - Display name of the platform
 * @property totalScore - Weighted sum of all criteria (0-100 scale)
 * @property criteriaScores - Individual criterion scores with normalization details
 * @property auditTrail - Step-by-step explanation of how score was calculated
 */
export interface PlatformScore {
  platformId: string
  platformName: string
  totalScore: number
  criteriaScores: Criterion[]
  auditTrail: AuditEntry[]
}

/**
 * Weight configuration for scoring criteria.
 *
 * Weights determine relative importance of each criterion in the final score.
 * All weights MUST sum to exactly 1.0 to ensure scores are comparable.
 *
 * @example
 * // Valid weight config (sums to 1.0):
 * const weights: WeightConfig = {
 *   integrationFit: 0.25,
 *   complianceMatch: 0.25,
 *   budgetFit: 0.20,
 *   featureMatch: 0.15,
 *   stackCompatibility: 0.15
 * }
 *
 * @property integrationFit - Weight for integration capabilities match
 * @property complianceMatch - Weight for compliance requirements alignment
 * @property budgetFit - Weight for budget/pricing fit (lower price = better)
 * @property featureMatch - Weight for feature requirements match
 * @property stackCompatibility - Weight for tech stack compatibility
 */
export interface WeightConfig {
  integrationFit: number
  complianceMatch: number
  budgetFit: number
  featureMatch: number
  stackCompatibility: number
}

/**
 * Context passed to the scoring engine.
 *
 * Contains all data needed to score platforms against user requirements.
 *
 * @property allPlatforms - Available platforms from velite content
 * @property userAssessment - User's answers from assessment form
 * @property weightConfig - Criterion weights (must sum to 1.0)
 */
export interface ScoringContext {
  allPlatforms: Platform[]
  userAssessment: Record<string, unknown>
  weightConfig: WeightConfig
}
