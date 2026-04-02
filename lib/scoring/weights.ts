/**
 * Weight Derivation for SAW Scoring Engine
 *
 * Derives criterion weights from user assessment responses.
 * Weights determine relative importance of each scoring criterion.
 *
 * Key constraints:
 * - All weights must sum to exactly 1.0
 * - No single weight can exceed 0.35 (ensures multiple criteria influence results)
 */

import type { WeightConfig } from './types'

/**
 * Default weights when no assessment data influences weights.
 * Equal distribution across all 5 criteria (0.20 each).
 */
export const DEFAULT_WEIGHTS: WeightConfig = {
  integrationFit: 0.2,
  complianceMatch: 0.2,
  budgetFit: 0.2,
  featureMatch: 0.2,
  stackCompatibility: 0.2,
}

/**
 * Maximum weight any single criterion can have.
 * Prevents one criterion from dominating the score.
 */
const MAX_WEIGHT = 0.35

/**
 * User assessment data that influences weight derivation.
 * These fields come from the assessment questionnaire.
 */
interface AssessmentInput {
  integrationNeeds?: string[]
  complianceRequirements?: string[]
  budgetRange?: string
  useCases?: string[]
  primaryUseCases?: string[]
  techStack?: string[]
  currentStack?: string[]
  teamTechnicalLevel?: string
  organizationSize?: string
}

/**
 * Derives criterion weights from user assessment responses.
 *
 * The algorithm:
 * 1. Start with base weights (slightly below default to allow adjustment)
 * 2. Add boosts based on assessment emphasis:
 *    - More integrations needed → higher integrationFit weight
 *    - Compliance requirements present → higher complianceMatch weight
 *    - Tight budget → higher budgetFit weight
 *    - Many use cases → higher featureMatch weight
 *    - Tech stack specified → higher stackCompatibility weight
 * 3. Cap each weight at MAX_WEIGHT (0.35)
 * 4. Normalize all weights to sum to exactly 1.0
 *
 * @param assessment - User's assessment questionnaire responses
 * @returns WeightConfig with weights summing to 1.0
 */
export function deriveWeights(assessment: AssessmentInput): WeightConfig {
  // Start with base weights (lower than default to allow room for boosts)
  const weights = {
    integrationFit: 0.15,
    complianceMatch: 0.15,
    budgetFit: 0.15,
    featureMatch: 0.15,
    stackCompatibility: 0.15,
  }

  // Boost weights based on assessment emphasis

  // Integration emphasis: more integrations needed = higher weight
  if (assessment.integrationNeeds && assessment.integrationNeeds.length > 0) {
    const boost = Math.min(0.15, assessment.integrationNeeds.length * 0.03)
    weights.integrationFit += boost
  }

  // Compliance emphasis: any compliance requirements increase weight significantly
  if (assessment.complianceRequirements && assessment.complianceRequirements.length > 0) {
    const boost = Math.min(0.12, assessment.complianceRequirements.length * 0.04)
    weights.complianceMatch += boost
  }

  // Budget emphasis: tighter budgets increase weight
  if (assessment.budgetRange) {
    const budgetBoosts: Record<string, number> = {
      'under-10k': 0.12,
      '10k-50k': 0.08,
      '50k-200k': 0.05,
      '200k-plus': 0.02,
      'unknown': 0,
    }
    weights.budgetFit += budgetBoosts[assessment.budgetRange] ?? 0.05
  }

  // Use case emphasis: more use cases = higher feature match importance
  const useCases = assessment.primaryUseCases ?? assessment.useCases
  if (useCases && useCases.length > 0) {
    const boost = Math.min(0.10, useCases.length * 0.025)
    weights.featureMatch += boost
  }

  // Tech stack emphasis: specified stack = compatibility matters more
  const techStack = assessment.currentStack ?? assessment.techStack
  if (techStack && techStack.length > 0) {
    const boost = Math.min(0.10, techStack.length * 0.02)
    weights.stackCompatibility += boost
  }

  // Team level emphasis: non-technical teams need more stack compatibility weight
  if (assessment.teamTechnicalLevel === 'non-technical' || assessment.teamTechnicalLevel === 'some-technical') {
    weights.stackCompatibility += 0.05
  }

  // Organization size: larger orgs weight compliance and budget higher
  if (assessment.organizationSize === '1000+' || assessment.organizationSize === '201-1000') {
    weights.complianceMatch += 0.03
    weights.budgetFit += 0.03
  }

  // Apply MAX_WEIGHT cap
  const cappedWeights = {
    integrationFit: Math.min(weights.integrationFit, MAX_WEIGHT),
    complianceMatch: Math.min(weights.complianceMatch, MAX_WEIGHT),
    budgetFit: Math.min(weights.budgetFit, MAX_WEIGHT),
    featureMatch: Math.min(weights.featureMatch, MAX_WEIGHT),
    stackCompatibility: Math.min(weights.stackCompatibility, MAX_WEIGHT),
  }

  // Normalize to sum to 1.0
  return normalizeWeights(cappedWeights)
}

/**
 * Normalizes weights to sum to exactly 1.0.
 *
 * @param weights - Raw weights (may not sum to 1.0)
 * @returns Normalized weights summing to 1.0
 */
function normalizeWeights(weights: WeightConfig): WeightConfig {
  const sum =
    weights.integrationFit +
    weights.complianceMatch +
    weights.budgetFit +
    weights.featureMatch +
    weights.stackCompatibility

  if (sum === 0) {
    return DEFAULT_WEIGHTS
  }

  return {
    integrationFit: weights.integrationFit / sum,
    complianceMatch: weights.complianceMatch / sum,
    budgetFit: weights.budgetFit / sum,
    featureMatch: weights.featureMatch / sum,
    stackCompatibility: weights.stackCompatibility / sum,
  }
}
