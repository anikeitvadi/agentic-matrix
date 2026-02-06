'use client'

import { UseFormRegister, FieldErrors, Control } from 'react-hook-form'
import { QuestionField } from '../components/QuestionStep'
import type { AssessmentData } from '../schemas/assessment-schema'
import type { AssessmentContext } from '@/lib/assessment/conditional-logic'

interface Step4Props {
  register: UseFormRegister<AssessmentData>
  errors: FieldErrors<AssessmentData>
  control: Control<AssessmentData>
  assessmentContext: AssessmentContext
}

export function Step4Constraints({ register, errors, control }: Step4Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Constraints</h2>
      <p className="text-neutral-400 mb-6">Help us understand your practical limitations.</p>

      <QuestionField
        register={register}
        errors={errors}
        control={control}
        field={{
          name: 'budgetRange',
          label: 'What is your budget range?',
          type: 'radio',
          required: true,
          options: [
            { value: 'under-10k', label: 'Under $10k annually' },
            { value: '10k-50k', label: '$10k - $50k annually' },
            { value: '50k-200k', label: '$50k - $200k annually' },
            { value: '200k-plus', label: '$200k+ annually' },
            { value: 'unknown', label: 'Not sure yet' },
          ],
        }}
      />

      <QuestionField
        register={register}
        errors={errors}
        control={control}
        field={{
          name: 'teamTechnicalLevel',
          label: 'What is your team\'s technical level?',
          type: 'radio',
          required: true,
          options: [
            { value: 'non-technical', label: 'Non-technical (business users)' },
            { value: 'some-technical', label: 'Some technical knowledge' },
            { value: 'engineering-team', label: 'Engineering team available' },
            { value: 'ai-ml-expertise', label: 'AI/ML expertise in-house' },
          ],
        }}
      />

      <QuestionField
        register={register}
        errors={errors}
        control={control}
        field={{
          name: 'decisionMakers',
          label: 'Who are the decision makers involved?',
          type: 'checkbox',
          required: true,
          description: 'Select all that apply',
          options: [
            { value: 'it-leader', label: 'IT Leader (CTO, CIO)' },
            { value: 'business-leader', label: 'Business Leader (COO, VP)' },
            { value: 'executive', label: 'Executive (CEO, CFO)' },
            { value: 'technical-team', label: 'Technical Team' },
          ],
        }}
      />
    </div>
  )
}
