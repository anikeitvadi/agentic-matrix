export function SectionDivider({
  label,
  className = '',
}: {
  label?: string
  className?: string
}) {
  return (
    <div className={`relative flex items-center gap-4 py-2 ${className}`}>
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-700/40 to-transparent" />
      {label && (
        <span className="paper-eyebrow shrink-0 text-neutral-500">
          {label}
        </span>
      )}
      <div className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-700/40 to-transparent" />
    </div>
  )
}
