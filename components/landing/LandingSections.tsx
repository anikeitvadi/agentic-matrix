'use client'

import Link from 'next/link'
import { ScrollReveal } from '@/components/ui/ScrollReveal'
import { AnimatedCard } from '@/components/ui/AnimatedCard'
import { SectionDivider } from '@/components/ui/SectionDivider'
import { GlowButton } from '@/components/ui/GlowButton'

type TierData = { count: number; names: string[] }

type Props = {
  platformCount: number
  tiers: {
    'enterprise-os': TierData
    'ipaas-agent': TierData
    'developer-first': TierData
    vertical: TierData
  }
  topPlatformTitle: string
  blueprintData: { slug: string; title: string; description: string; buildTime: string }[]
}

const tierMeta = [
  { key: 'enterprise-os', label: 'Enterprise OS', color: 'text-blue-400', border: 'border-blue-800/40', bg: 'bg-blue-950/20', glow: 'hover:shadow-blue-900/20' },
  { key: 'ipaas-agent', label: 'iPaaS + Agent', color: 'text-green-400', border: 'border-green-800/40', bg: 'bg-green-950/20', glow: 'hover:shadow-green-900/20' },
  { key: 'developer-first', label: 'Developer-First', color: 'text-purple-400', border: 'border-purple-800/40', bg: 'bg-purple-950/20', glow: 'hover:shadow-purple-900/20' },
  { key: 'vertical', label: 'Vertical', color: 'text-orange-400', border: 'border-orange-800/40', bg: 'bg-orange-950/20', glow: 'hover:shadow-orange-900/20' },
] as const

const steps = [
  {
    label: 'Assess',
    desc: 'Capture budget, compliance, stack, team capability, and expected scale in a structured questionnaire.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25z" />
      </svg>
    ),
  },
  {
    label: 'Compare',
    desc: 'Get a deterministic ranking with match reports, cost projections, and tradeoff analysis across all platforms.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
  {
    label: 'Decide',
    desc: 'Export a decision memo, comparison matrix, and cost breakdown for architecture review and procurement.',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.745 3.745 0 011.043 3.296A3.745 3.745 0 0121 12z" />
      </svg>
    ),
  },
]

