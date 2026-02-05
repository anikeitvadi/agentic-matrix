import { policies } from '@/.velite'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

export const metadata: Metadata = {
  title: 'Editorial Independence Policy | Agentic Decisions',
  description: 'Our commitment to vendor-neutral AI agent platform guidance. Learn how we evaluate platforms, what we don\'t do, and how we handle conflicts of interest.',
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
    <main className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-3xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">
            {policy.title}
          </h1>
          <p className="text-sm text-neutral-500">
            Last updated: {formattedDate}
          </p>
        </header>

        <div className="prose prose-neutral prose-lg max-w-none
          prose-headings:font-bold prose-headings:text-neutral-900
          prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4
          prose-p:text-neutral-700 prose-p:leading-relaxed
          prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline
          prose-strong:text-neutral-900 prose-strong:font-semibold
          prose-ul:my-4 prose-li:text-neutral-700">
          {policy.body}
        </div>
      </article>
    </main>
  )
}
