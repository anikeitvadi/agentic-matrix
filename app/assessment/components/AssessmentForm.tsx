'use client'

import { useState, useEffect } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import useFormPersist from 'react-hook-form-persist'
import { StepIndicator } from './StepIndicator'
import { AIFollowUp } from './AIFollowUp'
import { steps, stepLabels, validateStep } from '../steps'
import type { AssessmentData } from '../schemas/assessment-schema'
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
  // Use lazy initialization to avoid hydration mismatch
  const [currentStep, setCurrentStep] = useState(() => 1)
  const [formData, setFormData] = useState<Partial<AssessmentData>>({})
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
  } = useForm<any>({
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
        setError(err.path, { message: err.message })
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
        setError(err.path, { message: err.message })
      })
      return
    }

    // Combine all step data for final submission
    const completeData = {
      ...formData,
      [`step${currentStep}`]: currentValues,
    }

    // Clear saved progress after successful submission
    clearProgress()

    // Placeholder for Phase 3 - will handle final submission
    console.log('Assessment submitted:', completeData)
  }

  const CurrentStepComponent = steps[currentStep - 1]

  return (
    <div className="max-w-3xl mx-auto">
      <StepIndicator current={currentStep} total={TOTAL_STEPS} stepLabels={stepLabels} />

      {/* Resume notice */}
      {showResumeNotice && (
        <div className="mb-6 p-4 bg-brand-900/20 border border-brand-700 rounded-lg text-brand-200">
          <p className="text-sm">
            <strong>Progress restored:</strong> We found your saved assessment and resumed from where you left off.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Render current step component */}
        <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
          <CurrentStepComponent
            register={register}
            errors={errors}
            control={control}
            assessmentContext={assessmentContext}
          />
        </div>

        {/* AI-powered follow-up questions (appears after Step 2) */}
        {currentStep >= 2 && (
          <AIFollowUp
            context={{
              ...watchedValues,
              currentStep,
            }}
            register={register}
            errors={errors}
            control={control}
          />
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              currentStep === 1
                ? 'bg-neutral-800 text-neutral-600 cursor-not-allowed'
                : 'bg-neutral-800 text-white hover:bg-neutral-700'
            }`}
          >
            Back
          </button>

          {currentStep < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2 rounded-lg font-medium bg-brand-600 text-white hover:bg-brand-700 transition-colors"
            >
              Next
            </button>
          ) : (
            <button
              type="button"
              onClick={handleFinalSubmit}
              className="px-6 py-2 rounded-lg font-medium bg-brand-600 text-white hover:bg-brand-700 transition-colors"
            >
              Submit Assessment
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
