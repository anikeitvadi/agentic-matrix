'use client'

import { UseFormRegister, FieldErrors, Control, Controller } from 'react-hook-form'
import type { AssessmentData } from '../schemas/assessment-schema'

interface QuestionStepProps {
  register: UseFormRegister<AssessmentData>
  errors: FieldErrors<AssessmentData>
  control: Control<AssessmentData>
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

export function QuestionField({ register, errors, control, field }: QuestionFieldProps) {
  const errorMessage = getErrorMessage(errors, field.name)

  return (
    <div className="mb-6">
      <label className="block text-sm font-medium mb-2">
        {field.label}
        {field.required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {field.description && (
        <p className="text-sm text-neutral-400 mb-3">{field.description}</p>
      )}

      {/* Radio buttons */}
      {field.type === 'radio' && field.options && (
        <div className="space-y-2">
          {field.options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 p-3 rounded-lg border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-colors"
            >
              <input
                type="radio"
                value={option.value}
                {...register(field.name as any)}
                className="w-4 h-4 text-brand-600 bg-neutral-900 border-neutral-700 focus:ring-brand-600 focus:ring-2"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Checkboxes */}
      {field.type === 'checkbox' && field.options && (
        <div className="space-y-2">
          {field.options.map((option) => (
            <label
              key={option.value}
              className="flex items-center gap-3 p-3 rounded-lg border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                value={option.value}
                {...register(field.name as any)}
                className="w-4 h-4 text-brand-600 bg-neutral-900 border-neutral-700 rounded focus:ring-brand-600 focus:ring-2"
              />
              <span className="text-sm">{option.label}</span>
            </label>
          ))}
        </div>
      )}

      {/* Text input */}
      {field.type === 'text' && (
        <input
          type="text"
          {...register(field.name as any)}
          placeholder={field.placeholder}
          className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
        />
      )}

      {/* Select dropdown */}
      {field.type === 'select' && field.options && (
        <select
          {...register(field.name as any)}
          className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
        >
          <option value="">Select an option</option>
          {field.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      )}

      {/* Error message */}
      {errorMessage && (
        <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  )
}

// Helper to extract error message from nested errors object
function getErrorMessage(errors: FieldErrors<AssessmentData>, fieldPath: string): string | undefined {
  const parts = fieldPath.split('.')
  let current: any = errors

  for (const part of parts) {
    if (!current || !current[part]) return undefined
    current = current[part]
  }

  return current?.message
}
