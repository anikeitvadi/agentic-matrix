type AdmonitionType = 'warning' | 'tip' | 'info' | 'danger'

interface AdmonitionProps {
  type: AdmonitionType
  title?: string
  children: React.ReactNode
}

const styles = {
  warning: {
    border: 'border-amber-500/50',
    bg: 'bg-amber-950/20',
    title: 'text-amber-400',
  },
  danger: {
    border: 'border-red-500/50',
    bg: 'bg-red-950/20',
    title: 'text-red-400',
  },
  tip: {
    border: 'border-emerald-500/50',
    bg: 'bg-emerald-950/20',
    title: 'text-emerald-400',
  },
  info: {
    border: 'border-blue-500/50',
    bg: 'bg-blue-950/20',
    title: 'text-blue-400',
  },
}

export function Admonition({ type, title, children }: AdmonitionProps) {
  const style = styles[type]
  const defaultTitles = {
    warning: 'Warning',
    danger: 'Danger',
    tip: 'Tip',
    info: 'Note',
  }

  return (
    <div className={`border-l-4 ${style.border} ${style.bg} p-4 my-4 rounded-r-lg`}>
      <p className={`font-semibold mb-2 ${style.title}`}>
        {title || defaultTitles[type]}
      </p>
      <div className="text-sm text-neutral-300 prose prose-sm prose-invert max-w-none">
        {children}
      </div>
    </div>
  )
}
