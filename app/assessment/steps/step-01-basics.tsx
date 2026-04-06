'use client'

import { UseFormRegister, FieldErrors, Control } from 'react-hook-form'
import { QuestionField } from '../components/QuestionStep'
import type { AssessmentFormValues } from '../schemas/assessment-schema'
import type { AssessmentContext } from '@/lib/assessment/conditional-logic'

interface Step1Props {
  register: UseFormRegister<AssessmentFormValues>
  errors: FieldErrors<AssessmentFormValues>
  control: Control<AssessmentFormValues>
  assessmentContext: AssessmentContext
}

export function Step1Basics({ register, errors, control }: Step1Props) {
  return (
    <div>
      <h2 className="font-heading text-2xl font-bold text-white mb-1">The Basics</h2>
      <p className="text-sm text-neutral-500 mb-6">Answer a few questions about your use case and organization.</p>

      <QuestionField
        register={register}
        errors={errors}
        control={control}
        field={{
          name: 'useCase',
          label: 'What is your primary use case?',
          type: 'radio',
          required: true,
          options: [
            { value: 'vendor-selection', label: 'Selecting a vendor/platform' },
            { value: 'implementation-planning', label: 'Planning an implementation' },
            { value: 'platform-evaluation', label: 'Evaluating current platform' },
            { value: 'cost-analysis', label: 'Understanding costs and ROI' },
          ],
        }}
      />

      <QuestionField
        register={register}
        errors={errors}
        control={control}
        field={{
          name: 'organizationSize',
          label: 'What is your organization size?',
          type: 'radio',
          required: true,
          options: [
            { value: '1-50', label: '1-50 employees' },
            { value: '51-200', label: '51-200 employees' },
            { value: '201-1000', label: '201-1,000 employees' },
            { value: '1000+', label: '1,000+ employees' },
          ],
        }}
      />

      <QuestionField
        register={register}
        errors={errors}
        control={control}
        field={{
          name: 'industry',
          label: 'What industry are you in? (Optional)',
          type: 'text',
          placeholder: 'e.g., Healthcare, Financial Services, Retail',
        }}
      />
    </div>
  )
}
