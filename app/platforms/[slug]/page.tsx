import { platforms } from "@/.velite"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"

interface PlatformPageProps {
  params: Promise<{
    slug: string
  }>
}

const tierColors = {
  "enterprise-os": "bg-blue-500",
  "ipaas-agent": "bg-green-500",
  "developer-first": "bg-purple-500",
  vertical: "bg-orange-500",
}

const tierLabels = {
  "enterprise-os": "Enterprise OS",
  "ipaas-agent": "iPaaS + Agent",
  "developer-first": "Developer-First",
  vertical: "Vertical",
}

export async function generateStaticParams() {
  return platforms.map((platform) => ({
    slug: platform.slug,
  }))
}

export async function generateMetadata({
  params,
}: PlatformPageProps): Promise<Metadata> {
  const { slug } = await params
  const platform = platforms.find((p) => p.slug === slug)

  if (!platform) {
    return { title: "Platform Not Found" }
  }

  return {
    title: `${platform.title} | Agentic Decisions`,
    description: platform.description,
  }
}

export default async function PlatformPage({ params }: PlatformPageProps) {
  const { slug } = await params
  const platform = platforms.find((p) => p.slug === slug)

  if (!platform) {
    notFound()
  }

  const formattedDate = new Date(platform.lastVerified).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  )

  return (
    <div className="p-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link
          href="/platforms"
          className="text-sm text-neutral-500 hover:text-neutral-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Platforms
        </Link>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className={`w-3 h-3 rounded-full ${tierColors[platform.tier]}`} />
          <span className="text-sm text-neutral-500">{tierLabels[platform.tier]}</span>
        </div>
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
          {platform.title}
        </h1>
        <p className="text-neutral-600">
          {platform.description}
        </p>
        <p className="text-sm text-neutral-400 mt-2">
          Last verified: {formattedDate}
        </p>
      </header>

      <div className="grid gap-6">
        {/* Capabilities */}
        <section className="bg-white rounded-lg border border-neutral-200 p-5">
          <h2 className="text-sm font-medium text-neutral-900 mb-3">Capabilities</h2>
          <div className="flex flex-wrap gap-2">
            {platform.capabilities.map((capability) => (
              <span
                key={capability}
                className="px-3 py-1.5 text-sm bg-neutral-100 text-neutral-700 rounded-md"
              >
                {capability}
              </span>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="bg-white rounded-lg border border-neutral-200 p-5">
          <h2 className="text-sm font-medium text-neutral-900 mb-3">Pricing</h2>
          <p className="font-medium text-neutral-900">{platform.pricing.model}</p>
          <p className="text-sm text-neutral-600 mt-1">{platform.pricing.details}</p>
        </section>

        {/* Links */}
        <section className="flex gap-3">
          <a
            href={platform.officialDocs}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900 text-white text-sm font-medium rounded-lg hover:bg-neutral-800 transition-colors"
          >
            Documentation
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>

          {platform.pricingPage && (
            <a
              href={platform.pricingPage}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-200 text-neutral-700 text-sm font-medium rounded-lg hover:bg-neutral-50 transition-colors"
            >
              Pricing Page
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          )}
        </section>

        {/* Body Content */}
        <section className="bg-white rounded-lg border border-neutral-200 p-5">
          <h2 className="text-sm font-medium text-neutral-900 mb-3">Overview</h2>
          <div
            className="prose prose-sm prose-neutral max-w-none"
            dangerouslySetInnerHTML={{ __html: platform.body }}
          />
        </section>
      </div>
    </div>
  )
}
