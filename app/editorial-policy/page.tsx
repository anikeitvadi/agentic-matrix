import { policies } from '@/.velite'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Editorial Policy | Agentic Decisions',
  description: 'Our commitment to vendor-neutral AI agent platform guidance and data accuracy.',
}

export default function EditorialPolicyPage() {
  const policy = policies.find((p) => p.slug === 'editorial-independence')

  if (!policy) {
    notFound()
  }

  const formattedDate = new Date(policy.lastUpdated).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white font-serif mb-2">
          {policy.title}
        </h1>
        <p className="text-sm text-neutral-500">
          Last updated {formattedDate}
        </p>
      </header>

      <div className="rounded-lg border border-neutral-800 bg-neutral-900/50 p-6">
        <div
          className="prose prose-invert max-w-none
            prose-headings:font-semibold prose-headings:text-white
            prose-h2:text-lg prose-h2:mt-8 prose-h2:mb-3
            prose-p:text-neutral-300 prose-p:leading-relaxed
            prose-strong:text-neutral-200
            prose-ul:my-3 prose-li:text-neutral-300
            prose-a:text-brand-400 prose-a:no-underline hover:prose-a:underline
            prose-hr:border-neutral-800"
          dangerouslySetInnerHTML={{ __html: policy.body }}
        />
      </div>
    </div>
  )
}
