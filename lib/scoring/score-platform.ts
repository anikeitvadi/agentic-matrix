/**
 * SAW (Simple Additive Weighting) Scoring Engine
 *
 * Implements the core scoring algorithm for platform recommendations.
 * SAW formula: Score = sum(weight_i * normalized_value_i) * 100
 *
 * Each platform is scored across 5 criteria, normalized to 0-1 scale,
 * then combined with weights to produce a final 0-100 score.
 */

import type { Platform } from '.velite'
import type { Criterion, PlatformScore, AuditEntry, ScoringContext } from './types'
import { normalizeMinMax, CRITERION_DIRECTIONS } from './normalize'

/**
 * Input for SAW calculation - weight and normalized value pairs.
 */
interface SAWInput {
  weight: number
  normalizedValue: number
}

/**
 * Calculates the SAW (Simple Additive Weighting) score.
 *
 * Formula: Score = sum(weight_i * normalizedValue_i) * 100
 *
 * @param criteria - Array of weight and normalized value pairs
 * @returns Score between 0 and 100 (rounded to nearest integer)
 *
 * @example
 * calculateSAW([
 *   { weight: 0.3, normalizedValue: 0.8 },
 *   { weight: 0.7, normalizedValue: 0.5 }
 * ]) // => 59 (0.3*0.8 + 0.7*0.5 = 0.59 * 100)
 */
export function calculateSAW(criteria: SAWInput[]): number {
  if (criteria.length === 0) {
    return 0
  }

  const weightedSum = criteria.reduce((sum, criterion) => {
    return sum + criterion.weight * criterion.normalizedValue
  }, 0)

  return Math.round(weightedSum * 100)
}

/**
 * Scores a single platform against user requirements.
 *
 * @param platform - Platform to score (from velite content)
 * @param context - Scoring context with all platforms and user assessment
 * @returns Complete platform score with criteria breakdown and audit trail
 */
export function scorePlatform(platform: Platform, context: ScoringContext): PlatformScore {
  const { allPlatforms, userAssessment, weightConfig } = context

  // Calculate raw values for each criterion
  const integrationFitRaw = calculateIntegrationFit(platform, userAssessment)
  const complianceMatchRaw = calculateComplianceMatch(platform, userAssessment)
  const budgetFitRaw = calculateBudgetFit(platform, userAssessment)
  const featureMatchRaw = calculateFeatureMatch(platform, userAssessment)
  const stackCompatibilityRaw = calculateStackCompatibility(platform, userAssessment)

  // Get min/max for normalization across all platforms
  const allIntegrationFits = allPlatforms.map((p) => calculateIntegrationFit(p, userAssessment))
  const allComplianceMatches = allPlatforms.map((p) => calculateComplianceMatch(p, userAssessment))
  const allBudgetFits = allPlatforms.map((p) => calculateBudgetFit(p, userAssessment))
  const allFeatureMatches = allPlatforms.map((p) => calculateFeatureMatch(p, userAssessment))
  const allStackCompatibilities = allPlatforms.map((p) =>
    calculateStackCompatibility(p, userAssessment)
  )

  // Normalize each criterion
  const integrationFitNorm = normalizeMinMax(
    integrationFitRaw,
    Math.min(...allIntegrationFits),
    Math.max(...allIntegrationFits),
    CRITERION_DIRECTIONS.integrationFit
  )

  const complianceMatchNorm = normalizeMinMax(
    complianceMatchRaw,
    Math.min(...allComplianceMatches),
    Math.max(...allComplianceMatches),
    CRITERION_DIRECTIONS.complianceMatch
  )

  const budgetFitNorm = normalizeMinMax(
    budgetFitRaw,
    Math.min(...allBudgetFits),
    Math.max(...allBudgetFits),
    CRITERION_DIRECTIONS.budgetFit
  )

  const featureMatchNorm = normalizeMinMax(
    featureMatchRaw,
    Math.min(...allFeatureMatches),
    Math.max(...allFeatureMatches),
    CRITERION_DIRECTIONS.featureMatch
  )

  const stackCompatibilityNorm = normalizeMinMax(
    stackCompatibilityRaw,
    Math.min(...allStackCompatibilities),
    Math.max(...allStackCompatibilities),
    CRITERION_DIRECTIONS.stackCompatibility
  )

  // Build criteria array
  const criteriaScores: Criterion[] = [
    {
      name: 'integrationFit',
      weight: weightConfig.integrationFit,
      value: integrationFitRaw,
      normalizedValue: integrationFitNorm,
      higherIsBetter: CRITERION_DIRECTIONS.integrationFit,
    },
    {
      name: 'complianceMatch',
      weight: weightConfig.complianceMatch,
      value: complianceMatchRaw,
      normalizedValue: complianceMatchNorm,
      higherIsBetter: CRITERION_DIRECTIONS.complianceMatch,
    },
    {
      name: 'budgetFit',
      weight: weightConfig.budgetFit,
      value: budgetFitRaw,
      normalizedValue: budgetFitNorm,
      higherIsBetter: CRITERION_DIRECTIONS.budgetFit,
    },
    {
      name: 'featureMatch',
      weight: weightConfig.featureMatch,
      value: featureMatchRaw,
      normalizedValue: featureMatchNorm,
      higherIsBetter: CRITERION_DIRECTIONS.featureMatch,
    },
    {
      name: 'stackCompatibility',
      weight: weightConfig.stackCompatibility,
      value: stackCompatibilityRaw,
      normalizedValue: stackCompatibilityNorm,
      higherIsBetter: CRITERION_DIRECTIONS.stackCompatibility,
    },
  ]

  // Calculate total score using SAW
  const sawInput = criteriaScores.map((c) => ({
    weight: c.weight,
    normalizedValue: c.normalizedValue,
  }))
  const totalScore = calculateSAW(sawInput)

  // Generate audit trail
  const auditTrail = generateAuditTrail(criteriaScores, platform)

  return {
    platformId: platform.slug,
    platformName: platform.title,
    totalScore,
    criteriaScores,
    auditTrail,
  }
}

