'use client'

import { useState } from 'react'
import type { PlatformScore } from '@/lib/scoring/types'
import {
  buildDecisionPacketHtml,
  buildDecisionPacketMarkdown,
} from '@/lib/scoring/decision-packet'

interface DecisionPacketExportProps {
  assessment: Record<string, unknown> | null
  scores: PlatformScore[]
}

export function DecisionPacketExport({
  assessment,
  scores,
}: DecisionPacketExportProps) {
  const [status, setStatus] = useState<string | null>(null)

  if (scores.length === 0) {
    return null
  }

  const handleCopy = async () => {
    try {
      const markdown = buildDecisionPacketMarkdown({
        assessment,
        scores,
      })
      await navigator.clipboard.writeText(markdown)
      setStatus('Decision packet copied to clipboard.')
    } catch (error) {
      console.error('Failed to copy decision packet:', error)
      setStatus('Unable to copy the packet. Try downloading it instead.')
    }
  }

  const handleDownload = () => {
    const markdown = buildDecisionPacketMarkdown({
      assessment,
      scores,
    })
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)

    link.href = url
    link.download = `agentic-recommendation-packet-${date}.md`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    setStatus('Markdown packet downloaded.')
  }

  const handlePrint = () => {
    const html = buildDecisionPacketHtml({
      assessment,
      scores,
    })

    // Open as blob URL in new tab — more reliable than window.open('')
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const tab = window.open(url, '_blank')

    if (tab) {
      // Auto-trigger print after content loads
      tab.addEventListener('load', () => {
        setTimeout(() => tab.print(), 300)
      })
      setStatus('Opened decision packet — use Save as PDF in the print dialog.')
    } else {
      // Fallback: download the file
      const link = document.createElement('a')
      const date = new Date().toISOString().slice(0, 10)
      link.href = url
      link.download = `agentic-matrix-decision-packet-${date}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      setStatus('Downloaded decision packet. Open it and use Cmd+P to save as PDF.')
    }

    // Clean up after a delay
    setTimeout(() => URL.revokeObjectURL(url), 60000)
  }

  return (
    <div className="rounded-xl border border-neutral-800/60 bg-neutral-900/30 p-5">
      <h3 className="font-heading text-base font-bold text-white">Export</h3>
      <p className="mt-1 text-sm text-neutral-500">
        Shareable decision packet with recommendation, runner-up analysis, and scenarios.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white cursor-pointer"
        >
          Copy Markdown
        </button>
        <button
          type="button"
          onClick={handleDownload}
          className="rounded-lg border border-neutral-700 px-3 py-1.5 text-xs font-medium text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white cursor-pointer"
        >
          Download
        </button>
        <button
          type="button"
          onClick={handlePrint}
          className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-brand-500 cursor-pointer"
        >
          Save as PDF
        </button>
      </div>
      {status && (
        <p className={`mt-3 text-xs ${
          /copied|downloaded/i.test(status) ? 'text-emerald-400' :
          /unable|blocked/i.test(status) ? 'text-red-400' : 'text-neutral-500'
        }`}>{status}</p>
      )}
    </div>
  )
}
