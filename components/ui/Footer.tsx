import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Column */}
          <div>
            <h3 className="text-white font-bold text-lg mb-2">
              Agentic Decisions
            </h3>
            <p className="text-sm text-neutral-400">
              Vendor-neutral AI agent platform guidance
            </p>
          </div>

          {/* Links Column */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">
              Resources
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/platforms"
                  className="text-sm hover:text-white transition-colors"
                >
                  Platforms
                </Link>
              </li>
              <li>
                <Link
                  href="/editorial-policy"
                  className="text-sm hover:text-white transition-colors"
                >
                  Editorial Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Copyright Column */}
          <div>
            <p className="text-sm text-neutral-400">
              &copy; 2026 Agentic Decisions
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
