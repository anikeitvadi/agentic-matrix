/**
 * SAW (Simple Additive Weighting) Scoring Engine
 *
 * Implements the core scoring algorithm for platform recommendations.
 * SAW formula: Score = sum(weight_i * normalized_value_i) * 100
 *
 * Each platform is scored across 5 criteria using structuredCapabilities
 * (deterministic flags, no keyword matching), then combined with dynamic
 * weights to produce a final 0-100 score.
 *
 * Budget disqualification: platforms exceeding 2x the user's budget ceiling
 * receive a hard penalty to prevent over-budget recommendations.
 */

import type { Platform } from '.velite'
import type { Criterion, PlatformScore, AuditEntry, ScoringContext } from './types'
import { normalizeMinMax, CRITERION_DIRECTIONS } from './normalize'
import { calculatePlatformCost } from '@/lib/cost/tco-calculator'
import { evaluateGates } from './gates'
import { calculateImplementationRisk } from './implementation-risk'
import { calculateConfidence } from './confidence'
import { buildEvidence } from './evidence'
import {
  getAssessmentArray,
  getAssessmentString,
  getTeamTierFitScore,
  getTimelineTierFitScore,
  deriveUsageParameters,
  derivePlatformComplexity,
} from '@/lib/assessment/recommendation-context'

/**
 * Calculates the SAW (Simple Additive Weighting) score.
 */
interface SAWInput {
  weight: number
  normalizedValue: number
}

export function calculateSAW(criteria: SAWInput[]): number {
  if (criteria.length === 0) return 0
  const weightedSum = criteria.reduce(
    (sum, c) => sum + c.weight * c.normalizedValue,
    0,
  )
  return Math.round(weightedSum * 100)
}

/**
 * Scores a single platform against user requirements.
 */
export function scorePlatform(
  platform: Platform,
  context: ScoringContext,
): PlatformScore {
  const { allPlatforms, userAssessment, weightConfig } = context

  // Calculate raw values for each criterion
  const integrationFitRaw = calculateIntegrationFit(platform, userAssessment)
  const complianceMatchRaw = calculateComplianceMatch(platform, userAssessment)
  const budgetFitRaw = calculateBudgetFit(platform, userAssessment, allPlatforms)
  const featureMatchRaw = calculateFeatureMatch(platform, userAssessment)
  const stackCompatibilityRaw = calculateStackCompatibility(platform, userAssessment)

  // Get min/max for normalization across all platforms
  const allRaw = allPlatforms.map((p) => ({
    integration: calculateIntegrationFit(p, userAssessment),
    compliance: calculateComplianceMatch(p, userAssessment),
    budget: calculateBudgetFit(p, userAssessment, allPlatforms),
    feature: calculateFeatureMatch(p, userAssessment),
    stack: calculateStackCompatibility(p, userAssessment),
  }))

  const norm = (raw: number, allVals: number[], direction: boolean) =>
    normalizeMinMax(raw, Math.min(...allVals), Math.max(...allVals), direction)

  const integrationFitNorm = norm(integrationFitRaw, allRaw.map((r) => r.integration), CRITERION_DIRECTIONS.integrationFit)
  const complianceMatchNorm = norm(complianceMatchRaw, allRaw.map((r) => r.compliance), CRITERION_DIRECTIONS.complianceMatch)
  const budgetFitNorm = norm(budgetFitRaw, allRaw.map((r) => r.budget), CRITERION_DIRECTIONS.budgetFit)
  const featureMatchNorm = norm(featureMatchRaw, allRaw.map((r) => r.feature), CRITERION_DIRECTIONS.featureMatch)
  const stackCompatibilityNorm = norm(stackCompatibilityRaw, allRaw.map((r) => r.stack), CRITERION_DIRECTIONS.stackCompatibility)

  // Build criteria array
  const criteriaScores: Criterion[] = [
    { name: 'integrationFit', weight: weightConfig.integrationFit, value: integrationFitRaw, normalizedValue: integrationFitNorm, higherIsBetter: CRITERION_DIRECTIONS.integrationFit },
    { name: 'complianceMatch', weight: weightConfig.complianceMatch, value: complianceMatchRaw, normalizedValue: complianceMatchNorm, higherIsBetter: CRITERION_DIRECTIONS.complianceMatch },
    { name: 'budgetFit', weight: weightConfig.budgetFit, value: budgetFitRaw, normalizedValue: budgetFitNorm, higherIsBetter: CRITERION_DIRECTIONS.budgetFit },
    { name: 'featureMatch', weight: weightConfig.featureMatch, value: featureMatchRaw, normalizedValue: featureMatchNorm, higherIsBetter: CRITERION_DIRECTIONS.featureMatch },
    { name: 'stackCompatibility', weight: weightConfig.stackCompatibility, value: stackCompatibilityRaw, normalizedValue: stackCompatibilityNorm, higherIsBetter: CRITERION_DIRECTIONS.stackCompatibility },
  ]

  // Calculate total score
  let totalScore = calculateSAW(
    criteriaScores.map((c) => ({ weight: c.weight, normalizedValue: c.normalizedValue })),
  )

  // ── Layered analysis ────────────────────────────────────────────────

  // Hard gates (pass/fail requirements)
  const gateFailures = evaluateGates(platform, userAssessment, budgetFitRaw)
  const passedAllGates = gateFailures.filter(g => g.severity === 'hard').length === 0

  // Apply score penalty for hard gate failures (replaces old inline budget penalty)
  if (!passedAllGates) {
    const hardFailCount = gateFailures.filter(g => g.severity === 'hard').length
    const penalty = Math.min(40, hardFailCount * 15)
    totalScore = Math.max(0, totalScore - penalty)
  }

  // Implementation risk (uses evaluationContext)
  const implementationRisk = calculateImplementationRisk(platform, userAssessment)

  // Confidence (how much is evidence vs assumptions)
  const confidence = calculateConfidence(platform, userAssessment)

  // Evidence (structured facts for comparison matrix)
  const evidence = buildEvidence(platform, userAssessment, gateFailures, budgetFitRaw)

  // Audit trail
  const auditTrail = generateAuditTrail(criteriaScores, platform)

  // Recommendation summary
  const summary = buildRecommendationSummary(platform, userAssessment, criteriaScores, totalScore, budgetFitRaw)

  return {
    platformId: platform.slug,
    platformName: platform.title,
    totalScore,
    criteriaScores,
    auditTrail,
    recommendationSummary: summary,
    gateFailures,
    passedAllGates,
    implementationRisk,
    confidence,
    evidence,
  }
}

