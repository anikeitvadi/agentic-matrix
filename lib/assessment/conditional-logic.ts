/**
 * Conditional logic for assessment form fields
 *
 * Determines which fields should be shown based on previous answers.
 * Uses explicit switch statements for maintainability.
 */

export type AssessmentContext = {
  useCase?: string
  hasExistingPlatform?: boolean | string
  complianceRequirements?: string[]
  [key: string]: any // Allow other fields
}

/**
 * Determines if a field should be shown based on current form context
 */
export function shouldShowField(
  fieldId: string,
  context: AssessmentContext
): boolean {
  // Convert string boolean to actual boolean for hasExistingPlatform
  const hasExisting = context.hasExistingPlatform === true || context.hasExistingPlatform === 'true'

  // Normalize complianceRequirements to always be an array (checkboxes can return string or array)
  const compliance = Array.isArray(context.complianceRequirements)
    ? context.complianceRequirements
    : context.complianceRequirements
      ? [context.complianceRequirements]
      : []

  switch (fieldId) {
    // Rule 1: Existing Platform Details
    case 'existingPlatforms':
    case 'painPoints':
      return hasExisting

    // Rule 2: Use Case Specific Questions
    case 'vendorCriteria':
    case 'evaluationTimeline':
      return context.useCase === 'vendor-selection'

    case 'selectedVendor':
    case 'implementationChallenges':
      return context.useCase === 'implementation-planning'

    case 'currentSpend':
    case 'budgetConstraints':
      return context.useCase === 'cost-analysis'

    // Rule 3: Compliance Details
    case 'healthcareDataTypes':
      return compliance.includes('hipaa')

    case 'governmentAgency':
      return compliance.includes('fedramp')

    // Default: show all non-conditional fields
    default:
      return true
  }
}

/**
 * Get list of all conditional fields and their dependencies
 * Useful for documentation and debugging
 */
export function getConditionalFields(): Array<{
  fieldId: string
  dependsOn: string
  condition: string
}> {
  return [
    {
      fieldId: 'existingPlatforms',
      dependsOn: 'hasExistingPlatform',
      condition: 'equals true'
    },
    {
      fieldId: 'painPoints',
      dependsOn: 'hasExistingPlatform',
      condition: 'equals true'
    },
    {
      fieldId: 'vendorCriteria',
      dependsOn: 'useCase',
      condition: "equals 'vendor-selection'"
    },
    {
      fieldId: 'evaluationTimeline',
      dependsOn: 'useCase',
      condition: "equals 'vendor-selection'"
    },
    {
      fieldId: 'selectedVendor',
      dependsOn: 'useCase',
      condition: "equals 'implementation-planning'"
    },
    {
      fieldId: 'implementationChallenges',
      dependsOn: 'useCase',
      condition: "equals 'implementation-planning'"
    },
    {
      fieldId: 'currentSpend',
      dependsOn: 'useCase',
      condition: "equals 'cost-analysis'"
    },
    {
      fieldId: 'budgetConstraints',
      dependsOn: 'useCase',
      condition: "equals 'cost-analysis'"
    },
    {
      fieldId: 'healthcareDataTypes',
      dependsOn: 'complianceRequirements',
      condition: "includes 'hipaa'"
    },
    {
      fieldId: 'governmentAgency',
      dependsOn: 'complianceRequirements',
      condition: "includes 'fedramp'"
    },
  ]
}
