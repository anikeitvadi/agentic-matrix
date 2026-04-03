/**
 * Scoring Engine Types
 *
 * Two-layer decision model:
 * - fitScore: SAW-based theoretical match quality
 * - decisionScore: fitScore adjusted for execution risk, evidence quality, and business friction
 *
 * Hard gates remain outside the score — gate-passing platforms always rank above gate-failing ones.
 */

import type { Platform } from '.velite'

// ── Criterion & Audit ────────────────────────────────────────────────

export interface Criterion {
  name: string
  weight: number
  value: number
  normalizedValue: number
  higherIsBetter: boolean
}

export interface AuditEntry {
  criterionName: string
  rawValue: number | string
  normalizedValue: number
  weight: number
  weightedScore: number
  reasoning: string
}

// ── Decision Adjustment ──────────────────────────────────────────────

/** Explains one penalty applied between fitScore and decisionScore */
export interface DecisionAdjustment {
  factor: string
  penalty: number
  reasoning: string
}

// ── Gates ────────────────────────────────────────────────────────────

export interface GateFailure {
  gate: 'compliance' | 'budget-ceiling' | 'deployment' | 'self-hosting'
  requirement: string
  actual: string
  severity: 'hard' | 'soft'
}

// ── Implementation Risk ──────────────────────────────────────────────

export interface RiskFactor {
  name: string
  value: string
  impact: 'positive' | 'neutral' | 'negative'
  explanation: string
}

export interface ImplementationRisk {
  score: number        // 0-100 (higher = lower risk = better)
  label: 'Low' | 'Medium' | 'High'
  factors: RiskFactor[]
}

// ── Confidence ───────────────────────────────────────────────────────

export interface Confidence {
  score: number        // 0-100
  label: 'High' | 'Medium' | 'Low'
  evidenceBasis: string[]
  assumptions: string[]
}

// ── Evidence ─────────────────────────────────────────────────────────

export interface Evidence {
  annualCostEstimate: number | null
  hardRequirementsMet: number
  hardRequirementsTotal: number
  certsMissing: string[]
  integrationsMet: string[]
  integrationsMissing: string[]
  deploymentOptions: string[]
  modelFlexibility: string
  observability: string
  vendorViability: string
  ecosystemMaturity: string
  heuristicFlags: string[]
  costConfidence: 'High' | 'Medium' | 'Low'
  assumptionLevel: 'Low' | 'Medium' | 'High'
}

// ── Decision Thesis ──────────────────────────────────────────────────

export type DecisionThesis =
  | 'best-balanced-choice'
  | 'pragmatic-low-friction-option'
  | 'high-capability-high-lift'
  | 'cost-efficient-tradeoff'
  | 'disqualified-by-hard-requirements'
  | 'viable-with-tradeoffs'

// ── Recommendation Summary ───────────────────────────────────────────

export interface RecommendationSummary {
  matchCount: number
  totalSignals: number
  headline: string
  rationale: string
  strengths: string[]
  caveats: string[]
  estimatedAnnualCost: number | null
  fitScore: number
  decisionScore: number
  decisionThesis: DecisionThesis
  costConfidence: 'High' | 'Medium' | 'Low'
  assumptionLevel: 'Low' | 'Medium' | 'High'
}

// ── Annual Cost Estimate ─────────────────────────────────────────────

export interface AnnualCostEstimate {
  annualCost: number
  heuristicFlags: string[]
  usedPricingProxy: boolean
}

// ── Derived Complexity ───────────────────────────────────────────────

export interface DerivedComplexityResult {
  complexity: {
    hasNativeIntegration: boolean
    requiresCustomCode: boolean
    complianceRequirements: string[]
  }
  heuristicFlags: string[]
}

// ── Platform Score ───────────────────────────────────────────────────

export interface PlatformScore {
  platformId: string
  platformName: string
  totalScore: number          // = decisionScore (backward compatible)
  fitScore: number            // SAW score: theoretical match quality
  decisionScore: number       // fitScore - penalties: production readiness
  decisionAdjustments: DecisionAdjustment[]
  criteriaScores: Criterion[]
  auditTrail: AuditEntry[]
  recommendationSummary: RecommendationSummary
  gateFailures: GateFailure[]
  passedAllGates: boolean
  implementationRisk: ImplementationRisk
  confidence: Confidence
  evidence: Evidence
}

// ── Weight Config ────────────────────────────────────────────────────

export interface WeightConfig {
  integrationFit: number
  complianceMatch: number
  budgetFit: number
  featureMatch: number
  stackCompatibility: number
}

// ── Scoring Context ──────────────────────────────────────────────────

export interface ScoringContext {
  allPlatforms: Platform[]
  userAssessment: Record<string, unknown>
  weightConfig: WeightConfig
}
