/**
 * Conditional logic for assessment form fields.
 *
 * Only covers fields that actually exist in the current assessment schema
 * (step-schemas.ts) and influence scoring or results.
 */

export type AssessmentContext = {
  useCase?: string
  hasExistingPlatform?: boolean | string
  complianceRequirements?: string[]
}

/**
 * Determines if a field should be shown based on current form context.
 */
export function shouldShowField(
  fieldId: string,
  context: AssessmentContext
): boolean {
  const hasExisting = context.hasExistingPlatform === true || context.hasExistingPlatform === 'true'

  switch (fieldId) {
    // Show existing platform details only if user has one
    case 'existingPlatforms':
      return hasExisting

    // All other fields are always shown
    default:
      return true
  }
}
