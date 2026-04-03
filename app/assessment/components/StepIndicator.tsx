'use client'

interface StepIndicatorProps {
  current: number
  total: number
  stepLabels: string[]
}

export function StepIndicator({ current, total, stepLabels }: StepIndicatorProps) {
  const progress = Math.round(((current - 1) / (total - 1)) * 100)

  return (
    <nav aria-label="Progress" className="mb-8">
      {/* Progress bar */}
      <div className="mb-6 flex items-center justify-between">
        <span className="font-mono text-xs text-neutral-500">
          Step {current} of {total}
        </span>
        <span className="font-mono text-xs text-brand-400">{progress}%</span>
      </div>
      <div className="mb-6 h-1 w-full rounded-full bg-neutral-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step circles */}
      <div
        className="grid items-center"
        style={{ gridTemplateColumns: 'repeat(4, 5rem)', justifyContent: 'space-between' }}
      >
        {stepLabels.map((label, index) => {
          const stepNumber = index + 1
          const isComplete = stepNumber < current
          const isCurrent = stepNumber === current

          return (
            <div key={stepNumber} className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isComplete
                    ? 'border-brand-500 bg-brand-600 text-white shadow-[0_0_12px_rgba(71,180,167,0.2)]'
                    : isCurrent
                    ? 'border-brand-500 bg-neutral-900 text-brand-400 ring-2 ring-brand-500/20'
                    : 'border-neutral-700 bg-neutral-900 text-neutral-600'
                }`}
              >
                {isComplete ? (
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <span className="font-heading text-sm font-bold">{stepNumber}</span>
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  isCurrent ? 'text-brand-400' : isComplete ? 'text-neutral-400' : 'text-neutral-600'
                }`}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </nav>
  )
}
