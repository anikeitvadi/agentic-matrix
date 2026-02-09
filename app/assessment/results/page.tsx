import { platforms } from '@/.velite'
import { ResultsContent } from './components/ResultsContent'

export const metadata = {
  title: 'Your Recommendations | Agentic',
  description: 'Personalized platform recommendations based on your assessment',
}

/**
 * Results page - displays platform recommendations after assessment completion.
 *
 * Server component wrapper provides metadata and passes platform data to client.
 * Client component handles localStorage access and scoring logic.
 */
export default function ResultsPage() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Your Recommendations</h1>
          <p className="text-lg text-neutral-400">
            Based on your assessment, here are the platforms that best match your needs.
          </p>
        </div>

        {/* Client component handles scoring and display */}
        <ResultsContent platforms={platforms} />
      </div>
    </div>
  )
}
