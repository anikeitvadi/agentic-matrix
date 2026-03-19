type AdmonitionType = 'warning' | 'tip' | 'info' | 'danger'

interface AdmonitionProps {
  type: AdmonitionType
  title?: string
  children: React.ReactNode
}

const styles = {
  warning: {
    border: 'border-amber-500',
    bg: 'bg-amber-50',
    title: 'text-amber-800',
  },
  danger: {
    border: 'border-red-500',
    bg: 'bg-red-50',
    title: 'text-red-800',
  },
  tip: {
    border: 'border-green-500',
    bg: 'bg-green-50',
    title: 'text-green-800',
  },
  info: {
    border: 'border-blue-500',
    bg: 'bg-blue-50',
    title: 'text-blue-800',
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
      <div className="text-sm text-neutral-700 prose prose-sm max-w-none">
        {children}
      </div>
    </div>
  )
}
