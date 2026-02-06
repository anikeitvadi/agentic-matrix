import { Step1Basics } from './step-01-basics'
import { Step2CurrentState } from './step-02-current-state'
import { Step3Requirements } from './step-03-requirements'
import { Step4Constraints } from './step-04-constraints'
import { step1Schema, step2Schema, step3Schema, step4Schema } from '../schemas/step-schemas'

/**
 * Step components registry
 */
export const steps = [Step1Basics, Step2CurrentState, Step3Requirements, Step4Constraints]

/**
 * Step labels for the progress indicator
 */
export const stepLabels = ['Basics', 'Current State', 'Requirements', 'Constraints']

/**
 * Get the Zod schema for a specific step
 */
export function getStepSchema(stepNumber: number) {
  const schemas = {
    1: step1Schema,
    2: step2Schema,
    3: step3Schema,
    4: step4Schema,
  }

  return schemas[stepNumber as keyof typeof schemas] || step1Schema
}

/**
 * Validate step data using Zod schema
 */
export function validateStep(stepNumber: number, data: any) {
  const schema = getStepSchema(stepNumber)
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, errors: [] }
  }

  const errors = result.error.errors.map((err) => ({
    path: err.path[0] as string,
    message: err.message,
  }))

  return { success: false, errors }
}
