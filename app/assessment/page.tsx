import { AssessmentForm } from './components/AssessmentForm'

export const metadata = {
  title: 'Platform Assessment | Agentic',
  description: 'Get a personalized recommendation for your agentic AI platform needs',
}

export default function AssessmentPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Page header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Platform Assessment</h1>
          <p className="text-lg text-neutral-400">
            Answer a few questions to get an honest, vendor-neutral recommendation for your needs.
          </p>
        </div>

        {/* Assessment form */}
        <AssessmentForm />
      </div>
    </div>
  )
}
