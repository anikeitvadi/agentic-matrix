interface ChecklistItemProps {
  children: React.ReactNode
  subItems?: string[]
}

export function ChecklistItem({ children, subItems }: ChecklistItemProps) {
  return (
    <li className="flex items-start gap-2 py-1">
      <input
        type="checkbox"
        className="mt-1 h-4 w-4 rounded border-neutral-300 text-brand-600 focus:ring-brand-500"
        disabled
      />
      <div className="flex-1">
        <span className="text-neutral-800">{children}</span>
        {subItems && subItems.length > 0 && (
          <ul className="mt-1 ml-4 space-y-1 text-sm text-neutral-600">
            {subItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-neutral-400">-</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </li>
  )
}

interface ChecklistPhaseProps {
  title: string
  duration?: string
  children: React.ReactNode
}

export function ChecklistPhase({ title, duration, children }: ChecklistPhaseProps) {
  return (
    <div className="mb-6">
      <h4 className="font-semibold text-neutral-900 mb-2 flex items-center gap-2">
        {title}
        {duration && (
          <span className="text-sm font-normal text-neutral-500">({duration})</span>
        )}
      </h4>
      <ul className="space-y-2">{children}</ul>
    </div>
  )
}

interface ImplementationChecklistProps {
  children: React.ReactNode
}

export function ImplementationChecklist({ children }: ImplementationChecklistProps) {
  return (
    <div className="my-6 p-4 bg-neutral-50 rounded-lg border border-neutral-200">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">
        Implementation Checklist
      </h3>
      {children}
    </div>
  )
}
