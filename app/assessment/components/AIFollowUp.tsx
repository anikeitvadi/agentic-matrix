'use client'

import { useState, useTransition } from 'react'
import { UseFormRegister, FieldErrors, Control } from 'react-hook-form'
import { generateFollowUp, type FollowUpQuestion } from '../actions'

interface AIFollowUpProps {
  context: Record<string, unknown>
  register: UseFormRegister<any>
  errors: FieldErrors<any>
  control: Control<any>
}

export function AIFollowUp({ context, register, errors, control }: AIFollowUpProps) {
  const [questions, setQuestions] = useState<FollowUpQuestion[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [hasGenerated, setHasGenerated] = useState(false)

  const handleGenerate = () => {
    startTransition(async () => {
      const result = await generateFollowUp(context)

      if ('error' in result) {
        setError(result.error)
      } else {
        setQuestions(result.questions)
        setError(null)
      }
      setHasGenerated(true)
    })
  }

  // Don't show if no context yet
  if (Object.keys(context).length < 3) {
    return null
  }

  return (
    <div className="mt-6 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700">
      <h3 className="text-lg font-medium text-white mb-2">
        AI-Powered Follow-Up
      </h3>

      {!hasGenerated && !isPending && (
        <div>
          <p className="text-neutral-400 text-sm mb-3">
            Get personalized clarifying questions based on your answers.
          </p>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isPending}
            className="px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            Generate Follow-Up Questions
          </button>
        </div>
      )}

      {isPending && (
        <div className="flex items-center gap-2 text-neutral-400">
          <div className="animate-spin w-4 h-4 border-2 border-neutral-500 border-t-brand-500 rounded-full" />
          <span>Analyzing your answers...</span>
        </div>
      )}

      {error && (
        <div className="text-amber-400 text-sm mt-2">
          {error}
        </div>
      )}

      {questions.length > 0 && (
        <div className="space-y-4 mt-4">
          {questions.map((q) => (
            <AIQuestionField
              key={q.id}
              question={q}
              register={register}
              errors={errors}
            />
          ))}
        </div>
      )}
    </div>
  )
}

interface AIQuestionFieldProps {
  question: FollowUpQuestion
  register: UseFormRegister<any>
  errors: FieldErrors<any>
}

function AIQuestionField({ question, register, errors }: AIQuestionFieldProps) {
  const fieldName = `ai_${question.id}`
  const errorMessage = errors[fieldName]?.message as string | undefined

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium mb-2 text-neutral-100">
        {question.text}
      </label>

      <p className="text-xs text-neutral-500 mb-2 italic">
        {question.rationale}
      </p>

      {/* Text input */}
      {question.fieldType === 'text' && (
        <input
          type="text"
          {...register(fieldName)}
          className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
        />
      )}

      {/* Textarea */}
      {question.fieldType === 'textarea' && (
        <textarea
          {...register(fieldName)}
          rows={3}
          className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 placeholder-neutral-600 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors resize-y"
        />
      )}

      {/* Select dropdown */}
      {question.fieldType === 'select' && question.options && (
        <select
          {...register(fieldName)}
          className="w-full px-4 py-2 bg-neutral-900 border border-neutral-800 rounded-lg text-neutral-100 focus:border-brand-600 focus:ring-1 focus:ring-brand-600 transition-colors"
        >
          <option value="">Select an option</option>
          {question.options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      )}

      {/* Multi-select as checkboxes */}
      {question.fieldType === 'multi-select' && question.options && (
        <div className="space-y-2">
          {question.options.map((option) => (
            <label
              key={option}
              className="flex items-center gap-3 p-3 rounded-lg border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-colors"
            >
              <input
                type="checkbox"
                value={option}
                {...register(fieldName)}
                className="w-4 h-4 text-brand-600 bg-neutral-900 border-neutral-700 rounded focus:ring-brand-600 focus:ring-2"
              />
              <span className="text-sm text-neutral-100">{option}</span>
            </label>
          ))}
        </div>
      )}

      {/* Scale (1-5 or 1-10) */}
      {question.fieldType === 'scale' && (
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((value) => (
            <label
              key={value}
              className="flex items-center justify-center w-10 h-10 rounded-lg border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-colors"
            >
              <input
                type="radio"
                value={value}
                {...register(fieldName)}
                className="sr-only"
              />
              <span className="text-sm text-neutral-100 peer-checked:text-brand-500">{value}</span>
            </label>
          ))}
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
      )}
    </div>
  )
}
