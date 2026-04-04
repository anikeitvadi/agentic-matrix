import { buildDecisionMemo } from './decision-memo'
import type { PlatformScore } from './types'

interface DecisionPacketInput {
  assessment: Record<string, unknown> | null
  scores: PlatformScore[]
  generatedAt?: Date
}

export function buildDecisionPacketMarkdown({
  assessment,
  scores,
  generatedAt = new Date(),
}: DecisionPacketInput): string {
  const memo = buildDecisionMemo(scores)
  if (!memo) {
    return '# Recommendation Packet\n\nNo recommendation data available.'
  }

  const dateLabel = formatLongDate(generatedAt)
  const assessmentLines = formatAssessmentSummary(assessment)
  const alternatives = memo.alternatives
    .map((alternative, index) => {
      const strongerAreas =
        alternative.strongerAreas.length > 0
          ? ` Stronger on: ${alternative.strongerAreas.join(', ')}.`
          : ''
      return `${index + 1}. **${alternative.platformName}** (${alternative.totalScore}/100, -${alternative.scoreGap} pts): ${alternative.whyNot}${strongerAreas}`
    })
    .join('\n')

  const scenarios = memo.scenarios
    .map((scenario) => `- **${scenario.title}:** ${scenario.detail}`)
    .join('\n')

  const leaderboard = scores
    .slice(0, 5)
    .map((score, index) => {
      const annualCost = score.recommendationSummary.estimatedAnnualCost
      const costLabel = annualCost !== null ? formatCurrency(annualCost) : 'N/A'
      return `${index + 1}. ${score.platformName} (${score.totalScore}/100, ${costLabel}/yr) - ${score.recommendationSummary.headline}`
    })
    .join('\n')

  return [
    '# Agentic Decisions Recommendation Packet',
    '',
    `Generated: ${dateLabel}`,
    '',
    '## Assessment Snapshot',
    ...assessmentLines,
    '',
    '## Current Recommendation',
    `**${memo.winner.platformName}** (${memo.winner.totalScore}/100, ${memo.winner.confidenceLabel})`,
    '',
    memo.winner.lead,
    '',
    memo.winner.rationale,
    '',
    '### Why It Won',
    ...memo.winner.reasons.map((reason) => `- ${reason}`),
    '',
    '### Why Not The Next Best Options',
    alternatives || '- No runner-up platforms available.',
    '',
    '### What Would Change The Recommendation',
    scenarios,
    '',
    '## Top Ranked Platforms',
    leaderboard,
  ].join('\n')
}

