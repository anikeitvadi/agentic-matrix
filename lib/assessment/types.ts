// Question field types for dynamic rendering
export type FieldType = 'text' | 'textarea' | 'select' | 'multi-select' | 'radio' | 'scale' | 'yes-no'

export interface Question {
  id: string
  text: string
  fieldType: FieldType
  options?: string[]  // For select, multi-select, radio
  required?: boolean
  placeholder?: string
}

export interface StepConfig {
  id: string
  title: string
  description: string
  questions: Question[]
}

// Context passed to AI for follow-up generation
export interface AssessmentContext {
  useCase: string
  organizationSize: string
  currentStack: string[]
  timeline: string
  budget: string
  answers: Record<string, unknown>
}
