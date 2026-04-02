import { getCriterionLabel, getScoreBreakdown } from './audit-trail'
import type { PlatformScore } from './types'

interface CriterionDelta {
  name: string
  label: string
  winnerContribution: number
  challengerContribution: number
  diff: number
}

export interface DecisionMemoAlternative {
  platformId: string
  platformName: string
  totalScore: number
  scoreGap: number
  whyNot: string
  strongerAreas: string[]
}

export interface DecisionMemoScenario {
  title: string
  detail: string
}

export interface DecisionMemo {
  winner: {
    platformId: string
    platformName: string
    totalScore: number
    confidenceLabel: string
    lead: string
    rationale: string
    reasons: string[]
  }
  alternatives: DecisionMemoAlternative[]
  scenarios: DecisionMemoScenario[]
}

const CRITERION_REASON_FALLBACKS: Record<string, string> = {
  integrationFit: 'Better native integration coverage for your current environment',
  complianceMatch: 'Stronger governance and compliance alignment',
  budgetFit: 'More cost-efficient for the usage profile in this assessment',
  featureMatch: 'Closer coverage of the use cases you selected',
  stackCompatibility: 'Better fit for your team profile and implementation style',
}

export function buildDecisionMemo(scores: PlatformScore[]): DecisionMemo | null {
  const winner = scores[0]
  if (!winner) {
    return null
  }

  const closestChallenger = scores[1]
  const winnerReasons = buildWinnerReasons(winner)
  const lead =
    closestChallenger
      ? `${winner.platformName} is the strongest current recommendation because it produces the best overall weighted fit against your stated priorities, finishing ${winner.totalScore - closestChallenger.totalScore} points ahead of ${closestChallenger.platformName}.`
      : `${winner.platformName} is the strongest current recommendation based on the weighted fit model for your assessment.`

  return {
    winner: {
      platformId: winner.platformId,
      platformName: winner.platformName,
      totalScore: winner.totalScore,
      confidenceLabel: getConfidenceLabel(
        winner.totalScore - (closestChallenger?.totalScore ?? winner.totalScore),
        winner.confidence?.score,
      ),
      lead,
      rationale: winner.recommendationSummary.rationale,
      reasons: winnerReasons,
    },
    alternatives: scores.slice(1, 3).map((challenger) => buildAlternativeMemo(winner, challenger)),
    scenarios: buildRecommendationChangeScenarios(winner, scores.slice(1, 5)),
  }
}

function buildWinnerReasons(winner: PlatformScore): string[] {
  const reasons = [...winner.recommendationSummary.strengths]
  const breakdown = getScoreBreakdown(winner)
    .sort((a, b) => b.contribution - a.contribution)
    .map((criterion) => CRITERION_REASON_FALLBACKS[criterion.name] ?? criterion.label)

  for (const reason of breakdown) {
    if (reasons.length >= 3) {
      break
    }
    if (!reasons.includes(reason)) {
      reasons.push(reason)
    }
  }

  return reasons.slice(0, 3)
}

function buildAlternativeMemo(
  winner: PlatformScore,
  challenger: PlatformScore
): DecisionMemoAlternative {
  const deltas = getCriterionDeltas(winner, challenger)
  const winnerEdges = deltas.filter((delta) => delta.diff > 0.5).slice(0, 2)
  const challengerEdges = deltas.filter((delta) => delta.diff < -0.5).slice(0, 2)

  const reasonParts: string[] = []

  // Prioritize gate failures in "why not"
  const hardGateFailures = challenger.gateFailures?.filter(g => g.severity === 'hard') ?? []
  if (hardGateFailures.length > 0) {
    const failureDescs = hardGateFailures.map(g => `missing ${g.requirement}`)
    reasonParts.push(`Does not meet hard requirements: ${formatList(failureDescs)}.`)
  }

  if (winnerEdges.length > 0 && hardGateFailures.length === 0) {
    reasonParts.push(
      `${winner.platformName} stayed ahead on ${formatList(winnerEdges.map((edge) => edge.label))}.`
    )
  }

  if (challenger.recommendationSummary.caveats[0] && hardGateFailures.length === 0) {
    reasonParts.push(`Main tradeoff: ${challenger.recommendationSummary.caveats[0]}.`)
  } else if (challengerEdges.length > 0) {
    reasonParts.push(
      `${challenger.platformName} is stronger on ${formatList(challengerEdges.map((edge) => edge.label))}, but not enough to offset the broader fit gap.`
    )
  } else {
    reasonParts.push(
      `${winner.platformName} remains the more balanced choice for the current weighting.`
    )
  }

  return {
    platformId: challenger.platformId,
    platformName: challenger.platformName,
    totalScore: challenger.totalScore,
    scoreGap: winner.totalScore - challenger.totalScore,
    whyNot: reasonParts.join(' '),
    strongerAreas: challengerEdges.map((edge) => edge.label),
  }
}

