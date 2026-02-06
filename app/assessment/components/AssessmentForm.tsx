'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { StepIndicator } from './StepIndicator'
import { steps, stepLabels, validateStep } from '../steps'
import type { AssessmentData } from '../schemas/assessment-schema'

const TOTAL_STEPS = 4

export function AssessmentForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState<Partial<AssessmentData>>({})

  const {
    register,
    control,
    formState: { errors },
    getValues,
    setError,
    clearErrors,
  } = useForm<any>({
    mode: 'onBlur',
    defaultValues: formData,
  })

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
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      // Save current values before going back
      const currentValues = getValues()
      const stepKey = `step${currentStep}`
      setFormData((prev) => ({ ...prev, [stepKey]: currentValues }))

      setCurrentStep((prev) => prev - 1)
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
    // Placeholder for Phase 3 - will handle final submission
    console.log('Assessment submitted:', completeData)
  }

  const CurrentStepComponent = steps[currentStep - 1]

  return (
    <div className="max-w-3xl mx-auto">
      <StepIndicator current={currentStep} total={TOTAL_STEPS} stepLabels={stepLabels} />

      <div className="space-y-6">
        {/* Render current step component */}
        <div className="bg-neutral-900 rounded-lg p-6 border border-neutral-800">
          <CurrentStepComponent register={register} errors={errors} control={control} />
        </div>

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
