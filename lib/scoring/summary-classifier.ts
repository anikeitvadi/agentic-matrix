/**
 * Summary Classifier
 *
 * Classifies each platform recommendation into a buyer-oriented decision thesis.
 * Replaces generic "Strong/Moderate/Weak fit" with actionable categories.
 */

import type {
  DecisionThesis,
  Criterion,
  GateFailure,
  ImplementationRisk,
  Confidence,
} from './types'

interface ClassifyInput {
  fitScore: number
  decisionScore: number
  passedAllGates: boolean
  gateFailures: GateFailure[]
  implementationRisk: ImplementationRisk
  confidence: Confidence
  criteriaScores: Criterion[]
}

interface ClassifyResult {
  decisionThesis: DecisionThesis
  headline: string
}

function getBudgetFitNormalized(criteria: Criterion[]): number {
  return criteria.find(c => c.name === 'budgetFit')?.normalizedValue ?? 0.5
}

/**
 * Classify a platform's recommendation into a decision thesis.
 * Applied in priority order — first match wins.
 */
export function classifyRecommendation(input: ClassifyInput): ClassifyResult {
  const { fitScore, decisionScore, passedAllGates, gateFailures, implementationRisk, confidence, criteriaScores } = input
  const budgetFit = getBudgetFitNormalized(criteriaScores)
  const hasBudgetWarning = gateFailures.some(g => g.gate === 'budget-ceiling')

  // 1. Hard gate failure
  if (!passedAllGates) {
    return {
      decisionThesis: 'disqualified-by-hard-requirements',
      headline: 'Strong technical fit, disqualified by hard requirements',
    }
  }

  // 2. High capability but high implementation lift
  if (fitScore >= 75 && implementationRisk.score < 45) {
    return {
      decisionThesis: 'high-capability-high-lift',
      headline: 'High-capability option requiring significant engineering investment',
    }
  }

  // 3. Best balanced choice — strong across the board
  if (decisionScore >= 75 && implementationRisk.score >= 70 && confidence.score >= 70) {
    return {
      decisionThesis: 'best-balanced-choice',
      headline: 'Best balanced choice for production rollout',
    }
  }

  // 4. Pragmatic low-friction option — must actually be affordable
  if (budgetFit >= 0.75 && implementationRisk.score >= 70 && !hasBudgetWarning) {
    return {
      decisionThesis: 'pragmatic-low-friction-option',
      headline: 'Pragmatic low-friction option',
    }
  }

  // 5. Cost-efficient tradeoff — must actually be affordable
  if (budgetFit >= 0.75 && fitScore >= 60 && !hasBudgetWarning) {
    return {
      decisionThesis: 'cost-efficient-tradeoff',
      headline: 'Cost-efficient option with targeted tradeoffs',
    }
  }

  // 6. Default
  return {
    decisionThesis: 'viable-with-tradeoffs',
    headline: 'Viable option with meaningful tradeoffs',
  }
}
