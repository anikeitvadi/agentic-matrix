import { platforms } from "@/.velite"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { tierMeta, pricingModelLabels } from "@/lib/platform/utils"
import type { Platform } from "@/.velite"

interface PlatformPageProps {
  params: Promise<{
    slug: string
  }>
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

/* ------------------------------------------------------------------ */
/*  Pricing sub-components                                            */
/* ------------------------------------------------------------------ */

function TokenPricingTable({
  tokenPricing,
}: {
  tokenPricing: NonNullable<Platform["pricing"]["tokenPricing"]>
}) {
  const variants = tokenPricing.modelVariants

  return (
    <div>
      <h3 className="text-sm font-medium text-neutral-300 mb-3">
        Token Pricing
      </h3>
      {variants?.length ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-700 text-left text-neutral-500">
                <th className="pb-2 pr-4 font-medium">Model</th>
                <th className="pb-2 pr-4 font-medium text-right">
                  Input / 1M tokens
                </th>
                <th className="pb-2 font-medium text-right">
                  Output / 1M tokens
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {variants.map((v) => (
                <tr key={v.name}>
                  <td className="py-2 pr-4 text-neutral-300">{v.name}</td>
                  <td className="py-2 pr-4 text-right font-mono text-neutral-400">
                    ${v.inputPrice}
                  </td>
                  <td className="py-2 text-right font-mono text-neutral-400">
                    ${v.outputPrice}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-neutral-800/50 p-3 text-center">
            <p className="text-xs text-neutral-500 mb-1">Input / 1M tokens</p>
            <p className="text-lg font-semibold text-white">
              ${tokenPricing.inputPricePerMillion}
            </p>
          </div>
          <div className="rounded-lg bg-neutral-800/50 p-3 text-center">
            <p className="text-xs text-neutral-500 mb-1">Output / 1M tokens</p>
            <p className="text-lg font-semibold text-white">
              ${tokenPricing.outputPricePerMillion}
            </p>
          </div>
        </div>
      )}

      {tokenPricing.cachedInputDiscount != null && (
        <p className="mt-2 text-xs text-neutral-500">
          Cached input discount: {tokenPricing.cachedInputDiscount}%
        </p>
      )}
    </div>
  )
}

function SubscriptionTiersGrid({
  tiers,
}: {
  tiers: NonNullable<Platform["pricing"]["tiers"]>
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-neutral-300 mb-3">
        Subscription Tiers
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tiers.map((t) => (
          <div
            key={t.name}
            className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-4"
          >
            <p className="font-medium text-white">{t.name}</p>
            <p className="text-2xl font-bold text-white mt-1">
              ${t.monthlyPrice.toLocaleString()}
              <span className="text-sm font-normal text-neutral-500">/mo</span>
            </p>
            {t.includedUnits != null && (
              <p className="text-sm text-neutral-500 mt-1">
                {t.includedUnits.toLocaleString()} {t.unitType ?? "units"}{" "}
                included
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function PerConversationRate({
  rate,
  tiers,
}: {
  rate: number
  tiers?: Platform["pricing"]["tiers"]
}) {
  return (
    <div>
      <h3 className="text-sm font-medium text-neutral-300 mb-3">
        Per-Conversation Pricing
      </h3>
      <div className="rounded-lg bg-neutral-800/50 p-4 inline-block">
        <p className="text-3xl font-bold text-white">
          ${rate}
          <span className="text-base font-normal text-neutral-500">
            {" "}
            / conversation
          </span>
        </p>
      </div>

      {tiers?.length ? (
        <div className="mt-4">
          <p className="text-xs text-neutral-500 mb-2 font-medium uppercase tracking-wide">
            Included conversations by plan
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {tiers.map((t) => (
              <div
                key={t.name}
                className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-3"
              >
                <p className="font-medium text-white text-sm">
                  {t.name}
                </p>
                {t.monthlyPrice > 0 && (
                  <p className="text-lg font-bold text-white mt-0.5">
                    ${t.monthlyPrice.toLocaleString()}
                    <span className="text-xs font-normal text-neutral-500">
                      /mo
                    </span>
                  </p>
                )}
                {t.includedUnits != null && (
                  <p className="text-sm text-neutral-500 mt-0.5">
                    {t.includedUnits.toLocaleString()} conversations included
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Page                                                              */
/* ------------------------------------------------------------------ */

export default async function PlatformPage({ params }: PlatformPageProps) {
  const { slug } = await params
  const platform = platforms.find((p) => p.slug === slug)

  if (!platform) {
    notFound()
  }

  const meta = tierMeta[platform.tier]
  const { pricing } = platform

  const formattedDate = new Date(platform.lastVerified).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  )

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link
          href="/platforms"
          className="text-sm text-neutral-500 hover:text-neutral-300 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Platforms
        </Link>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${meta.badge}`}
          >
            {meta.label}
          </span>
          <span className="text-sm text-neutral-500">
            Verified {formattedDate}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {platform.title}
        </h1>
        <p className="text-neutral-400 text-lg">
          {platform.description}
        </p>
      </header>

      {/* External links */}
      <section className="flex flex-wrap gap-3 mb-6">
        <a
          href={platform.officialDocs}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-800 border border-neutral-700 text-white text-sm font-medium rounded-lg hover:bg-neutral-700 transition-colors"
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
            className="inline-flex items-center gap-2 px-4 py-2 border border-neutral-700 bg-neutral-900/50 text-neutral-300 text-sm font-medium rounded-lg hover:border-neutral-600 hover:text-white transition-colors"
          >
            Pricing Page
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}
      </section>

      <div className="grid gap-6">
        {/* Pricing -- rich section */}
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-white">Pricing</h2>
            <span
              className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${meta.badge}`}
            >
              {pricingModelLabels[pricing.model]}
            </span>
          </div>

          <p className="text-sm text-neutral-400 mb-5">{pricing.details}</p>

          <div className="space-y-6">
            {/* Token pricing table */}
            {pricing.tokenPricing && (
              <TokenPricingTable tokenPricing={pricing.tokenPricing} />
            )}

            {/* Per-conversation rate */}
            {pricing.perConversationRate != null && (
              <PerConversationRate
                rate={pricing.perConversationRate}
                tiers={pricing.tiers}
              />
            )}

            {/* Subscription tiers (only when NOT already shown under per-conversation) */}
            {pricing.tiers?.length &&
              pricing.perConversationRate == null && (
                <SubscriptionTiersGrid tiers={pricing.tiers} />
              )}

            {/* Infrastructure costs note */}
            {pricing.infrastructureCosts && (
              <div className="rounded-lg bg-amber-950/30 border border-amber-800/50 p-3 text-sm text-amber-400">
                <span className="font-medium">Infrastructure note:</span>{" "}
                {pricing.infrastructureCosts}
              </div>
            )}

            {/* Enterprise contact callout */}
            {pricing.enterpriseContact && (
              <div className="rounded-lg bg-neutral-800/50 border border-neutral-700 p-3 text-sm text-neutral-400">
                Enterprise and volume pricing available — contact sales for
                custom agreements.
              </div>
            )}
          </div>
        </section>

        {/* Capabilities */}
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-5">
          <h2 className="text-sm font-medium text-white mb-3">
            Capabilities
          </h2>
          <div className="flex flex-wrap gap-2">
            {platform.capabilities.map((capability) => (
              <span
                key={capability}
                className="px-3 py-1.5 text-sm rounded-md bg-neutral-800 text-neutral-300"
              >
                {capability}
              </span>
            ))}
          </div>
        </section>

        {/* Body Content */}
        <section className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-5">
          <h2 className="text-sm font-medium text-white mb-3">
            Overview
          </h2>
          <div
            className="prose prose-sm prose-invert max-w-none
              prose-headings:font-semibold prose-headings:text-white
              prose-p:text-neutral-400 prose-p:leading-relaxed
              prose-strong:text-neutral-200
              prose-ul:my-2 prose-li:text-neutral-400
              prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline
              prose-code:text-sm prose-code:bg-neutral-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-neutral-300"
            dangerouslySetInnerHTML={{ __html: platform.body }}
          />
        </section>
      </div>

      {/* Assessment CTA */}
      <Link
        href="/assessment"
        className="mt-6 block p-5 border border-brand-700/50 bg-brand-950/30 rounded-lg hover:border-brand-600/50 transition-colors group"
      >
        <p className="text-brand-400 font-medium">
          See how {platform.title} scores for your needs
        </p>
        <p className="text-sm text-brand-500 mt-1 flex items-center gap-1">
          Take the assessment
          <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </p>
      </Link>
    </div>
  )
}