function buildRecommendationChangeScenarios(
  winner: PlatformScore,
  challengers: PlatformScore[]
): DecisionMemoScenario[] {
  const scenarios: DecisionMemoScenario[] = []
  const usedCriteria = new Set<string>()

  // Check if any challenger has gate failures — offer scenario to drop requirement
  for (const challenger of challengers) {
    const hardGates = challenger.gateFailures?.filter(g => g.severity === 'hard') ?? []
    if (hardGates.length > 0 && challenger.totalScore > winner.totalScore - 20) {
      const gateDescs = hardGates.map(g => g.requirement).join(', ')
      scenarios.push({
        title: `If you can relax the ${gateDescs} requirement`,
        detail: `${challenger.platformName} scores ${challenger.totalScore} but was penalized for missing ${gateDescs}. If that requirement is a preference rather than a hard gate, ${challenger.platformName} becomes a viable alternative.`,
      })
      if (scenarios.length >= 3) return scenarios
    }
  }

  for (const challenger of challengers) {
    const challengerAdvantages = getCriterionDeltas(winner, challenger)
      .filter((delta) => delta.diff < -0.75)
      .sort((a, b) => a.diff - b.diff)

    for (const advantage of challengerAdvantages) {
      if (usedCriteria.has(advantage.name)) {
        continue
      }

      const scenario = buildScenarioFromAdvantage(winner, challenger, advantage)
      if (!scenario) {
        continue
      }

      usedCriteria.add(advantage.name)
      scenarios.push(scenario)

      if (scenarios.length === 3) {
        return scenarios
      }
    }
  }

  if (scenarios.length === 0) {
    scenarios.push({
      title: 'If your priorities change materially',
      detail:
        'No single alternative currently beats the winner on enough weighted criteria to flip the recommendation. A different outcome would likely require a meaningful change in the importance of cost, integrations, compliance, features, or implementation model.',
    })
  }

  return scenarios
}

function buildScenarioFromAdvantage(
  winner: PlatformScore,
  challenger: PlatformScore,
  advantage: CriterionDelta
): DecisionMemoScenario | null {
  const winnerCost = winner.recommendationSummary.estimatedAnnualCost
  const challengerCost = challenger.recommendationSummary.estimatedAnnualCost

  switch (advantage.name) {
    case 'budgetFit':
      return {
        title: 'If budget becomes the hard gate',
        detail:
          winnerCost !== null && challengerCost !== null
            ? `${challenger.platformName} is estimated at ${formatCurrency(challengerCost)}/yr versus ${formatCurrency(winnerCost)}/yr for ${winner.platformName}. If cost sensitivity increases, it becomes a more credible choice.`
            : `${challenger.platformName} currently has the stronger budget-fit score. If cost becomes the dominant constraint, it deserves a second look.`,
      }

    case 'integrationFit':
      return {
        title: 'If native integrations matter more',
        detail: `${challenger.platformName} currently outperforms ${winner.platformName} on integration fit. If prebuilt connectivity becomes more important than the broader weighted balance, this recommendation could change.`,
      }

    case 'complianceMatch':
      return {
        title: 'If compliance becomes the primary gate',
        detail: `${challenger.platformName} is currently stronger on compliance alignment. If security and regulatory coverage becomes the top decision driver, it becomes the more defensible option.`,
      }

    case 'featureMatch':
      return {
        title: 'If use-case depth matters more than overall balance',
        detail: `${challenger.platformName} currently wins on feature match. If deeper support for your target workflows becomes the main goal, it can overtake the current leader.`,
      }

    case 'stackCompatibility':
      return {
        title: 'If your implementation model changes',
        detail: `${challenger.platformName} currently scores better on stack compatibility. If your team profile, desired delivery speed, or appetite for custom implementation changes, that could shift the call.`,
      }

    default:
      return null
  }
}

function getCriterionDeltas(winner: PlatformScore, challenger: PlatformScore): CriterionDelta[] {
  return winner.criteriaScores
    .map((winnerCriterion) => {
      const challengerCriterion = challenger.criteriaScores.find(
        (criterion) => criterion.name === winnerCriterion.name
      )

      const winnerContribution = winnerCriterion.weight * winnerCriterion.normalizedValue * 100
      const challengerContribution =
        (challengerCriterion?.weight ?? winnerCriterion.weight) *
        (challengerCriterion?.normalizedValue ?? 0) *
        100

      return {
        name: winnerCriterion.name,
        label: getCriterionLabel(winnerCriterion.name),
        winnerContribution,
        challengerContribution,
        diff: winnerContribution - challengerContribution,
      }
    })
    .sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))
}

function getConfidenceLabel(scoreGap: number, confidenceScore?: number): string {
  const gapLabel = scoreGap >= 15 ? 'Clear leader' : scoreGap >= 6 ? 'Moderate lead' : 'Close call'

  // If confidence is low, qualify the label
  if (confidenceScore != null && confidenceScore < 45) {
    return `${gapLabel} (low evidence)`
  }

  return gapLabel
}

function formatList(items: string[]): string {
  if (items.length === 0) {
    return ''
  }
  if (items.length === 1) {
    return items[0]
  }
  if (items.length === 2) {
    return `${items[0]} and ${items[1]}`
  }
  return `${items.slice(0, -1).join(', ')}, and ${items[items.length - 1]}`
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}
