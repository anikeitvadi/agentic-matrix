import { z } from 'zod'
import {
  step1Schema,
  step2Schema,
  step3Schema,
  step4Schema,
  type Step1Data,
  type Step2Data,
  type Step3Data,
  type Step4Data
} from './step-schemas'

/**
 * Complete assessment schema combining all steps
 */
export const assessmentSchema = z.object({
  step1: step1Schema,
  step2: step2Schema,
  step3: step3Schema,
  step4: step4Schema
})

/**
 * TypeScript type for complete assessment data
 */
export type AssessmentData = z.infer<typeof assessmentSchema>

/**
 * Flat form values type — the assessment form registers fields with flat keys
 * (e.g. "useCase", not "step1.useCase"), so this union represents what
 * useForm actually holds at runtime.
 */
export type AssessmentFormValues = Step1Data & Step2Data & Step3Data & Step4Data

/**
 * Export individual step types for convenience
 */
export type { Step1Data, Step2Data, Step3Data, Step4Data }