/**
 * Scores all platforms and returns sorted by score descending.
 *
 * @param platforms - All platforms to score
 * @param context - Scoring context with user assessment
 * @returns Array of PlatformScore sorted by totalScore (highest first)
 */
export function scoreAllPlatforms(platforms: Platform[], context: ScoringContext): PlatformScore[] {
  if (platforms.length === 0) {
    return []
  }

  const scores = platforms.map((platform) => scorePlatform(platform, context))

  // Sort by totalScore descending
  return scores.sort((a, b) => b.totalScore - a.totalScore)
}

/**
 * Calculates integration fit score.
 * How many of the user's needed integrations does this platform support?
 */
function calculateIntegrationFit(
  platform: Platform,
  assessment: Record<string, unknown>
): number {
  const neededIntegrations = (assessment.integrationNeeds as string[]) ?? []

  if (neededIntegrations.length === 0) {
    // If no specific integrations needed, score based on total capabilities
    return platform.capabilities.length
  }

  // Count how many needed integrations are in platform capabilities
  const platformCaps = platform.capabilities.map((c) => c.toLowerCase())
  const matchCount = neededIntegrations.filter((needed) =>
    platformCaps.some((cap) => cap.includes(needed.toLowerCase()))
  ).length

  return matchCount
}

/**
 * Calculates compliance match score.
 * Inferred from platform tier and capabilities.
 */
function calculateComplianceMatch(
  platform: Platform,
  assessment: Record<string, unknown>
): number {
  const requiredCompliance = (assessment.complianceRequirements as string[]) ?? []

  // Base compliance score from tier
  const tierScores: Record<string, number> = {
    'enterprise-os': 5, // Enterprise platforms typically have full compliance
    'ipaas-agent': 3, // iPaaS usually has good compliance
    'developer-first': 2, // Developer tools vary
    'vertical': 3, // Vertical solutions often have industry compliance
  }

  let score = tierScores[platform.tier] ?? 2

  // Check for compliance-related capabilities
  const complianceCaps = ['soc2', 'hipaa', 'gdpr', 'iso27001', 'enterprise-sso', 'audit-log']
  const platformCaps = platform.capabilities.map((c) => c.toLowerCase())

  for (const cap of complianceCaps) {
    if (platformCaps.includes(cap)) {
      score += 1
    }
  }

  // Bonus if platform matches required compliance
  if (requiredCompliance.length > 0) {
    const matchCount = requiredCompliance.filter((req) =>
      platformCaps.some((cap) => cap.includes(req.toLowerCase()))
    ).length
    score += matchCount * 2
  }

  return score
}

/**
 * Calculates budget fit score.
 * Lower is better - estimated annual cost based on tier.
 */
