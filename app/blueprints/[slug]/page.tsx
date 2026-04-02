import { blueprints, platforms } from "@/.velite"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { BlueprintContent } from "./BlueprintContent"

interface BlueprintPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  return blueprints.map((blueprint) => ({
    slug: blueprint.slug,
  }))
}

export async function generateMetadata({
  params,
}: BlueprintPageProps): Promise<Metadata> {
  const { slug } = await params
  const blueprint = blueprints.find((b) => b.slug === slug)

  if (!blueprint) {
    return { title: "Blueprint Not Found" }
  }

  return {
    title: `${blueprint.title} | Agentic Decisions`,
    description: blueprint.description,
  }
}

export default async function BlueprintPage({ params }: BlueprintPageProps) {
  const { slug } = await params
  const blueprint = blueprints.find((b) => b.slug === slug)

  if (!blueprint) {
    notFound()
  }

  const applicablePlatformDetails = platforms.filter((p) =>
    blueprint.applicablePlatforms.includes(p.slug)
  )

  const formattedDate = new Date(blueprint.lastVerified).toLocaleDateString(
    "en-US",
    { year: "numeric", month: "long", day: "numeric" }
  )

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Breadcrumb */}
      <nav className="mb-6">
        <Link
          href="/blueprints"
          className="text-sm text-neutral-500 hover:text-neutral-300 flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Blueprints
        </Link>
      </nav>

      {/* Header */}
      <header className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <span
            className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${
              blueprint.complexity === 'simple'
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/30'
                : blueprint.complexity === 'moderate'
                ? 'bg-amber-950/40 text-amber-400 border border-amber-800/30'
                : 'bg-red-950/40 text-red-400 border border-red-800/30'
            }`}
          >
            {blueprint.complexity}
          </span>
          <span className="text-sm text-neutral-500">
            Verified {formattedDate}
          </span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          {blueprint.title}
        </h1>
        <p className="text-neutral-400 text-lg">{blueprint.description}</p>
      </header>

      {/* Metadata grid */}
      <section className="mb-8 bg-neutral-900/50 border border-neutral-800 rounded-lg p-5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-neutral-500 uppercase font-medium mb-1">Complexity</p>
            <p className={`font-semibold ${
              blueprint.complexity === 'simple' ? 'text-emerald-400'
                : blueprint.complexity === 'moderate' ? 'text-amber-400'
                : 'text-red-400'
            }`}>
              {blueprint.complexity}
            </p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase font-medium mb-1">Foundation</p>
            <p className="font-medium text-neutral-200">{blueprint.estimatedDuration.foundation}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase font-medium mb-1">Build Time</p>
            <p className="font-medium text-neutral-200">{blueprint.estimatedDuration.build}</p>
          </div>
          <div>
            <p className="text-xs text-neutral-500 uppercase font-medium mb-1">Test + Deploy</p>
            <p className="font-medium text-neutral-200">
              {blueprint.estimatedDuration.test} + {blueprint.estimatedDuration.deploy}
            </p>
          </div>
        </div>
      </section>

      {/* Prerequisites */}
      {blueprint.prerequisites.length > 0 && (
        <section className="mb-8 p-4 bg-amber-950/30 border border-amber-800/40 rounded-lg">
          <h2 className="text-sm font-semibold text-amber-300 uppercase tracking-wide mb-2">
            Prerequisites
          </h2>
          <ul className="list-disc list-inside text-sm text-amber-300 space-y-1">
            {blueprint.prerequisites.map((prereq, i) => (
              <li key={i}>{prereq}</li>
            ))}
          </ul>
        </section>
      )}

      {/* Applicable platforms */}
      <section className="mb-8 bg-neutral-900/50 rounded-lg border border-neutral-800 p-5">
        <h2 className="text-sm font-medium text-neutral-200 mb-3">
          Applicable Platforms ({applicablePlatformDetails.length})
        </h2>
        <div className="flex flex-wrap gap-2">
          {applicablePlatformDetails.map((platform) => {
            const isRecommended = blueprint.recommendedPlatforms?.includes(platform.slug)
            return (
              <Link
                key={platform.slug}
                href={`/platforms/${platform.slug}`}
                className={`px-3 py-1.5 text-sm rounded-md border transition-colors ${
                  isRecommended
                    ? 'bg-brand-950/40 border-brand-700/50 text-brand-400 hover:border-brand-500'
                    : 'bg-neutral-800/50 border-neutral-700 text-neutral-300 hover:border-neutral-500'
                }`}
              >
                {platform.title}
                {isRecommended && (
                  <span className="ml-1.5 text-xs font-medium">(recommended)</span>
                )}
              </Link>
            )
          })}
        </div>
      </section>

      {/* MDX Content */}
      <article className="prose prose-invert max-w-none
        prose-headings:font-semibold prose-headings:text-white
        prose-h2:text-xl prose-h2:mt-10 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-neutral-800
        prose-h3:text-lg prose-h3:mt-8 prose-h3:mb-3
        prose-p:text-neutral-300 prose-p:leading-relaxed
        prose-strong:text-white
        prose-ul:my-3 prose-li:text-neutral-300
        prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline
        prose-code:text-sm prose-code:bg-neutral-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-neutral-200 prose-code:before:content-none prose-code:after:content-none
        prose-pre:bg-neutral-950 prose-pre:border prose-pre:border-neutral-800
        prose-blockquote:border-brand-700 prose-blockquote:text-neutral-400
        prose-hr:border-neutral-800
      ">
        <BlueprintContent code={blueprint.body} />
      </article>
    </div>
  )
}
