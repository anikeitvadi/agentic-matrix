'use client'

import { UseFormRegister, FieldErrors, Control } from 'react-hook-form'
import type { AssessmentFormValues } from '../schemas/assessment-schema'

interface QuestionStepProps {
  register: UseFormRegister<AssessmentFormValues>
  errors: FieldErrors<AssessmentFormValues>
  control: Control<AssessmentFormValues>
}

interface FieldConfig {
  name: string
  label: string
  type: 'radio' | 'checkbox' | 'text' | 'select'
  options?: { value: string; label: string }[]
  placeholder?: string
  required?: boolean
  description?: string
}

interface QuestionFieldProps extends QuestionStepProps {
  field: FieldConfig
}

export function QuestionField({ register, errors, control: _control, field }: QuestionFieldProps) {
  const errorMessage = getErrorMessage(errors, field.name)

  return (
    <div className="mb-8 last:mb-0">
      <label className="block font-heading text-base font-semibold text-white mb-1">
        {field.label}
        {field.required && <span className="ml-1 text-brand-400">*</span>}
      </label>

      {field.description && (
        <p className="text-sm text-neutral-500 mb-4">{field.description}</p>
      )}

      {/* Radio buttons */}
      {field.type === 'radio' && field.options && (
        <div className="grid gap-2 sm:grid-cols-2">
          {field.options.map((option) => (
            <label
              key={option.value}
              className="group flex items-center gap-3 rounded-xl border border-neutral-800/60 bg-neutral-900/30 p-4 cursor-pointer transition-all duration-200 hover:border-neutral-600 has-[:checked]:border-brand-500/60 has-[:checked]:bg-brand-950/30 has-[:checked]:shadow-[0_0_12px_rgba(71,180,167,0.06)]"
            >
              <input
                type="radio"
                value={option.value}
                {...register(field.name as keyof AssessmentFormValues)}
                className="h-4 w-4 border-neutral-600 bg-neutral-800 text-brand-500 focus:ring-brand-500 focus:ring-2 focus:ring-offset-0"
              />
              <span className="text-sm text-neutral-300 group-has-[:checked]:text-brand-300 transition-colors">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Checkboxes */}
      {field.type === 'checkbox' && field.options && (
        <div className="grid gap-2 sm:grid-cols-2">
          {field.options.map((option) => (
            <label
              key={option.value}
              className="group flex items-center gap-3 rounded-xl border border-neutral-800/60 bg-neutral-900/30 p-4 cursor-pointer transition-all duration-200 hover:border-neutral-600 has-[:checked]:border-brand-500/60 has-[:checked]:bg-brand-950/30 has-[:checked]:shadow-[0_0_12px_rgba(71,180,167,0.06)]"
            >
              <input
                type="checkbox"
                value={option.value}
                {...register(field.name as keyof AssessmentFormValues)}
                className="h-4 w-4 rounded border-neutral-600 bg-neutral-800 text-brand-500 focus:ring-brand-500 focus:ring-2 focus:ring-offset-0"
              />
              <span className="text-sm text-neutral-300 group-has-[:checked]:text-brand-300 transition-colors">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      )}

      {/* Text input */}
      {field.type === 'text' && (
        <input
          type="text"
          {...register(field.name as keyof AssessmentFormValues)}
          placeholder={field.placeholder}
          className="w-full rounded-xl border border-neutral-800/60 bg-neutral-900/30 px-4 py-3 text-sm text-white placeholder-neutral-600 transition-all focus:border-brand-500/60 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
        />
      )}

      {/* Select dropdown */}
      {field.type === 'select' && field.options && (
        <select
          {...register(field.name as keyof AssessmentFormValues)}
          className="w-full rounded-xl border border-neutral-800/60 bg-neutral-900/30 px-4 py-3 text-sm text-white transition-all focus:border-brand-500/60 focus:outline-none focus:ring-1 focus:ring-brand-500/30"
        >
          <option value="">Select an option</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {/* Error */}
      {errorMessage && (
        <p className="mt-2 text-sm text-red-400">{errorMessage}</p>
      )}
    </div>
  )
}

function getErrorMessage(errors: FieldErrors<AssessmentFormValues>, fieldPath: string): string | undefined {
  const parts = fieldPath.split('.')
  let current: Record<string, unknown> | undefined = errors as Record<string, unknown>

  for (const part of parts) {
    if (!current || !current[part]) return undefined
    current = current[part] as Record<string, unknown> | undefined
  }

  return current?.message as string | undefined
}
