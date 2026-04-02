interface ChecklistItemProps {
  children: React.ReactNode
  subItems?: string[]
}

export function ChecklistItem({ children, subItems }: ChecklistItemProps) {
  return (
    <li className="flex items-start gap-3 py-1.5">
      <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-brand-500 shrink-0" />
      <div className="flex-1 min-w-0">
        <span className="text-sm text-neutral-300">{children}</span>
        {subItems && subItems.length > 0 && (
          <ul className="mt-1.5 ml-2 space-y-1">
            {subItems.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-neutral-400">
                <span className="text-neutral-600 shrink-0">-</span>
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
    <div className="mb-5 last:mb-0">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-neutral-800">
        <h4 className="font-semibold text-neutral-200 text-sm uppercase tracking-wide">
          {title}
        </h4>
        {duration && (
          <span className="text-xs font-medium text-neutral-500 bg-neutral-800 px-2 py-0.5 rounded-full">
            {duration}
          </span>
        )}
      </div>
      <ul className="space-y-1 list-none pl-0">{children}</ul>
    </div>
  )
}

interface ImplementationChecklistProps {
  children: React.ReactNode
}

export function ImplementationChecklist({ children }: ImplementationChecklistProps) {
  return (
    <div className="my-8 rounded-lg border border-neutral-800 overflow-hidden not-prose">
      <div className="bg-neutral-800 px-5 py-3">
        <h3 className="text-sm font-semibold text-white uppercase tracking-wide m-0">
          Implementation Checklist
        </h3>
      </div>
      <div className="p-5 bg-neutral-900/50">
        {children}
      </div>
    </div>
  )
}
