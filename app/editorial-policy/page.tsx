import { policies } from '@/.velite'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Editorial Policy | Agentic Decisions',
  description: 'Our commitment to vendor-neutral AI agent platform guidance.',
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
    <div className="p-8 max-w-3xl">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold text-neutral-900 mb-2">
          {policy.title}
        </h1>
        <p className="text-sm text-neutral-500">
          Last updated: {formattedDate}
        </p>
      </header>

      <div className="bg-white rounded-lg border border-neutral-200 p-6">
        <div
          className="prose prose-neutral max-w-none
            prose-headings:font-semibold prose-headings:text-neutral-900
            prose-h2:text-lg prose-h2:mt-6 prose-h2:mb-3
            prose-p:text-neutral-700 prose-p:leading-relaxed
            prose-strong:text-neutral-900
            prose-ul:my-3 prose-li:text-neutral-700"
          dangerouslySetInnerHTML={{ __html: policy.body }}
        />
      </div>
    </div>
  )
}
