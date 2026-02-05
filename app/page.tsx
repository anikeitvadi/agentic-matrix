import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-brand-50 to-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl sm:text-6xl font-bold text-neutral-900 mb-6">
            Find the Right AI Agent Platform
          </h1>
          <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
            Vendor-neutral guidance for enterprise IT leaders
          </p>
          <Link
            href="/platforms"
            className="inline-block bg-brand-600 text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-brand-700 transition-colors shadow-lg hover:shadow-xl"
          >
            Browse Platforms
          </Link>
        </div>
      </section>

      {/* Value Props Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Value Prop 1 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                Unbiased Analysis
              </h3>
              <p className="text-neutral-600">
                No vendor sponsorships or affiliate relationships. Our only incentive is giving you accurate guidance.
              </p>
            </div>

            {/* Value Prop 2 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                Enterprise Focus
              </h3>
              <p className="text-neutral-600">
                Built for IT decision makers who need production-ready platforms, not experimental tools.
              </p>
            </div>

            {/* Value Prop 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mb-2">
                Practical Guidance
              </h3>
              <p className="text-neutral-600">
                From integration practitioners who understand the gap between vendor marketing and production reality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 bg-neutral-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-neutral-900 mb-4">
            Trust Through Transparency
          </h2>
          <p className="text-neutral-700 mb-6">
            We're committed to vendor neutrality. Read our full editorial independence policy to understand how we maintain unbiased analysis.
          </p>
          <Link
            href="/editorial-policy"
            className="inline-block text-brand-600 font-semibold hover:text-brand-700 transition-colors"
          >
            Read Our Editorial Policy →
          </Link>
        </div>
      </section>
    </div>
  )
}
