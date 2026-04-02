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
    const printWindow = window.open('', '_blank', 'noopener,noreferrer')
    if (!printWindow) {
      setStatus('Pop-up blocked. Allow pop-ups to print the decision packet.')
      return
    }

    const html = buildDecisionPacketHtml({
      assessment,
      scores,
    })

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()

    window.setTimeout(() => {
      printWindow.print()
    }, 250)

    setStatus('Opened printable packet in a new window.')
  }

  return (
    <section className="rounded-2xl border border-neutral-800/60 bg-neutral-900/30 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold text-white">Export Decision Packet</h2>
          <p className="mt-2 text-sm leading-6 text-neutral-400">
            Turn this recommendation into a shareable artifact with the assessment snapshot,
            current recommendation, runner-up analysis, and decision-change scenarios.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
          >
            Copy Markdown
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-lg border border-neutral-700 px-4 py-2 text-sm font-medium text-neutral-300 transition-colors hover:border-neutral-500 hover:text-white"
          >
            Download Memo
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-brand-500"
          >
            Print / Save PDF
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 px-4 py-4 text-sm text-neutral-300">
          Includes a clean assessment snapshot for stakeholder context.
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 px-4 py-4 text-sm text-neutral-300">
          Captures why the top recommendation won and why runner-ups lost.
        </div>
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/80 px-4 py-4 text-sm text-neutral-300">
          Makes the recommendation portable for recruiters, executives, or procurement review.
        </div>
      </div>

      {status && (
        <p className={`mt-4 text-sm ${
          /copied|downloaded/i.test(status)
            ? 'text-emerald-400'
            : /unable|blocked/i.test(status)
            ? 'text-red-400'
            : 'text-neutral-500'
        }`}>{status}</p>
      )}
    </section>
  )
}