function calculateBudgetFit(
  platform: Platform,
  assessment: Record<string, unknown>
): number {
  // Estimate annual cost from tier and pricing model
  const tierCosts: Record<string, number> = {
    'enterprise-os': 50000, // Enterprise typically $50k+
    'ipaas-agent': 5000, // iPaaS mid-range
    'developer-first': 1000, // Developer tools often cheaper/free
    'vertical': 15000, // Vertical solutions mid-high
  }

  let estimatedCost = tierCosts[platform.tier] ?? 10000

  // Adjust based on pricing model hints
  const pricingModel = platform.pricing.model.toLowerCase()
  if (pricingModel.includes('free') || pricingModel.includes('open-source')) {
    estimatedCost = 0
  } else if (pricingModel.includes('per-task') || pricingModel.includes('usage')) {
    estimatedCost *= 0.5 // Usage-based often cheaper for small scale
  } else if (pricingModel.includes('enterprise')) {
    estimatedCost *= 1.5 // Enterprise often more expensive
  }

  // Return cost (lower is better, handled by normalization inversion)
  return estimatedCost
}

/**
 * Calculates feature match score.
 * How well do platform capabilities match user use cases?
 */
function calculateFeatureMatch(
  platform: Platform,
  assessment: Record<string, unknown>
): number {
  const useCases = (assessment.useCases as string[]) ?? []

  // Base score from capability count
  let score = Math.min(10, platform.capabilities.length)

  // Bonus for matching use cases
  if (useCases.length > 0) {
    const platformCaps = platform.capabilities.map((c) => c.toLowerCase())

    for (const useCase of useCases) {
      const ucLower = useCase.toLowerCase()
      if (platformCaps.some((cap) => cap.includes(ucLower) || ucLower.includes(cap))) {
        score += 2
      }
    }
  }

  return score
}

/**
 * Calculates tech stack compatibility score.
 * Based on tier and SDK/API support indicators.
 */
function calculateStackCompatibility(
  platform: Platform,
  assessment: Record<string, unknown>
): number {
  const techStack = (assessment.techStack as string[]) ?? []

  // Base score from tier (developer-first has best SDK support)
  const tierScores: Record<string, number> = {
    'developer-first': 5,
    'enterprise-os': 4,
    'ipaas-agent': 3,
    'vertical': 2,
  }

  let score = tierScores[platform.tier] ?? 3

  // Check for SDK/API related capabilities
  const devCaps = ['api', 'sdk', 'webhook', 'custom-nodes', 'self-hosted', 'cli']
  const platformCaps = platform.capabilities.map((c) => c.toLowerCase())

  for (const cap of devCaps) {
    if (platformCaps.some((c) => c.includes(cap))) {
      score += 1
    }
  }

  // Bonus for matching tech stack
  if (techStack.length > 0) {
    for (const tech of techStack) {
      if (platformCaps.some((cap) => cap.includes(tech.toLowerCase()))) {
        score += 2
      }
    }
  }

  return score
}

/**
 * Generates human-readable audit trail for scoring transparency.
 */
function generateAuditTrail(criteria: Criterion[], platform: Platform): AuditEntry[] {
  return criteria.map((criterion) => ({
    criterionName: criterion.name,
    rawValue: criterion.value,
    normalizedValue: criterion.normalizedValue,
    weight: criterion.weight,
    weightedScore: criterion.weight * criterion.normalizedValue,
    reasoning: generateReasoning(criterion, platform),
  }))
}

/**
 * Generates human-readable reasoning for a criterion score.
 */
function generateReasoning(criterion: Criterion, platform: Platform): string {
  const normalized = (criterion.normalizedValue * 100).toFixed(0)
  const weighted = ((criterion.weight * criterion.normalizedValue) * 100).toFixed(1)

  switch (criterion.name) {
    case 'integrationFit':
      return `${platform.title} supports ${criterion.value} of your needed integrations (${normalized}% normalized, contributes ${weighted} points)`

    case 'complianceMatch':
      return `${platform.title} has a compliance score of ${criterion.value} based on tier and certifications (${normalized}% normalized, contributes ${weighted} points)`

    case 'budgetFit':
      return `${platform.title} estimated at $${criterion.value}/year (${normalized}% normalized for budget fit, contributes ${weighted} points)`

    case 'featureMatch':
      return `${platform.title} matches ${criterion.value} feature points based on capabilities (${normalized}% normalized, contributes ${weighted} points)`

    case 'stackCompatibility':
      return `${platform.title} scores ${criterion.value} for tech stack compatibility (${normalized}% normalized, contributes ${weighted} points)`

    default:
      return `${criterion.name}: raw=${criterion.value}, normalized=${normalized}%, weighted=${weighted} points`
  }
}
