'use client'

import { UseFormRegister, FieldErrors, Control } from 'react-hook-form'
import { QuestionField } from '../components/QuestionStep'
import type { AssessmentData } from '../schemas/assessment-schema'
import type { AssessmentContext } from '@/lib/assessment/conditional-logic'

interface Step3Props {
  register: UseFormRegister<AssessmentData>
  errors: FieldErrors<AssessmentData>
  control: Control<AssessmentData>
  assessmentContext: AssessmentContext
}

export function Step3Requirements({ register, errors, control, assessmentContext }: Step3Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Requirements</h2>
      <p className="text-neutral-400 mb-6">What do you need from an agentic AI platform?</p>

      <QuestionField
        register={register}
        errors={errors}
        control={control}
        field={{
          name: 'primaryUseCases',
          label: 'What are your primary use cases?',
          type: 'checkbox',
          required: true,
          description: 'Select all that apply',
          options: [
            { value: 'customer-support', label: 'Customer Support' },
            { value: 'data-extraction', label: 'Data Extraction' },
            { value: 'workflow-automation', label: 'Workflow Automation' },
            { value: 'knowledge-qa', label: 'Knowledge Q&A' },
            { value: 'sales-routing', label: 'Sales Routing' },
            { value: 'it-ticketing', label: 'IT Ticketing' },
          ],
        }}
      />

      <QuestionField
        register={register}
        errors={errors}
        control={control}
        field={{
          name: 'complianceRequirements',
          label: 'What compliance requirements do you have?',
          type: 'checkbox',
          required: true,
          description: 'Select all that apply',
          options: [
            { value: 'hipaa', label: 'HIPAA' },
            { value: 'soc2', label: 'SOC 2' },
            { value: 'gdpr', label: 'GDPR' },
            { value: 'fedramp', label: 'FedRAMP' },
            { value: 'none', label: 'None / Not applicable' },
          ],
        }}
      />

      <QuestionField
        register={register}
        errors={errors}
        control={control}
        field={{
          name: 'timeline',
          label: 'What is your implementation timeline?',
          type: 'radio',
          required: true,
          options: [
            { value: 'asap', label: 'ASAP (within 1 month)' },
            { value: '1-3-months', label: '1-3 months' },
            { value: '3-6-months', label: '3-6 months' },
            { value: '6-12-months', label: '6-12 months' },
            { value: 'exploring', label: 'Just exploring options' },
          ],
        }}
      />
    </div>
  )
}