export function buildDecisionPacketHtml({
  assessment,
  scores,
  generatedAt = new Date(),
}: DecisionPacketInput): string {
  const memo = buildDecisionMemo(scores)
  if (!memo) {
    return '<!doctype html><html><body><p>No recommendation data available.</p></body></html>'
  }

  const dateLabel = formatLongDate(generatedAt)
  const assessmentLines = formatAssessmentSummary(assessment)
  const topScores = scores
    .slice(0, 5)
    .map((score, index) => {
      const annualCost = score.recommendationSummary.estimatedAnnualCost
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(score.platformName)}</td>
          <td>${score.decisionScore}/100</td>
          <td>${annualCost !== null ? escapeHtml(formatCurrency(annualCost)) : 'N/A'}</td>
          <td>${escapeHtml(score.recommendationSummary.headline)}</td>
        </tr>
      `
    })
    .join('')

  const alternatives = memo.alternatives
    .map((alternative) => {
      const strongerAreas =
        alternative.strongerAreas.length > 0
          ? `<p class="meta">Stronger on: ${escapeHtml(alternative.strongerAreas.join(', '))}</p>`
          : ''
      return `
        <div class="card">
          <h3>${escapeHtml(alternative.platformName)} <span class="score">-${alternative.scoreGap} pts</span></h3>
          <p>${escapeHtml(alternative.whyNot)}</p>
          ${strongerAreas}
        </div>
      `
    })
    .join('')

  const scenarios = memo.scenarios
    .map(
      (scenario) => `
        <div class="card dark">
          <h3>${escapeHtml(scenario.title)}</h3>
          <p>${escapeHtml(scenario.detail)}</p>
        </div>
      `
    )
    .join('')

  const winner = scores[0]
  const winnerRisk = winner?.implementationRisk?.label ?? 'N/A'
  const winnerConfidence = winner?.confidence?.label ?? 'N/A'
  const winnerThesis = winner?.recommendationSummary?.decisionThesis ?? ''
  const winnerAnnualCost = winner?.recommendationSummary?.estimatedAnnualCost
  const winnerCostLabel = winnerAnnualCost !== null ? escapeHtml(formatCurrency(winnerAnnualCost)) : 'N/A'

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Agentic Matrix — Decision Packet</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: 'Inter', system-ui, sans-serif; color: #1a1a2e; background: #fff; font-size: 14px; line-height: 1.6; }
      main { max-width: 800px; margin: 0 auto; padding: 48px 40px 60px; }

      /* Header */
      .header { border-bottom: 2px solid #0f766e; padding-bottom: 24px; margin-bottom: 32px; }
      .header h1 { font-size: 24px; font-weight: 700; color: #0f172a; }
      .header .date { font-size: 12px; color: #6b7280; margin-top: 4px; }
      .header .summary { font-size: 15px; color: #374151; margin-top: 12px; line-height: 1.7; }

      /* Section */
      .section { margin-top: 28px; }
      .section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #0f766e; margin-bottom: 12px; }

      /* Recommendation card */
      .rec-card { background: #f0fdfa; border: 1px solid #99f6e4; border-radius: 8px; padding: 20px; }
      .rec-card .platform { font-size: 20px; font-weight: 700; color: #0f172a; }
      .rec-card .thesis { font-size: 12px; color: #0f766e; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; margin-top: 2px; }
      .rec-card .rationale { font-size: 14px; color: #374151; margin-top: 10px; line-height: 1.7; }
      .rec-metrics { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-top: 14px; }
      .metric { background: #fff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 12px; }
      .metric .label { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; }
      .metric .value { font-size: 18px; font-weight: 700; color: #0f172a; margin-top: 2px; }

      /* Key strengths / caveats */
      .tags { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 10px; }
      .tag { font-size: 12px; padding: 4px 10px; border-radius: 20px; font-weight: 500; }
      .tag.green { background: #dcfce7; color: #166534; }
      .tag.amber { background: #fef3c7; color: #92400e; }

      /* Assessment table */
      .assess-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 20px; }
      .assess-item { font-size: 13px; padding: 4px 0; }
      .assess-item .label { color: #6b7280; font-weight: 500; }
      .assess-item .val { color: #1a1a2e; }

      /* Alternatives */
      .alt-card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 14px 16px; margin-bottom: 10px; }
      .alt-card .name { font-size: 15px; font-weight: 600; }
      .alt-card .gap { font-size: 12px; color: #6b7280; float: right; }
      .alt-card .reason { font-size: 13px; color: #4b5563; margin-top: 6px; line-height: 1.6; }
      .alt-card .stronger { font-size: 11px; color: #0f766e; margin-top: 6px; font-weight: 500; }

      /* Scenarios */
      .scenario { border-left: 3px solid #e5e7eb; padding: 10px 16px; margin-bottom: 10px; }
      .scenario .title { font-size: 13px; font-weight: 600; color: #0f172a; }
      .scenario .detail { font-size: 13px; color: #4b5563; margin-top: 4px; line-height: 1.6; }

      /* Leaderboard */
      table { width: 100%; border-collapse: collapse; }
      th { font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #6b7280; text-align: left; padding: 8px 0; border-bottom: 2px solid #e5e7eb; }
      td { padding: 10px 0; border-bottom: 1px solid #f3f4f6; font-size: 13px; vertical-align: top; }
      td:nth-child(3) { font-weight: 600; }

      /* Footer */
      .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; font-size: 11px; color: #9ca3af; }

      @media print {
        main { padding: 20px; }
        .rec-card, .alt-card, .scenario { break-inside: avoid; }
      }
    </style>
  </head>
  <body>
    <main>
      <div class="header">
        <h1>Agentic Matrix — Decision Packet</h1>
        <div class="date">${escapeHtml(dateLabel)} &middot; Deterministic scoring &middot; Vendor-neutral</div>
        <div class="summary">${escapeHtml(memo.winner.lead)}</div>
      </div>

      <div class="section">
        <div class="section-title">Recommendation</div>
        <div class="rec-card">
          <div class="thesis">${escapeHtml(winnerThesis.replace(/-/g, ' '))}</div>
          <div class="platform">${escapeHtml(memo.winner.platformName)}</div>
          <div class="rationale">${escapeHtml(memo.winner.rationale)}</div>
          <div class="rec-metrics">
            <div class="metric"><div class="label">Decision Score</div><div class="value">${scores[0]?.decisionScore ?? memo.winner.totalScore}</div></div>
            <div class="metric"><div class="label">Annual Est.</div><div class="value">${winnerCostLabel}</div></div>
            <div class="metric"><div class="label">Risk</div><div class="value">${escapeHtml(winnerRisk)}</div></div>
            <div class="metric"><div class="label">Confidence</div><div class="value">${escapeHtml(winnerConfidence)}</div></div>
          </div>
          <div class="tags">
            ${memo.winner.reasons.map((r) => `<span class="tag green">${escapeHtml(r)}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Assessment Inputs</div>
        <div class="assess-grid">
          ${assessmentLines.map((line) => {
            const parts = line.replace(/^- /, '').split(': ')
            return `<div class="assess-item"><span class="label">${escapeHtml(parts[0])}:</span> <span class="val">${escapeHtml(parts.slice(1).join(': '))}</span></div>`
          }).join('')}
        </div>
      </div>

      <div class="section">
        <div class="section-title">Why Not The Alternatives</div>
        ${memo.alternatives.map((alt) => `
          <div class="alt-card">
            <span class="gap">${alt.scoreGap > 0 ? '-' : ''}${alt.scoreGap} pts</span>
            <div class="name">${escapeHtml(alt.platformName)}</div>
            <div class="reason">${escapeHtml(alt.whyNot)}</div>
            ${alt.strongerAreas.length > 0 ? `<div class="stronger">Stronger on: ${escapeHtml(alt.strongerAreas.join(', '))}</div>` : ''}
          </div>
        `).join('')}
      </div>

      <div class="section">
        <div class="section-title">What Would Change This Recommendation</div>
        ${memo.scenarios.map((s) => `
          <div class="scenario">
            <div class="title">${escapeHtml(s.title)}</div>
            <div class="detail">${escapeHtml(s.detail)}</div>
          </div>
        `).join('')}
      </div>

      <div class="section">
        <div class="section-title">Platform Leaderboard</div>
        <table>
          <thead><tr><th>#</th><th>Platform</th><th>Score</th><th>Annual Est.</th><th>Assessment</th></tr></thead>
          <tbody>${topScores}</tbody>
        </table>
      </div>

      <div class="footer">
        Generated by Agentic Matrix &middot; Deterministic scoring engine &middot; No vendor sponsorships or affiliate relationships &middot; ${escapeHtml(dateLabel)}
      </div>
    </main>
  </body>
</html>`
}

function formatAssessmentSummary(assessment: Record<string, unknown> | null): string[] {
  if (!assessment || Object.keys(assessment).length === 0) {
    return ['- No saved assessment answers found. Recommendation uses the default profile.']
  }

  const lines: string[] = []

  pushAssessmentLine(lines, 'Industry', formatSingleValue(assessment.industry, INDUSTRY_LABELS))
  pushAssessmentLine(
    lines,
    'Organization size',
    formatSingleValue(assessment.organizationSize, ORGANIZATION_SIZE_LABELS)
  )
  pushAssessmentLine(lines, 'Timeline', formatSingleValue(assessment.timeline, TIMELINE_LABELS))
  pushAssessmentLine(
    lines,
    'Budget range',
    formatSingleValue(assessment.budgetRange, BUDGET_LABELS)
  )
  pushAssessmentLine(
    lines,
    'Team profile',
    formatSingleValue(assessment.teamTechnicalLevel, TEAM_LEVEL_LABELS)
  )
  pushAssessmentLine(
    lines,
    'Monthly usage',
    formatSingleValue(
      assessment.expectedMonthlyConversations,
      MONTHLY_USAGE_LABELS
    )
  )
  pushAssessmentLine(
    lines,
    'Primary use cases',
    formatArrayValue(assessment.primaryUseCases, USE_CASE_LABELS)
  )
  pushAssessmentLine(
    lines,
    'Current stack',
    formatArrayValue(assessment.currentStack, STACK_LABELS)
  )
  pushAssessmentLine(
    lines,
    'Compliance requirements',
    formatArrayValue(assessment.complianceRequirements, COMPLIANCE_LABELS)
  )
  pushAssessmentLine(
    lines,
    'Decision makers',
    formatArrayValue(assessment.decisionMakers, DECISION_MAKER_LABELS)
  )

  return lines.length > 0
    ? lines
    : ['- Assessment data was present, but no exportable summary fields were populated.']
}

function pushAssessmentLine(lines: string[], label: string, value: string | null): void {
  if (!value) {
    return
  }

  lines.push(`- ${label}: ${value}`)
}

function formatSingleValue(
  value: unknown,
  labels: Record<string, string>
): string | null {
  if (typeof value !== 'string' || value.length === 0) {
    return null
  }

  return labels[value] ?? humanizeToken(value)
}

function formatArrayValue(
  value: unknown,
  labels: Record<string, string>
): string | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null
  }

  const items = value
    .filter((item): item is string => typeof item === 'string' && item !== 'none')
    .map((item) => labels[item] ?? humanizeToken(item))

  return items.length > 0 ? items.join(', ') : null
}

function humanizeToken(value: string): string {
  return value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatLongDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

const USE_CASE_LABELS: Record<string, string> = {
  'vendor-selection': 'Vendor selection',
  'implementation-planning': 'Implementation planning',
  'platform-evaluation': 'Platform evaluation',
  'cost-analysis': 'Cost analysis',
  'customer-support': 'Customer support',
  'data-extraction': 'Data extraction',
  'workflow-automation': 'Workflow automation',
  'knowledge-qa': 'Knowledge Q&A',
  'sales-routing': 'Sales routing',
  'it-ticketing': 'IT ticketing',
}

const ORGANIZATION_SIZE_LABELS: Record<string, string> = {
  '1-50': '1-50 employees',
  '51-200': '51-200 employees',
  '201-1000': '201-1,000 employees',
  '1000+': '1,000+ employees',
}

const TIMELINE_LABELS: Record<string, string> = {
  asap: 'ASAP',
  '1-3-months': '1-3 months',
  '3-6-months': '3-6 months',
  '6-12-months': '6-12 months',
  exploring: 'Exploring',
}

const BUDGET_LABELS: Record<string, string> = {
  'under-500': 'Under $500/month',
  'under-1000': 'Under $1,000/month',
  'under-2000': 'Under $2,000/month',
  'under-5000': 'Under $5,000/month',
  'under-10000': 'Under $10,000/month',
  'under-10k': 'Under $10k annually',
  '10k-50k': '$10k-$50k annually',
  '50k-200k': '$50k-$200k annually',
  '200k-plus': '$200k+ annually',
  unknown: 'Not yet defined',
  unlimited: 'Unlimited',
}

const TEAM_LEVEL_LABELS: Record<string, string> = {
  'non-technical': 'Non-technical team',
  'some-technical': 'Some technical capability',
  'engineering-team': 'Engineering team available',
  'ai-ml-expertise': 'AI/ML expertise in-house',
}

const MONTHLY_USAGE_LABELS: Record<string, string> = {
  'under-1k': 'Under 1,000 conversations',
  '1k-10k': '1,000-10,000 conversations',
  '10k-100k': '10,000-100,000 conversations',
  '100k-plus': '100,000+ conversations',
}

const STACK_LABELS: Record<string, string> = {
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'GCP',
  'on-premise': 'On-premise',
  hybrid: 'Hybrid',
}

const COMPLIANCE_LABELS: Record<string, string> = {
  hipaa: 'HIPAA',
  soc2: 'SOC 2',
  gdpr: 'GDPR',
  fedramp: 'FedRAMP',
}

const INDUSTRY_LABELS: Record<string, string> = {
  healthcare: 'Healthcare',
  'financial-services': 'Financial Services',
  government: 'Government / Public Sector',
  technology: 'Technology',
  'retail-ecommerce': 'Retail / E-commerce',
  manufacturing: 'Manufacturing',
  education: 'Education',
  other: 'Other',
}

const DECISION_MAKER_LABELS: Record<string, string> = {
  'it-leader': 'IT leader',
  'business-leader': 'Business leader',
  executive: 'Executive sponsor',
  'technical-team': 'Technical team',
}
