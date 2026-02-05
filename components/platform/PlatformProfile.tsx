import type { Platform } from "@/.velite"

interface PlatformProfileProps {
  platform: Platform
}

const tierStyles = {
  "enterprise-os": "bg-brand-100 text-brand-800 border-brand-300",
  "ipaas-agent": "bg-green-100 text-green-800 border-green-300",
  "developer-first": "bg-purple-100 text-purple-800 border-purple-300",
  vertical: "bg-orange-100 text-orange-800 border-orange-300",
}

const tierLabels = {
  "enterprise-os": "Enterprise OS",
  "ipaas-agent": "iPaaS + Agent",
  "developer-first": "Developer-First",
  vertical: "Vertical",
}

export function PlatformProfile({ platform }: PlatformProfileProps) {
  const formattedDate = new Date(platform.lastVerified).toLocaleDateString(
    "en-US",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    },
  )

  return (
    <article className="max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-start gap-4 mb-4">
          <h1 className="text-4xl font-bold text-neutral-900 flex-1">
            {platform.title}
          </h1>
          <span
            className={`px-4 py-2 text-sm font-medium rounded-full border ${tierStyles[platform.tier]}`}
          >
            {tierLabels[platform.tier]}
          </span>
        </div>

        <p className="text-xl text-neutral-600 leading-relaxed mb-3">
          {platform.description}
        </p>

        <p className="text-sm text-neutral-500">
          Last verified: <time dateTime={platform.lastVerified}>{formattedDate}</time>
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-3">
            Key Capabilities
          </h2>
          <ul className="space-y-2">
            {platform.capabilities.map((capability) => (
              <li
                key={capability}
                className="flex items-start gap-2 text-neutral-700"
              >
                <svg
                  className="w-5 h-5 text-brand-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="text-sm">{capability}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-neutral-900 mb-3">
            Pricing
          </h2>
          <div className="bg-neutral-50 rounded-lg border border-neutral-200 p-4">
            <p className="font-medium text-neutral-900 mb-2">
              {platform.pricing.model}
            </p>
            <p className="text-sm text-neutral-600">
              {platform.pricing.details}
            </p>
          </div>

          <div className="mt-4 flex gap-3">
            <a
              href={platform.officialDocs}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors"
            >
              Official Docs
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>

            {platform.pricingPage && (
              <a
                href={platform.pricingPage}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
              >
                Pricing Details
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            )}
          </div>
        </section>
      </div>

      <section className="prose prose-neutral max-w-none">
        <h2 className="text-2xl font-semibold text-neutral-900 mb-4">
          Platform Overview
        </h2>
        <div
          className="text-neutral-700 leading-relaxed"
          dangerouslySetInnerHTML={{ __html: platform.body }}
        />
      </section>
    </article>
  )
}
