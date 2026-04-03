/**
 * Decision Score Calculator
 *
 * Bridges fitScore (theoretical SAW match) to decisionScore (production readiness).
 *
 * decisionScore = clamp(0, 100, fitScore - riskPenalty - confidencePenalty - softGatePenalty - heuristicPenalty)
 *
 * Each penalty is small, named, and logged in decisionAdjustments for full transparency.
 */

import type { DecisionAdjustment, GateFailure, ImplementationRisk, Confidence } from './types'

interface DecisionScoreInput {
  fitScore: number
  passedAllGates: boolean
  hardGateCount: number
  implementationRisk: ImplementationRisk
  confidence: Confidence
  gateFailures: GateFailure[]
  heuristicFlags: string[]
}

interface DecisionScoreResult {
  decisionScore: number
  adjustments: DecisionAdjustment[]
}

/** Risk penalty: high-risk platforms are penalized even if they match well */
function getRiskPenalty(risk: ImplementationRisk): number {
  if (risk.score >= 75) return 0
  if (risk.score >= 60) return 8
  if (risk.score >= 40) return 18
  return 30
}

/** Confidence penalty: low-evidence recommendations are penalized */
function getConfidencePenalty(confidence: Confidence): number {
  if (confidence.score >= 80) return 0
  if (confidence.score >= 60) return 4
  if (confidence.score >= 45) return 10
  return 16
}

/** Soft gate penalty: each soft warning costs 6 points, capped at 12 */
function getSoftGatePenalty(gateFailures: GateFailure[]): number {
  const softCount = gateFailures.filter(g => g.severity === 'soft').length
  return Math.min(12, softCount * 6)
}

/** Heuristic penalty: each assumption costs 4 points, capped at 8 */
function getHeuristicPenalty(heuristicFlags: string[]): number {
  return Math.min(8, heuristicFlags.length * 4)
}

export function calculateDecisionScore(input: DecisionScoreInput): DecisionScoreResult {
  const adjustments: DecisionAdjustment[] = []

  // Hard gate penalty (logged so the full fitScore→decisionScore gap is explainable)
  if (!input.passedAllGates) {
    const hardGatePenalty = Math.min(40, input.hardGateCount * 15)
    adjustments.push({
      factor: 'Hard gate failures',
      penalty: hardGatePenalty,
      reasoning: `${input.hardGateCount} hard requirement${input.hardGateCount > 1 ? 's' : ''} not met: -${hardGatePenalty}`,
    })
  }

  const riskPenalty = getRiskPenalty(input.implementationRisk)
  if (riskPenalty > 0) {
    adjustments.push({
      factor: 'Implementation risk',
      penalty: riskPenalty,
      reasoning: `Risk score ${input.implementationRisk.score}/100 (${input.implementationRisk.label}): -${riskPenalty}`,
    })
  }

  const confidencePenalty = getConfidencePenalty(input.confidence)
  if (confidencePenalty > 0) {
    adjustments.push({
      factor: 'Evidence confidence',
      penalty: confidencePenalty,
      reasoning: `Confidence score ${input.confidence.score}/100 (${input.confidence.label}): -${confidencePenalty}`,
    })
  }

  const softGatePenalty = getSoftGatePenalty(input.gateFailures)
  if (softGatePenalty > 0) {
    const softCount = input.gateFailures.filter(g => g.severity === 'soft').length
    adjustments.push({
      factor: 'Soft gate warnings',
      penalty: softGatePenalty,
      reasoning: `${softCount} soft gate warning${softCount > 1 ? 's' : ''}: -${softGatePenalty}`,
    })
  }

  const heuristicPenalty = getHeuristicPenalty(input.heuristicFlags)
  if (heuristicPenalty > 0) {
    adjustments.push({
      factor: 'Heuristic assumptions',
      penalty: heuristicPenalty,
      reasoning: `${input.heuristicFlags.length} assumption${input.heuristicFlags.length > 1 ? 's' : ''} used: -${heuristicPenalty}`,
    })
  }

  const hardGatePenalty = !input.passedAllGates ? Math.min(40, input.hardGateCount * 15) : 0
  const totalPenalty = hardGatePenalty + riskPenalty + confidencePenalty + softGatePenalty + heuristicPenalty
  const decisionScore = Math.max(0, Math.min(100, input.fitScore - totalPenalty))

  return { decisionScore, adjustments }
}