/**
 * Scores all platforms and returns sorted by score descending.
 */
export function scoreAllPlatforms(
  platforms: Platform[],
  context: ScoringContext,
): PlatformScore[] {
  if (platforms.length === 0) return []
  const scores = platforms.map((p) => scorePlatform(p, context))

  // Sort: platforms passing all hard gates rank above those that don't,
  // then by totalScore descending within each group
  return scores.sort((a, b) => {
    if (a.passedAllGates !== b.passedAllGates) {
      return a.passedAllGates ? -1 : 1
    }
    return b.totalScore - a.totalScore
  })
}

// ── Criterion calculations ──────────────────────────────────────────────

/**
 * Integration fit: direct match of user's needed integrations against
 * platform's structuredCapabilities.supportedIntegrations.
 */
function calculateIntegrationFit(
  platform: Platform,
  assessment: Record<string, unknown>,
): number {
  const needed = getAssessmentArray(assessment, 'integrationNeeds')
  const supported = platform.structuredCapabilities?.supportedIntegrations ?? []

  if (needed.length === 0) {
    return supported.length // Reward breadth when no specific needs
  }

  const supportedLower = supported.map((s) => s.toLowerCase())
  return needed.filter((n) =>
    supportedLower.some((s) => s.includes(n.toLowerCase()) || n.toLowerCase().includes(s)),
  ).length
}

/**
 * Compliance match: direct match of user's compliance requirements against
 * platform's structuredCapabilities.complianceCerts + breadth bonus.
 */
function calculateComplianceMatch(
  platform: Platform,
  assessment: Record<string, unknown>,
): number {
  const required = getAssessmentArray(assessment, 'complianceRequirements').filter(
    (v) => v !== 'none',
  )
  const certs = platform.structuredCapabilities?.complianceCerts ?? []

  // Base score from cert count (breadth)
  let score = certs.length

  if (required.length === 0) {
    return score
  }

  // Direct match: each matched cert = 3 points
  const certsLower = certs.map((c) => c.toLowerCase())
  const matchCount = required.filter((r) => certsLower.includes(r.toLowerCase())).length
  score += matchCount * 3

  // Penalty for missing required certs
  const missingCount = required.length - matchCount
  score -= missingCount * 2

  // Enterprise security bonuses when user has compliance requirements
  if (platform.structuredCapabilities?.zeroDataRetention) score += 2
  if (platform.structuredCapabilities?.bringYourOwnKey) score += 2

  return Math.max(0, score)
}

