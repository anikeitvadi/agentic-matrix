'use client'

import { UseFormRegister, FieldErrors, Control } from 'react-hook-form'
import { QuestionField } from '../components/QuestionStep'
import type { AssessmentData } from '../schemas/assessment-schema'

interface Step2Props {
  register: UseFormRegister<AssessmentData>
  errors: FieldErrors<AssessmentData>
  control: Control<AssessmentData>
}

export function Step2CurrentState({ register, errors, control }: Step2Props) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-2">Current State</h2>
      <p className="text-neutral-400 mb-6">Tell us about your existing setup and infrastructure.</p>

      <QuestionField
        register={register}
        errors={errors}
        control={control}
        field={{
          name: 'hasExistingPlatform',
          label: 'Do you currently have an agentic AI platform?',
          type: 'radio',
          required: true,
          options: [
            { value: 'true', label: 'Yes, we have an existing platform' },
            { value: 'false', label: 'No, this is a new initiative' },
          ],
        }}
      />

      <QuestionField
        register={register}
        errors={errors}
        control={control}
        field={{
          name: 'existingPlatforms',
          label: 'What platforms are you currently using? (Optional)',
          type: 'text',
          placeholder: 'e.g., Salesforce Einstein, AWS Bedrock Agents',
          description: 'Comma-separated list of platforms',
        }}
      />

      <QuestionField
        register={register}
        errors={errors}
        control={control}
        field={{
          name: 'currentStack',
          label: 'What is your current infrastructure?',
          type: 'checkbox',
          required: true,
          description: 'Select all that apply',
          options: [
            { value: 'aws', label: 'AWS' },
            { value: 'azure', label: 'Azure' },
            { value: 'gcp', label: 'Google Cloud Platform' },
            { value: 'on-premise', label: 'On-premise' },
            { value: 'hybrid', label: 'Hybrid' },
          ],
        }}
      />

      <QuestionField
        register={register}
        errors={errors}
        control={control}
        field={{
          name: 'integrationNeeds',
          label: 'What systems do you need to integrate with? (Optional)',
          type: 'text',
          placeholder: 'e.g., Salesforce, SAP, custom CRM',
          description: 'Comma-separated list of systems',
        }}
      />
    </div>
  )
}
