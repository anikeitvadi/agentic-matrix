'use client'

interface StepIndicatorProps {
  current: number
  total: number
  stepLabels: string[]
}

export function StepIndicator({ current, total, stepLabels }: StepIndicatorProps) {
  return (
    <nav aria-label="Progress" className="mb-8">
      <ol className="flex items-center justify-between">
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1
          const isComplete = stepNumber < current
          const isCurrent = stepNumber === current
          const isIncomplete = stepNumber > current

          return (
            <li key={stepNumber} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                {/* Step number and label */}
                <div className="flex items-center">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      isComplete
                        ? 'bg-brand-600 border-brand-600 text-white'
                        : isCurrent
                        ? 'border-brand-600 text-brand-600 bg-neutral-900'
                        : 'border-neutral-700 text-neutral-600 bg-neutral-900'
                    }`}
                  >
                    {isComplete ? (
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    ) : (
                      <span className="text-sm font-medium">{stepNumber}</span>
                    )}
                  </div>
                </div>
                {/* Label */}
                <span
                  className={`mt-2 text-xs font-medium ${
                    isCurrent ? 'text-brand-600' : isComplete ? 'text-neutral-400' : 'text-neutral-600'
                  }`}
                >
                  {label}
                </span>
              </div>

              {/* Connector line */}
              {stepNumber < total && (
                <div className="flex-1 h-px mx-2 -mt-6">
                  <div
                    className={`h-full transition-colors ${
                      isComplete ? 'bg-brand-600' : 'bg-neutral-700'
                    }`}
                  />
                </div>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
