/**
 * Audit Trail Generation Utilities
 *
 * Provides functions to generate human-readable explanations of platform scores.
 * Supports RECC-04: Users should understand why platform X scored higher than Y.
 */

import type { AuditEntry, PlatformScore, Criterion } from './types'
import { CRITERION_DIRECTIONS } from './normalize'

/**
 * Human-readable labels for each criterion.
 */
const CRITERION_LABELS: Record<string, string> = {
  integrationFit: 'Integration Fit',
  complianceMatch: 'Compliance Match',
  budgetFit: 'Budget Fit',
  featureMatch: 'Feature Match',
  stackCompatibility: 'Tech Stack Compatibility',
}

/**
 * Human-readable descriptions for each criterion.
 */
const CRITERION_DESCRIPTIONS: Record<string, string> = {
  integrationFit:
    'How well the platform integrates with your existing tools and systems',
  complianceMatch:
    'Alignment with your security and regulatory requirements',
  budgetFit: 'How well the pricing fits your budget constraints',
  featureMatch: 'Coverage of your required features and use cases',
  stackCompatibility:
    'Compatibility with your technology stack and development practices',
}

/**
 * Generates a complete audit trail for a platform score.
 *
 * Creates AuditEntry[] with human-readable reasoning for each criterion.
 *
 * @param platformName - Name of the platform being scored
 * @param criteria - Array of scored criteria
 * @returns Array of audit entries with explanations
 *
 * @example
 * const trail = generateAuditTrail('n8n', criteriaScores)
 * // Returns AuditEntry[] with reasoning for each criterion
 */
export function generateAuditTrail(
  platformName: string,
  criteria: Criterion[]
): AuditEntry[] {
  return criteria.map((criterion) => {
    const weightedScore = criterion.weight * criterion.normalizedValue

    return {
      criterionName: criterion.name,
      rawValue: criterion.value,
      normalizedValue: criterion.normalizedValue,
      weight: criterion.weight,
      weightedScore,
      reasoning: generateReasoningText(criterion, platformName),
    }
  })
}

/**
 * Explains why one platform scored higher than another.
 *
 * Compares two PlatformScore objects and produces a human-readable
 * explanation of the key differences that led to the winner's higher score.
 *
 * @param winner - The platform with the higher score
 * @param loser - The platform with the lower score
 * @returns Human-readable explanation string
 *
 * @example
 * const explanation = explainComparison(n8nScore, zapierScore)
 * // "n8n scored 15 points higher than Zapier (78 vs 63).
 * //  The main advantages were: Budget Fit (+8.5 points), Tech Stack Compatibility (+4.2 points).
 * //  Zapier was stronger in: Integration Fit (+1.8 points)."
 */
export function explainComparison(
  winner: PlatformScore,
  loser: PlatformScore
): string {
  const scoreDiff = winner.totalScore - loser.totalScore

  if (scoreDiff === 0) {
    return `${winner.platformName} and ${loser.platformName} have identical scores of ${winner.totalScore}.`
  }

  if (scoreDiff < 0) {
    // Swap if winner is actually lower
    return explainComparison(loser, winner)
  }

  // Calculate criterion-level differences
  const differences: Array<{
    name: string
    label: string
    diff: number
    winnerScore: number
    loserScore: number
  }> = []

  for (const winnerCrit of winner.criteriaScores) {
    const loserCrit = loser.criteriaScores.find(
      (c) => c.name === winnerCrit.name
    )

    if (loserCrit) {
      const winnerWeighted = winnerCrit.weight * winnerCrit.normalizedValue * 100
      const loserWeighted = loserCrit.weight * loserCrit.normalizedValue * 100
      const diff = winnerWeighted - loserWeighted

      differences.push({
        name: winnerCrit.name,
        label: CRITERION_LABELS[winnerCrit.name] || winnerCrit.name,
        diff,
        winnerScore: winnerWeighted,
        loserScore: loserWeighted,
      })
    }
  }

  // Sort by absolute difference
  differences.sort((a, b) => Math.abs(b.diff) - Math.abs(a.diff))

  // Separate advantages and disadvantages
  const advantages = differences.filter((d) => d.diff > 0.5)
  const disadvantages = differences.filter((d) => d.diff < -0.5)

  // Build explanation
  const parts: string[] = []

  parts.push(
    `${winner.platformName} scored ${scoreDiff} points higher than ${loser.platformName} (${winner.totalScore} vs ${loser.totalScore}).`
  )

  if (advantages.length > 0) {
    const advantageList = advantages
      .slice(0, 3) // Top 3 advantages
      .map((a) => `${a.label} (+${a.diff.toFixed(1)} points)`)
      .join(', ')
    parts.push(`The main advantages were: ${advantageList}.`)
  }

  if (disadvantages.length > 0) {
    const disadvantageList = disadvantages
      .slice(0, 2) // Top 2 disadvantages
      .map((d) => `${d.label} (${d.diff.toFixed(1)} points)`)
      .join(', ')
    parts.push(`${loser.platformName} was stronger in: ${disadvantageList}.`)
  }

  return parts.join(' ')
}

