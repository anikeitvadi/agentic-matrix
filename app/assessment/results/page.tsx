import { platforms } from '@/.velite'
import { ResultsContent } from './components/ResultsContent'

export const metadata = {
  title: 'Your Recommendations | Agentic Matrix',
  description: 'Personalized platform recommendations based on your assessment',
}

export default function ResultsPage() {
  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-7xl">
        <ResultsContent platforms={platforms} />
      </div>
    </div>
  )
}
