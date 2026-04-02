'use client'

interface StepIndicatorProps {
  current: number
  total: number
  stepLabels: string[]
}

export function StepIndicator({ current, total, stepLabels }: StepIndicatorProps) {
  // Build: circle, line, circle, line, circle, line, circle
  // Grid: 4 auto columns for circles, 3 1fr columns for lines
  // Pattern: auto 1fr auto 1fr auto 1fr auto
  return (
    <nav aria-label="Progress" className="mb-8 mx-auto max-w-lg">
      <div
        className="grid items-center"
        style={{ gridTemplateColumns: '5rem 1fr 5rem 1fr 5rem 1fr 5rem' }}
      >
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1
          const isComplete = stepNumber < current
          const isCurrent = stepNumber === current

          return (
            <div key={stepNumber} className="contents">
              {/* Circle + label */}
              <div className="flex flex-col items-center">
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
                <span
                  className={`mt-2 text-xs font-medium whitespace-nowrap ${
                    isCurrent ? 'text-brand-600' : isComplete ? 'text-neutral-400' : 'text-neutral-600'
                  }`}
                >
                  {label}
                </span>
              </div>

              {/* Line (not after last) */}
              {stepNumber < total && (
                <div className={`h-px mx-2 self-start mt-5 ${isComplete ? 'bg-brand-600' : 'bg-neutral-700'}`} />
              )}
            </div>
          )
        })}
      </div>
    </nav>
  )
}
