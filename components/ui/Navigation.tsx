import Link from 'next/link'

export function Navigation() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-neutral-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-xl font-bold text-brand-700 hover:text-brand-800 transition-colors"
            >
              Agentic Decisions
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-8">
            <Link
              href="/platforms"
              className="text-neutral-700 hover:text-brand-700 font-medium transition-colors"
            >
              Platforms
            </Link>
            <Link
              href="/editorial-policy"
              className="text-neutral-700 hover:text-brand-700 font-medium transition-colors"
            >
              Editorial Policy
            </Link>
          </div>
        </div>
      </div>
    </nav>
  )
}