/**
 * Budget fit: real estimated annual cost from the TCO calculator.
 * Lower is better (handled by inverted normalization in CRITERION_DIRECTIONS).
 */
function calculateBudgetFit(
  platform: Platform,
  assessment: Record<string, unknown>,
  _allPlatforms: Platform[],
): number {
  const usage = deriveUsageParameters(assessment)

  try {
    const complexity = derivePlatformComplexity(platform, assessment)
    const costEstimate = calculatePlatformCost(platform, {
      monthlyConversations: usage.monthlyConversations,
      monthlyInputTokens: usage.monthlyInputTokens,
      monthlyOutputTokens: usage.monthlyOutputTokens,
      complexity,
    })
    return costEstimate.yearlyTotal ?? 0
  } catch {
    // Fallback: rough tier estimate if calculator fails
    const tierCosts: Record<string, number> = {
      'enterprise-os': 50_000,
      'ipaas-agent': 5_000,
      'developer-first': 1_000,
      vertical: 15_000,
    }
    return tierCosts[platform.tier] ?? 10_000
  }
}

/**
 * Feature match: direct match of user's use cases against
 * platform's structuredCapabilities.useCaseStrengths + RAG/multimodal bonus.
 */
function calculateFeatureMatch(
  platform: Platform,
  assessment: Record<string, unknown>,
): number {
  const useCases = getAssessmentArray(assessment, 'primaryUseCases', 'useCases')
  const strengths = platform.structuredCapabilities?.useCaseStrengths ?? []
  const caps = platform.structuredCapabilities

  let score = 0

  if (useCases.length === 0) {
    score = strengths.length
  } else {
    // Direct match: each matched use case = 3 points
    const strengthsLower = strengths.map((s) => s.toLowerCase())
    score = useCases.filter((uc) => strengthsLower.includes(uc.toLowerCase())).length * 3
  }

  // Bonus for RAG capability
  if (caps?.hasRAG) score += 2
  // Bonus for multi-modal capability
  if (caps?.hasMultiModal) score += 1

  // Multi-agent bonus for complex use cases
  if (caps?.hasMultiAgent) {
    const complexUseCases = ['workflow-automation', 'data-extraction']
    if (useCases.some(uc => complexUseCases.includes(uc))) {
      score += 2
    }
  }

  return score
}

/**
 * Stack compatibility: cloud match + TEAM_TIER_FIT + TIMELINE_TIER_FIT + low-code bonus.
 */
function calculateStackCompatibility(
  platform: Platform,
  assessment: Record<string, unknown>,
): number {
  const currentStack = getAssessmentArray(assessment, 'currentStack', 'techStack')
  const teamLevel = getAssessmentString(assessment, 'teamTechnicalLevel')
  const timeline = getAssessmentString(assessment, 'timeline')
  const caps = platform.structuredCapabilities

  let score = 0

  // Cloud native match: does the platform's cloud align with user's stack?
  const cloudNative = caps?.cloudNative ?? []
  if (currentStack.length > 0 && cloudNative.length > 0) {
    const stackLower = currentStack.map((s) => s.toLowerCase())
    if (cloudNative.some((cloud) => stackLower.includes(cloud.toLowerCase()))) {
      score += 5 // Strong cloud alignment
    }
  }

  // Team tier fit from lookup table
  score += getTeamTierFitScore(teamLevel, platform.tier)

  // Timeline tier fit from lookup table
  score += getTimelineTierFitScore(timeline, platform.tier)

  // Low-code bonus for non-technical teams
  if (caps?.hasLowCode) {
    score += 2
    if (teamLevel === 'non-technical' || teamLevel === 'some-technical') {
      score += 3 // Extra bonus for low-code when team isn't technical
    }
  }

  // Deployment flexibility bonus: more options = more flexibility
  const deployOpts = caps?.deploymentOptions ?? ['saas']
  if (deployOpts.length > 1) {
    score += deployOpts.length - 1 // +1 per option beyond SaaS
  }

  return score
}

// ── Audit trail ─────────────────────────────────────────────────────────

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

