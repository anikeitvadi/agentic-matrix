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
import { calculateDecisionScore } from './decision-score'
import { classifyRecommendation } from './summary-classifier'
import { buildEvidence } from './evidence'
import {
  getAssessmentArray,
  getAssessmentString,
  getTeamTierFitScore,
  getTimelineTierFitScore,
  deriveUsageParameters,
  derivePlatformComplexityWithFlags,
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

  // ── Layer 1: SAW fit scoring ─────────────────────────────────────────

  const integrationFitRaw = calculateIntegrationFit(platform, userAssessment)
  const complianceMatchRaw = calculateComplianceMatch(platform, userAssessment)
  const { annualCost: budgetFitRaw, heuristicFlags, usedPricingProxy } =
    calculateBudgetFitWithMetadata(platform, userAssessment)
  const featureMatchRaw = calculateFeatureMatch(platform, userAssessment)
  const stackCompatibilityRaw = calculateStackCompatibility(platform, userAssessment)

  // Normalization across all platforms
  const allRaw = allPlatforms.map((p) => ({
    integration: calculateIntegrationFit(p, userAssessment),
    compliance: calculateComplianceMatch(p, userAssessment),
    budget: calculateBudgetFitWithMetadata(p, userAssessment).annualCost,
    feature: calculateFeatureMatch(p, userAssessment),
    stack: calculateStackCompatibility(p, userAssessment),
  }))

  const norm = (raw: number, allVals: number[], direction: boolean) =>
    normalizeMinMax(raw, Math.min(...allVals), Math.max(...allVals), direction)

  const criteriaScores: Criterion[] = [
    { name: 'integrationFit', weight: weightConfig.integrationFit, value: integrationFitRaw, normalizedValue: norm(integrationFitRaw, allRaw.map(r => r.integration), CRITERION_DIRECTIONS.integrationFit), higherIsBetter: CRITERION_DIRECTIONS.integrationFit },
    { name: 'complianceMatch', weight: weightConfig.complianceMatch, value: complianceMatchRaw, normalizedValue: norm(complianceMatchRaw, allRaw.map(r => r.compliance), CRITERION_DIRECTIONS.complianceMatch), higherIsBetter: CRITERION_DIRECTIONS.complianceMatch },
    { name: 'budgetFit', weight: weightConfig.budgetFit, value: budgetFitRaw, normalizedValue: norm(budgetFitRaw, allRaw.map(r => r.budget), CRITERION_DIRECTIONS.budgetFit), higherIsBetter: CRITERION_DIRECTIONS.budgetFit },
    { name: 'featureMatch', weight: weightConfig.featureMatch, value: featureMatchRaw, normalizedValue: norm(featureMatchRaw, allRaw.map(r => r.feature), CRITERION_DIRECTIONS.featureMatch), higherIsBetter: CRITERION_DIRECTIONS.featureMatch },
    { name: 'stackCompatibility', weight: weightConfig.stackCompatibility, value: stackCompatibilityRaw, normalizedValue: norm(stackCompatibilityRaw, allRaw.map(r => r.stack), CRITERION_DIRECTIONS.stackCompatibility), higherIsBetter: CRITERION_DIRECTIONS.stackCompatibility },
  ]

  const fitScore = calculateSAW(
    criteriaScores.map((c) => ({ weight: c.weight, normalizedValue: c.normalizedValue })),
  )

  // ── Layer 2: Gates, risk, confidence, decision score ───────────────

  const gateFailures = evaluateGates(platform, userAssessment, budgetFitRaw)
  const passedAllGates = gateFailures.filter(g => g.severity === 'hard').length === 0

  // Penalize fitScore for hard gate failures
  let adjustedFitScore = fitScore
  if (!passedAllGates) {
    const hardFailCount = gateFailures.filter(g => g.severity === 'hard').length
    adjustedFitScore = Math.max(0, fitScore - Math.min(40, hardFailCount * 15))
  }

  const implementationRisk = calculateImplementationRisk(platform, userAssessment)
  const confidence = calculateConfidence(platform, userAssessment)

  // Decision score = fitScore - penalties for risk, confidence, soft gates, heuristics
  const { decisionScore, adjustments: decisionAdjustments } = calculateDecisionScore({
    fitScore: adjustedFitScore,
    implementationRisk,
    confidence,
    gateFailures,
    heuristicFlags,
  })

  // ── Evidence & summary ─────────────────────────────────────────────

  const evidence = buildEvidence(platform, userAssessment, gateFailures, budgetFitRaw, heuristicFlags, usedPricingProxy)
  const auditTrail = generateAuditTrail(criteriaScores, platform)

  // Classify recommendation into thesis
  const classification = classifyRecommendation({
    fitScore,
    decisionScore,
    passedAllGates,
    implementationRisk,
    confidence,
    criteriaScores,
  })

  // Build summary with thesis-based rationale
  const summary = buildRecommendationSummary(
    platform, userAssessment, criteriaScores, decisionScore, budgetFitRaw,
    classification, fitScore, decisionScore, evidence,
  )

  return {
    platformId: platform.slug,
    platformName: platform.title,
    totalScore: decisionScore, // backward compatible
    fitScore,
    decisionScore,
    decisionAdjustments,
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

  // Ranking: gates first, then decisionScore, then fitScore, then confidence
  return scores.sort((a, b) => {
    if (a.passedAllGates !== b.passedAllGates) return a.passedAllGates ? -1 : 1
    if (a.decisionScore !== b.decisionScore) return b.decisionScore - a.decisionScore
    if (a.fitScore !== b.fitScore) return b.fitScore - a.fitScore
    return b.confidence.score - a.confidence.score
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
    // No specific integrations needed — cap breadth bonus
    // Developer-first frameworks get a baseline since they connect via code
    if (supported.length === 0 && platform.tier === 'developer-first') {
      return 2 // Frameworks can integrate with anything via API/SDK
    }
    return Math.min(3, supported.length)
  }

  const supportedLower = supported.map((s) => s.toLowerCase())
  let matchCount = needed.filter((n) =>
    supportedLower.some((s) => s.includes(n.toLowerCase()) || n.toLowerCase().includes(s)),
  ).length

  // Developer-first frameworks with 0 listed integrations can connect to
  // most services via code — give partial credit instead of 0
  if (matchCount === 0 && supported.length === 0 && platform.tier === 'developer-first') {
    matchCount = Math.ceil(needed.length * 0.5) // 50% credit — can build but not native
  }

  return matchCount
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
  // Base score from cert count — cap breadth bonus when no requirements
  let score = required.length === 0 ? Math.min(3, certs.length) : certs.length

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
function calculateBudgetFitWithMetadata(
  platform: Platform,
  assessment: Record<string, unknown>,
): { annualCost: number; heuristicFlags: string[]; usedPricingProxy: boolean } {
  const usage = deriveUsageParameters(assessment)
  const { complexity, heuristicFlags } = derivePlatformComplexityWithFlags(platform, assessment)

  try {
    const costEstimate = calculatePlatformCost(platform, {
      monthlyConversations: usage.monthlyConversations,
      monthlyInputTokens: usage.monthlyInputTokens,
      monthlyOutputTokens: usage.monthlyOutputTokens,
      complexity,
    })
    return { annualCost: costEstimate.yearlyTotal ?? 0, heuristicFlags, usedPricingProxy: false }
  } catch {
    const tierCosts: Record<string, number> = {
      'enterprise-os': 50_000,
      'ipaas-agent': 5_000,
      'developer-first': 1_000,
      vertical: 15_000,
    }
    return {
      annualCost: tierCosts[platform.tier] ?? 10_000,
      heuristicFlags: [...heuristicFlags, 'Pricing proxy fallback used'],
      usedPricingProxy: true,
    }
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
    score = Math.min(3, strengths.length) // Cap breadth when no use cases specified
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
  _totalScore: number,
  estimatedAnnualCost: number,
  classification: { decisionThesis: import('./types').DecisionThesis; headline: string },
  fitScore: number,
  decisionScore: number,
  evidence: import('./types').Evidence,
) {
  const caps = platform.structuredCapabilities
  const required = getAssessmentArray(assessment, 'complianceRequirements').filter((v) => v !== 'none')
  const certs = caps?.complianceCerts ?? []
  const certsLower = certs.map((c) => c.toLowerCase())
  const neededIntegrations = getAssessmentArray(assessment, 'integrationNeeds')
  const supported = caps?.supportedIntegrations ?? []
  const supportedLower = supported.map((s) => s.toLowerCase())
  const teamLevel = getAssessmentString(assessment, 'teamTechnicalLevel')

  // Strengths
  const strengths: string[] = []
  const complianceMatches = required.filter((r) => certsLower.includes(r.toLowerCase()))
  complianceMatches.forEach((c) => strengths.push(c.toUpperCase()))
  const integrationMatches = neededIntegrations.filter((n) =>
    supportedLower.some((s) => s.includes(n.toLowerCase())),
  )
  if (integrationMatches.length > 0) strengths.push('Integration aligned')
  const budgetCriterion = criteria.find((c) => c.name === 'budgetFit')
  if (budgetCriterion && budgetCriterion.normalizedValue > 0.6) strengths.push('Within budget')
  const stackCriterion = criteria.find((c) => c.name === 'stackCompatibility')
  if (stackCriterion && stackCriterion.normalizedValue > 0.6) strengths.push('Stack aligned')

  // Caveats
  const caveats: string[] = []
  const complianceMisses = required.filter((r) => !certsLower.includes(r.toLowerCase()))
  complianceMisses.forEach((c) => caveats.push(`Missing ${c.toUpperCase()}`))
  if (neededIntegrations.length > 0 && integrationMatches.length < neededIntegrations.length) {
    caveats.push(`${neededIntegrations.length - integrationMatches.length} integrations not native`)
  }
  if (budgetCriterion && budgetCriterion.normalizedValue < 0.3) caveats.push('Budget pressure')
  if (teamLevel === 'non-technical' && platform.tier === 'developer-first') caveats.push('Engineering team needed')
  if (evidence.heuristicFlags.length > 0) caveats.push('Some estimates use assumptions')

  const totalSignals = required.length + (neededIntegrations.length > 0 ? 1 : 0) + 2

  // Thesis-based rationale: thesis sentence + top 2 reasons + main caveat
  const topReasons = strengths.slice(0, 2).join(' and ').toLowerCase()
  const mainCaveat = caveats[0] ? ` The main tradeoff is ${caveats[0].toLowerCase()}.` : ''
  const rationale = `${platform.title} is ${classification.headline.toLowerCase()}. ${
    topReasons ? `It stayed ahead on ${topReasons}.` : 'It offers a balanced profile across criteria.'
  }${mainCaveat}`

  return {
    matchCount: strengths.length,
    totalSignals,
    headline: classification.headline,
    rationale,
    strengths,
    caveats,
    estimatedAnnualCost: estimatedAnnualCost > 0 ? estimatedAnnualCost : null,
    fitScore,
    decisionScore,
    decisionThesis: classification.decisionThesis,
    costConfidence: evidence.costConfidence,
    assumptionLevel: evidence.assumptionLevel,
  }
}
