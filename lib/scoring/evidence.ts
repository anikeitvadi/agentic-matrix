/**
 * Evidence Builder
 *
 * Collects structured facts about how a platform matches the user's requirements.
 * Used by the comparison matrix to show evidence columns instead of just percentages.
 */

import type { Platform } from '.velite'
import type { Evidence, GateFailure } from './types'
import { getAssessmentArray } from '@/lib/assessment/recommendation-context'

export function buildEvidence(
  platform: Platform,
  assessment: Record<string, unknown>,
  gateFailures: GateFailure[],
  estimatedAnnualCost: number,
): Evidence {
  const caps = platform.structuredCapabilities
  const ctx = platform.evaluationContext

  // Count hard requirements — only explicit requirements, not current environment
  const compliance = getAssessmentArray(assessment, 'complianceRequirements').filter(v => v !== 'none')
  const integrations = getAssessmentArray(assessment, 'integrationNeeds')

  // Hard requirements = compliance certs only
  // NOTE: currentStack describes existing infrastructure, not deployment requirements.
  // Deployment compatibility is a soft signal, not a hard requirement.
  const hardReqs: { name: string; met: boolean }[] = []

  const certs = caps?.complianceCerts ?? []
  const certsLower = certs.map(c => c.toLowerCase())
  for (const req of compliance) {
    hardReqs.push({ name: req.toUpperCase(), met: certsLower.includes(req.toLowerCase()) })
  }

  const hardRequirementsMet = hardReqs.filter(r => r.met).length
  const hardRequirementsTotal = hardReqs.length
  const certsMissing = compliance.filter(req => !certsLower.includes(req.toLowerCase())).map(r => r.toUpperCase())

  // Integration matching
  const supported = caps?.supportedIntegrations ?? []
  const supportedLower = supported.map(s => s.toLowerCase())
  const integrationsMet = integrations.filter(n =>
    supportedLower.some(s => s.includes(n.toLowerCase()) || n.toLowerCase().includes(s))
  )
  const integrationsMissing = integrations.filter(n =>
    !supportedLower.some(s => s.includes(n.toLowerCase()) || n.toLowerCase().includes(s))
  )

  return {
    annualCostEstimate: estimatedAnnualCost > 0 ? estimatedAnnualCost : null,
    hardRequirementsMet,
    hardRequirementsTotal,
    certsMissing,
    integrationsMet,
    integrationsMissing,
    deploymentOptions: caps?.deploymentOptions ?? ['saas'],
    modelFlexibility: ctx?.modelFlexibility ?? 'unknown',
    observability: ctx?.observability ?? 'unknown',
    vendorViability: ctx?.vendorViability ?? 'unknown',
    ecosystemMaturity: ctx?.ecosystemMaturity ?? 'unknown',
  }
}
