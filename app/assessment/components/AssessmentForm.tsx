'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, useWatch } from 'react-hook-form'
import useFormPersist from 'react-hook-form-persist'
import { StepIndicator } from './StepIndicator'
import { steps, stepLabels, validateStep } from '../steps'
import type { AssessmentData, AssessmentFormValues } from '../schemas/assessment-schema'
import type { AssessmentContext } from '@/lib/assessment/conditional-logic'
import {
  saveCurrentStep,
  loadCurrentStep,
  clearProgress,
  hasSavedProgress,
  getFormStorageKey,
} from '@/lib/assessment/progress-storage'

const TOTAL_STEPS = 4

export function AssessmentForm() {
  const router = useRouter()

  // Use lazy initialization to avoid hydration mismatch
  const [currentStep, setCurrentStep] = useState(() => 1)
  const [formData, setFormData] = useState<Partial<AssessmentFormValues>>({})
  const [showResumeNotice, setShowResumeNotice] = useState(false)

  const {
    register,
    control,
    formState: { errors },
    getValues,
    setError,
    clearErrors,
    watch,
    setValue,
  } = useForm<AssessmentFormValues>({
    mode: 'onBlur',
    defaultValues: formData,
  })

  // Persist form data to localStorage
  useFormPersist(getFormStorageKey(), {
    watch,
    setValue,
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  })

  // Watch form values for conditional logic (React 19 compatible)
  const watchedValues = useWatch({ control })

  // Create assessment context for conditional field rendering
  const assessmentContext: AssessmentContext = {
    useCase: watchedValues?.useCase,
    hasExistingPlatform: watchedValues?.hasExistingPlatform,
    complianceRequirements: watchedValues?.complianceRequirements,
  }

  // Restore current step on mount (client-side only)
  useEffect(() => {
    if (hasSavedProgress()) {
      const savedStep = loadCurrentStep()
      setCurrentStep(savedStep)
      setShowResumeNotice(true)

      // Auto-hide notice after 5 seconds
      const timer = setTimeout(() => setShowResumeNotice(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleNext = () => {
    const currentValues = getValues()

    // Validate current step
    const validation = validateStep(currentStep, currentValues)

    if (!validation.success) {
      // Set form errors from Zod validation
      clearErrors()
      validation.errors.forEach((err) => {
        setError(err.path as keyof AssessmentFormValues, { message: err.message })
      })
      return
    }

    // Save current step data
    const stepKey = `step${currentStep}`
    setFormData((prev) => ({ ...prev, [stepKey]: currentValues }))

    // Move to next step
    if (currentStep < TOTAL_STEPS) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      saveCurrentStep(nextStep)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      // Save current values before going back
      const currentValues = getValues()
      const stepKey = `step${currentStep}`
      setFormData((prev) => ({ ...prev, [stepKey]: currentValues }))

      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      saveCurrentStep(prevStep)
    }
  }

  const handleFinalSubmit = () => {
    const currentValues = getValues()

    // Validate final step
    const validation = validateStep(currentStep, currentValues)

    if (!validation.success) {
      clearErrors()
      validation.errors.forEach((err) => {
        setError(err.path as keyof AssessmentFormValues, { message: err.message })
      })
      return
    }

    // Clear step progress tracking (NOT form data - results page needs it)
    clearProgress()

    // Navigate to results page - form data is preserved in localStorage
    // by useFormPersist and will be read by the results page
    router.push('/assessment/results')
  }

  const CurrentStepComponent = steps[currentStep - 1]

  return (
    <div className="mx-auto max-w-3xl">
      <StepIndicator current={currentStep} total={TOTAL_STEPS} stepLabels={stepLabels} />

      {/* Resume notice */}
      {showResumeNotice && (
        <div className="mb-6 rounded-xl border border-brand-700/30 bg-brand-950/30 p-4 text-brand-300">
          <p className="text-sm">
            <strong className="font-heading">Progress restored</strong> — We found your saved assessment and resumed from where you left off.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Step content */}
        <div className="rounded-2xl border border-neutral-800/60 bg-neutral-900/50 p-6 sm:p-8">
          <CurrentStepComponent
            register={register}
            errors={errors}
            control={control}
            assessmentContext={assessmentContext}
          />
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-full border border-neutral-700 px-6 py-2.5 text-sm font-semibold text-neutral-300 transition-all hover:border-neutral-500 hover:text-white cursor-pointer"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {currentStep < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-full bg-brand-500 px-7 py-2.5 text-sm font-semibold text-white shadow-lg shadow-brand-900/40 transition-all hover:-translate-y-0.5 hover:bg-brand-400 cursor-pointer"
            >
              Continue
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="rounded-full bg-brand-500 px-8 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-900/40 transition-all hover:-translate-y-0.5 hover:bg-brand-400 cursor-pointer"
            >
              Get Recommendations
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
