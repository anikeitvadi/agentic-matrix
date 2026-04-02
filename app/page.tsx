import Link from "next/link"
import type { Metadata } from "next"
import { platforms, blueprints } from "@/.velite"
import MatrixHero from "@/components/landing/MatrixHero"

export const metadata: Metadata = {
  title: "Agentic Matrix | AI Agent Platform Comparison",
  description: `Vendor-neutral platform recommendations backed by transparent scoring and real pricing data across ${platforms.length} platforms.`,
}

const tiers = {
  "enterprise-os": platforms.filter((p) => p.tier === "enterprise-os"),
  "ipaas-agent": platforms.filter((p) => p.tier === "ipaas-agent"),
  "developer-first": platforms.filter((p) => p.tier === "developer-first"),
  vertical: platforms.filter((p) => p.tier === "vertical"),
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#06060a] text-neutral-200">
      {/* ── Matrix Hero ── */}
      <section className="relative">
        <MatrixHero />

        {/* CTAs overlaid at bottom of hero */}
        <div className="absolute inset-x-0 bottom-8 z-10 flex flex-col items-center gap-3 px-6 sm:flex-row sm:justify-center">
          <Link
            href="/assessment"
            className="inline-flex items-center justify-center rounded-full bg-brand-500 px-7 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-800/40 transition-all hover:-translate-y-0.5 hover:bg-brand-400 hover:shadow-xl"
          >
            Start assessment
            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
          <Link
            href="/platforms"
            className="inline-flex items-center justify-center rounded-full border border-neutral-700 px-7 py-3 text-sm font-semibold text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
          >
            Browse {platforms.length} platforms
          </Link>
        </div>
      </section>

      {/* ── What this does ── */}
      <section className="relative px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 lg:grid-cols-3">
            {[
              {
                label: "Assess",
                desc: "Capture budget, compliance, stack, team capability, and expected scale in a structured questionnaire.",
              },
              {
                label: "Compare",
                desc: "Get a deterministic ranking with match reports, cost projections, and tradeoff analysis across all platforms.",
              },
              {
                label: "Decide",
                desc: "Export a decision memo, comparison matrix, and cost breakdown for architecture review and procurement.",
              },
            ].map((item, i) => (
              <div
                key={item.label}
                className="group rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 transition-colors hover:border-brand-700/50 hover:bg-neutral-900/80"
              >
                <div className="text-xs font-bold uppercase tracking-[0.25em] text-brand-500">
                  0{i + 1}
                </div>
                <h3 className="mt-3 text-xl font-semibold text-white">
                  {item.label}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform coverage ── */}
      <section className="px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-serif text-3xl text-white sm:text-4xl">
            {platforms.length} platforms. Four tiers.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
            Enterprise OS, iPaaS + Agent, Developer-First, and Vertical —
            structured data with real pricing, not marketing copy.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { key: "enterprise-os", label: "Enterprise OS", color: "text-blue-400", border: "border-blue-900/50", bg: "bg-blue-950/30", hoverBorder: "hover:border-blue-700/50", hoverText: "group-hover:text-blue-400" },
              { key: "ipaas-agent", label: "iPaaS + Agent", color: "text-green-400", border: "border-green-900/50", bg: "bg-green-950/30", hoverBorder: "hover:border-green-700/50", hoverText: "group-hover:text-green-400" },
              { key: "developer-first", label: "Developer-First", color: "text-purple-400", border: "border-purple-900/50", bg: "bg-purple-950/30", hoverBorder: "hover:border-purple-700/50", hoverText: "group-hover:text-purple-400" },
              { key: "vertical", label: "Vertical", color: "text-orange-400", border: "border-orange-900/50", bg: "bg-orange-950/30", hoverBorder: "hover:border-orange-700/50", hoverText: "group-hover:text-orange-400" },
            ].map((tier) => {
              const items = tiers[tier.key as keyof typeof tiers]
              return (
                <div
                  key={tier.key}
                  className={`group rounded-2xl border ${tier.border} ${tier.bg} p-5 transition-all duration-200 ${tier.hoverBorder} cursor-pointer`}
                >
                  <div className={`text-xs font-bold uppercase tracking-[0.2em] ${tier.color}`}>
                    {tier.label}
                  </div>
                  <div className="mt-1 text-2xl font-bold text-white">{items.length}</div>
                  <div className="mt-3 space-y-1">
                    {items.map((p) => (
                      <div key={p.slug} className={`truncate text-sm text-neutral-500 transition-colors ${tier.hoverText}`}>
                        {p.title}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/platforms"
              className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors"
            >
              View full catalog &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ── Sample output ── */}
      <section className="px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-serif text-3xl text-white sm:text-4xl">
            What you get.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
            A recommendation backed by evidence, not vibes.
          </p>

          <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_16rem]">
            {/* Sample recommendation */}
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                Sample recommendation
              </div>
              <div className="mt-4 flex items-baseline gap-3">
                <span className="text-2xl font-bold text-white">
                  {platforms[0]?.title ?? "Top Platform"}
                </span>
                <span className="rounded-full bg-brand-900/50 border border-brand-700/30 px-3 py-0.5 text-xs font-semibold text-brand-400">
                  Best Match
                </span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                Strong governance fit, practical deployment readiness, and
                predictable budget alignment.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {["SOC2 ✓", "Within budget ✓", "Stack aligned ✓"].map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-emerald-800/50 bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-400"
                  >
                    {s}
                  </span>
                ))}
                <span className="rounded-full border border-amber-800/50 bg-amber-950/40 px-3 py-1 text-xs font-medium text-amber-400">
                  Engineering team needed
                </span>
              </div>
            </div>

            {/* Score card */}
            <div className="flex flex-col items-center justify-center rounded-2xl border border-brand-800/30 bg-gradient-to-b from-brand-950/40 to-neutral-950 p-6">
              <div className="text-5xl font-bold text-brand-400">89</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-500">
                Weighted Score
              </div>
              <div className="mt-5 w-full space-y-2.5">
                {[
                  { label: "Compliance", pct: 95 },
                  { label: "Budget", pct: 82 },
                  { label: "Stack", pct: 88 },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-[10px] text-neutral-500">
                      <span>{bar.label}</span>
                      <span className="text-neutral-400">{bar.pct}%</span>
                    </div>
                    <div className="mt-1 h-1 rounded-full bg-neutral-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                        style={{ width: `${bar.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Deliverables grid */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Recommendation memo",
              "Comparison matrix",
              "Annual cost estimate",
              "Decision packet export",
            ].map((item) => (
              <div
                key={item}
                className="rounded-xl border border-neutral-800 bg-neutral-900/40 px-4 py-3 text-sm text-neutral-400"
              >
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blueprints ── */}
      <section className="px-6 py-16 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <h2 className="font-serif text-3xl text-white sm:text-4xl">
            {blueprints.length} implementation blueprints.
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
            Architecture patterns, checklists, and platform-specific
            considerations.
          </p>

          <div className="mt-8 space-y-3">
            {blueprints.map((bp) => (
              <Link
                key={bp.slug}
                href={`/blueprints/${bp.slug}`}
                className="group flex items-center justify-between rounded-xl border border-neutral-800 bg-neutral-900/40 px-5 py-4 transition-colors hover:border-brand-700/50 hover:bg-neutral-900/70"
              >
                <div>
                  <div className="font-medium text-white group-hover:text-brand-400 transition-colors">
                    {bp.title}
                  </div>
                  <div className="mt-1 text-sm text-neutral-500 line-clamp-1">
                    {bp.description}
                  </div>
                </div>
                <div className="ml-4 shrink-0 text-xs text-neutral-600">
                  {bp.estimatedDuration.build}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 pb-20 pt-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-serif text-3xl text-white sm:text-4xl">
            Ready to compare?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-neutral-500">
            3-minute assessment. Ranked recommendation. Exportable decision
            packet.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              href="/assessment"
              className="inline-flex items-center justify-center rounded-full bg-brand-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-brand-800/40 transition-all hover:-translate-y-0.5 hover:bg-brand-400"
            >
              Start assessment
            </Link>
            <Link
              href="/platforms"
              className="inline-flex items-center justify-center rounded-full border border-neutral-700 px-7 py-3.5 text-base font-semibold text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
            >
              Browse platforms
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