/**
 * Formats a single audit entry for display.
 *
 * Produces a human-readable string summarizing the criterion score.
 *
 * @param entry - The audit entry to format
 * @returns Formatted string for display
 *
 * @example
 * const formatted = formatAuditEntry(entry)
 * // "Integration Fit: Scored 72% (contributed 14.4 of 100 points)"
 */
export function formatAuditEntry(entry: AuditEntry): string {
  const label = CRITERION_LABELS[entry.criterionName] || entry.criterionName
  const normalizedPercent = (entry.normalizedValue * 100).toFixed(0)
  const contribution = (entry.weightedScore * 100).toFixed(1)
  const maxContribution = (entry.weight * 100).toFixed(1)

  return `${label}: Scored ${normalizedPercent}% (contributed ${contribution} of ${maxContribution} possible points)`
}

/**
 * Gets the human-readable label for a criterion.
 *
 * @param criterionName - Internal criterion name
 * @returns Human-readable label
 */
export function getCriterionLabel(criterionName: string): string {
  return CRITERION_LABELS[criterionName] || criterionName
}

/**
 * Gets the human-readable description for a criterion.
 *
 * @param criterionName - Internal criterion name
 * @returns Human-readable description
 */
export function getCriterionDescription(criterionName: string): string {
  return (
    CRITERION_DESCRIPTIONS[criterionName] ||
    `Score for ${getCriterionLabel(criterionName)}`
  )
}

/**
 * Generates human-readable reasoning text for a criterion.
 *
 * Internal helper that produces context-aware explanations
 * based on the criterion type and score.
 */
function generateReasoningText(criterion: Criterion, platformName: string): string {
  const normalizedPercent = (criterion.normalizedValue * 100).toFixed(0)
  const contribution = (criterion.weight * criterion.normalizedValue * 100).toFixed(1)
  const label = CRITERION_LABELS[criterion.name] || criterion.name

  // Determine performance level
  let performanceLevel: string
  if (criterion.normalizedValue >= 0.8) {
    performanceLevel = 'excellent'
  } else if (criterion.normalizedValue >= 0.6) {
    performanceLevel = 'good'
  } else if (criterion.normalizedValue >= 0.4) {
    performanceLevel = 'moderate'
  } else if (criterion.normalizedValue >= 0.2) {
    performanceLevel = 'limited'
  } else {
    performanceLevel = 'minimal'
  }

  // Generate context-specific reasoning
  switch (criterion.name) {
    case 'integrationFit':
      return `${platformName} shows ${performanceLevel} integration capabilities, ` +
        `matching ${normalizedPercent}% of your integration needs. ` +
        `This contributes ${contribution} points to the total score.`

    case 'complianceMatch':
      return `${platformName} provides ${performanceLevel} compliance coverage, ` +
        `meeting ${normalizedPercent}% of your security and regulatory requirements. ` +
        `This contributes ${contribution} points to the total score.`

    case 'budgetFit':
      // Note: for budget, higher normalized score means LOWER cost (inverted)
      const budgetLevel = criterion.normalizedValue >= 0.6 ? 'competitively priced' :
                          criterion.normalizedValue >= 0.3 ? 'moderately priced' : 'premium priced'
      return `${platformName} is ${budgetLevel} relative to alternatives, ` +
        `with a budget fit score of ${normalizedPercent}%. ` +
        `This contributes ${contribution} points to the total score.`

    case 'featureMatch':
      return `${platformName} offers ${performanceLevel} feature coverage, ` +
        `addressing ${normalizedPercent}% of your required capabilities. ` +
        `This contributes ${contribution} points to the total score.`

    case 'stackCompatibility':
      return `${platformName} has ${performanceLevel} compatibility with your tech stack, ` +
        `scoring ${normalizedPercent}% on development integration. ` +
        `This contributes ${contribution} points to the total score.`

    default:
      return `${platformName} scored ${normalizedPercent}% on ${label}, ` +
        `contributing ${contribution} points to the total score.`
  }
}

/**
 * Generates a summary of score breakdown for a platform.
 *
 * @param score - Complete platform score
 * @returns Array of formatted criterion summaries
 */
export function getScoreBreakdown(score: PlatformScore): Array<{
  name: string
  label: string
  description: string
  normalizedValue: number
  weight: number
  contribution: number
  reasoning: string
}> {
  return score.criteriaScores.map((criterion) => {
    const auditEntry = score.auditTrail.find(
      (a) => a.criterionName === criterion.name
    )

    return {
      name: criterion.name,
      label: getCriterionLabel(criterion.name),
      description: getCriterionDescription(criterion.name),
      normalizedValue: criterion.normalizedValue,
      weight: criterion.weight,
      contribution: criterion.weight * criterion.normalizedValue * 100,
      reasoning: auditEntry?.reasoning || '',
    }
  })
}
