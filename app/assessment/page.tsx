import { AssessmentForm } from './components/AssessmentForm'

export const metadata = {
  title: 'Platform Assessment | Agentic Matrix',
  description: 'Get a personalized, vendor-neutral AI agent platform recommendation',
}

export default function AssessmentPage() {
  return (
    <div className="min-h-screen py-10 px-4 sm:px-6">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-brand-950/20 via-transparent to-transparent" />

      <div className="relative mx-auto max-w-3xl">
        {/* Header */}
        <div className="mb-10 text-center">
          <span className="section-kicker">Assessment</span>
          <h1 className="mt-4 font-heading text-4xl font-bold text-white sm:text-5xl">
            Platform Assessment
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-neutral-400">
            4 questions. 3 minutes. A ranked recommendation backed by structured scoring,
            real pricing, and an auditable methodology.
          </p>
        </div>

        <AssessmentForm />
      </div>
    </div>
  )
}