function generateReasoning(criterion: Criterion, platform: Platform): string {
  const normalized = (criterion.normalizedValue * 100).toFixed(0)
  const weighted = (criterion.weight * criterion.normalizedValue * 100).toFixed(1)

  switch (criterion.name) {
    case 'integrationFit':
      return `${platform.title} matches ${criterion.value} of your needed integrations (${normalized}% normalized, contributes ${weighted} points)`
    case 'complianceMatch':
      return `${platform.title} compliance score ${criterion.value} based on cert matching (${normalized}% normalized, contributes ${weighted} points)`
    case 'budgetFit':
      return `${platform.title} estimated at $${Math.round(criterion.value).toLocaleString()}/year (${normalized}% normalized for budget fit, contributes ${weighted} points)`
    case 'featureMatch':
      return `${platform.title} matches ${criterion.value} feature points from use case strengths (${normalized}% normalized, contributes ${weighted} points)`
    case 'stackCompatibility':
      return `${platform.title} scores ${criterion.value} for stack compatibility including cloud, team, and timeline fit (${normalized}% normalized, contributes ${weighted} points)`
    default:
      return `${criterion.name}: raw=${criterion.value}, normalized=${normalized}%, weighted=${weighted} points`
  }
}

// ── Recommendation summary ──────────────────────────────────────────────

function buildRecommendationSummary(
  platform: Platform,
  assessment: Record<string, unknown>,
  criteria: Criterion[],
  totalScore: number,
  estimatedAnnualCost: number,
) {
  const caps = platform.structuredCapabilities
  const required = getAssessmentArray(assessment, 'complianceRequirements').filter((v) => v !== 'none')
  const certs = caps?.complianceCerts ?? []
  const certsLower = certs.map((c) => c.toLowerCase())
  const neededIntegrations = getAssessmentArray(assessment, 'integrationNeeds')
  const supported = caps?.supportedIntegrations ?? []
  const supportedLower = supported.map((s) => s.toLowerCase())

  // Count matched signals
  const signals: string[] = []
  const caveats: string[] = []

  // Compliance signals
  const complianceMatches = required.filter((r) => certsLower.includes(r.toLowerCase()))
  complianceMatches.forEach((c) => signals.push(`${c.toUpperCase()}`))
  const complianceMisses = required.filter((r) => !certsLower.includes(r.toLowerCase()))
  complianceMisses.forEach((c) => caveats.push(`Missing ${c.toUpperCase()}`))

  // Integration signals
  const integrationMatches = neededIntegrations.filter((n) =>
    supportedLower.some((s) => s.includes(n.toLowerCase())),
  )
  if (integrationMatches.length > 0) signals.push('Integration aligned')
  if (neededIntegrations.length > 0 && integrationMatches.length < neededIntegrations.length) {
    caveats.push(`${neededIntegrations.length - integrationMatches.length} integrations not native`)
  }

  // Budget signal
  const budgetCriterion = criteria.find((c) => c.name === 'budgetFit')
  if (budgetCriterion && budgetCriterion.normalizedValue > 0.6) {
    signals.push('Within budget')
  } else if (budgetCriterion && budgetCriterion.normalizedValue < 0.3) {
    caveats.push('Budget pressure')
  }

  // Stack signal
  const stackCriterion = criteria.find((c) => c.name === 'stackCompatibility')
  if (stackCriterion && stackCriterion.normalizedValue > 0.6) {
    signals.push('Stack aligned')
  }

  // Team capability caveat
  const teamLevel = getAssessmentString(assessment, 'teamTechnicalLevel')
  if (teamLevel === 'non-technical' && platform.tier === 'developer-first') {
    caveats.push('Engineering team needed')
  }

  const totalSignals = required.length + (neededIntegrations.length > 0 ? 1 : 0) + 2 // +2 for budget and stack

  return {
    headline: `${totalScore >= 70 ? 'Strong' : totalScore >= 50 ? 'Moderate' : 'Weak'} fit for your requirements`,
    rationale: generateRationale(platform, totalScore, signals, caveats),
    strengths: signals,
    caveats,
    matchCount: signals.length,
    totalSignals,
    estimatedAnnualCost: estimatedAnnualCost > 0 ? estimatedAnnualCost : null,
  }
}

function generateRationale(
  platform: Platform,
  totalScore: number,
  strengths: string[],
  caveats: string[],
): string {
  if (totalScore >= 80) {
    return `${platform.title} aligns well across compliance, cost, and technical requirements.${strengths.length > 0 ? ` Key strengths: ${strengths.join(', ')}.` : ''}`
  }
  if (totalScore >= 60) {
    return `${platform.title} is a reasonable fit with some tradeoffs.${caveats.length > 0 ? ` Watch: ${caveats.join(', ')}.` : ''}`
  }
  return `${platform.title} has significant gaps relative to your stated requirements.${caveats.length > 0 ? ` Issues: ${caveats.join(', ')}.` : ''}`
}