export function LandingSections({ platformCount, tiers, topPlatformTitle, blueprintData }: Props) {
  return (
    <>
      {/* ── How it works ── */}
      <section className="relative px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <SectionDivider label="How it works" className="mb-12" />
          </ScrollReveal>

          <div className="grid gap-6 lg:grid-cols-3">
            {steps.map((item, i) => (
              <ScrollReveal key={item.label} delay={i * 100} direction="up">
                <AnimatedCard className="p-6 h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-900/40 text-brand-400">
                    {item.icon}
                  </div>
                  <div className="mt-4 font-mono text-xs font-bold uppercase tracking-[0.25em] text-brand-500">
                    0{i + 1}
                  </div>
                  <h3 className="mt-2 font-heading text-xl font-bold text-white">
                    {item.label}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-neutral-400">
                    {item.desc}
                  </p>
                </AnimatedCard>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform coverage ── */}
      <section className="relative px-6 py-20 sm:px-8 lg:px-12 surface-grid">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              {platformCount} platforms. Four tiers.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
              Enterprise OS, iPaaS + Agent, Developer-First, and Vertical —
              structured data with real pricing, not marketing copy.
            </p>
          </ScrollReveal>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tierMeta.map((tier, i) => {
              const data = tiers[tier.key]
              return (
                <ScrollReveal key={tier.key} delay={i * 80} direction="up">
                  <div className={`h-full rounded-2xl border ${tier.border} ${tier.bg} p-5 transition-all duration-300 hover:border-neutral-700 ${tier.glow} hover:shadow-lg cursor-pointer`}>
                    <div className={`font-heading text-xs font-bold uppercase tracking-[0.2em] ${tier.color}`}>
                      {tier.label}
                    </div>
                    <div className="mt-1 text-2xl font-bold text-white">{data.count}</div>
                    <div className="mt-3 space-y-1">
                      {data.names.map((name) => (
                        <div key={name} className="truncate text-sm text-neutral-500">
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>
                </ScrollReveal>
              )
            })}
          </div>

          <ScrollReveal delay={400}>
            <div className="mt-8 text-center">
              <Link
                href="/platforms"
                className="font-heading text-sm font-semibold text-brand-400 transition-colors hover:text-brand-300 cursor-pointer"
              >
                View full catalog &rarr;
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ── What you get ── */}
      <section className="px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              What you get.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
              A recommendation backed by evidence, not vibes.
            </p>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="mt-10 grid gap-6 lg:grid-cols-[1fr_16rem]">
              {/* Sample recommendation */}
              <AnimatedCard className="p-6">
                <div className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-neutral-500">
                  Sample recommendation
                </div>
                <div className="mt-4 flex items-baseline gap-3">
                  <span className="font-heading text-2xl font-bold text-white">{topPlatformTitle}</span>
                  <span className="rounded-full bg-brand-900/50 border border-brand-700/30 px-3 py-0.5 text-xs font-semibold text-brand-400">
                    Best Match
                  </span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-neutral-400">
                  Strong governance fit, practical deployment readiness, and predictable budget alignment.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['SOC2', 'Within budget', 'Stack aligned'].map((s) => (
                    <span key={s} className="rounded-full border border-emerald-800/50 bg-emerald-950/40 px-3 py-1 text-xs font-medium text-emerald-400">
                      {s}
                    </span>
                  ))}
                  <span className="rounded-full border border-amber-800/50 bg-amber-950/40 px-3 py-1 text-xs font-medium text-amber-400">
                    Engineering team needed
                  </span>
                </div>
              </AnimatedCard>

              {/* Score card */}
              <AnimatedCard variant="accent" className="flex flex-col items-center justify-center p-6">
                <div className="text-5xl font-bold text-brand-400 neon-text">89</div>
                <div className="mt-1 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-neutral-500">
                  Weighted Score
                </div>
                <div className="mt-5 w-full space-y-2.5">
                  <AnimatedBar label="Compliance" pct={95} />
                  <AnimatedBar label="Budget" pct={82} />
                  <AnimatedBar label="Stack" pct={88} />
                </div>
              </AnimatedCard>
            </div>
          </ScrollReveal>

          {/* Deliverables */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Recommendation memo', icon: '01' },
              { label: 'Comparison matrix', icon: '02' },
              { label: 'Annual cost estimate', icon: '03' },
              { label: 'Decision packet export', icon: '04' },
            ].map((item, i) => (
              <ScrollReveal key={item.label} delay={i * 60}>
                <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/30 px-4 py-3 transition-colors hover:border-brand-800/30">
                  <span className="font-mono text-[10px] text-brand-600 mr-2">{item.icon}</span>
                  <span className="text-sm text-neutral-400">{item.label}</span>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blueprints ── */}
      <section className="px-6 py-20 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <ScrollReveal>
            <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              {blueprintData.length} implementation blueprints.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-500">
              Architecture patterns, checklists, and platform-specific considerations.
            </p>
          </ScrollReveal>

          <div className="mt-8 space-y-3">
            {blueprintData.map((bp, i) => (
              <ScrollReveal key={bp.slug} delay={i * 80}>
                <Link
                  href={`/blueprints/${bp.slug}`}
                  className="group flex items-center justify-between rounded-xl border border-neutral-800/60 bg-neutral-900/30 px-5 py-4 transition-all duration-200 hover:border-brand-700/40 hover:bg-neutral-900/60 cursor-pointer"
                >
                  <div>
                    <div className="font-heading font-semibold text-white transition-colors group-hover:text-brand-400">
                      {bp.title}
                    </div>
                    <div className="mt-1 text-sm text-neutral-500 line-clamp-1">
                      {bp.description}
                    </div>
                  </div>
                  <div className="ml-4 flex items-center gap-2 shrink-0">
                    <span className="font-mono text-xs text-neutral-600">{bp.buildTime}</span>
                    <svg className="w-4 h-4 text-neutral-700 transition-transform group-hover:translate-x-1 group-hover:text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="relative px-6 pb-24 pt-8 sm:px-8 lg:px-12">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-48 w-96 rounded-full bg-brand-500/[0.04] blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-3xl text-center">
          <ScrollReveal>
            <h2 className="font-heading text-3xl font-bold text-white sm:text-4xl">
              Ready to compare?
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-neutral-500">
              3-minute assessment. Ranked recommendation. Exportable decision packet.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
              <GlowButton href="/assessment" size="lg">
                Start assessment
              </GlowButton>
              <GlowButton href="/platforms" variant="secondary" size="lg">
                Browse platforms
              </GlowButton>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  )
}

function AnimatedBar({ label, pct }: { label: string; pct: number }) {
  return (
    <div>
      <div className="flex justify-between font-mono text-[10px] text-neutral-500">
        <span>{label}</span>
        <span className="text-neutral-400">{pct}%</span>
      </div>
      <div className="mt-1 h-1 rounded-full bg-neutral-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400 transition-all duration-1000"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
