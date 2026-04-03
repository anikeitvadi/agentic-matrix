/**
 * Summary Classifier
 *
 * Classifies each platform recommendation into a buyer-oriented decision thesis.
 * Replaces generic "Strong/Moderate/Weak fit" with actionable categories.
 */

import type {
  DecisionThesis,
  Criterion,
  ImplementationRisk,
  Confidence,
} from './types'

interface ClassifyInput {
  fitScore: number
  decisionScore: number
  passedAllGates: boolean
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
  const { fitScore, decisionScore, passedAllGates, implementationRisk, confidence, criteriaScores } = input
  const budgetFit = getBudgetFitNormalized(criteriaScores)

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

  // 4. Pragmatic low-friction option
  if (budgetFit >= 0.75 && implementationRisk.score >= 70) {
    return {
      decisionThesis: 'pragmatic-low-friction-option',
      headline: 'Pragmatic low-friction option',
    }
  }

  // 5. Cost-efficient tradeoff
  if (budgetFit >= 0.75 && fitScore >= 60) {
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
