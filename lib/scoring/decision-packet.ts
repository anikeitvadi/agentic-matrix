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
    '# Agentic Matrix Recommendation Packet',
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

  const winner = scores[0]
  const winnerRisk = winner?.implementationRisk?.label ?? 'N/A'
  const winnerConfidence = winner?.confidence?.label ?? 'N/A'
  const winnerThesis = winner?.recommendationSummary?.decisionThesis ?? ''
  const winnerAnnualCost = winner?.recommendationSummary?.estimatedAnnualCost
  const winnerCostLabel = winnerAnnualCost !== null ? escapeHtml(formatCurrency(winnerAnnualCost)) + '/yr' : 'Contact vendor'

  // Build strengths and caveats for winner
  const winnerStrengths = winner?.recommendationSummary?.strengths ?? memo.winner.reasons
  const winnerCaveats = winner?.recommendationSummary?.caveats ?? []

  // Build score bridge
  const adjustments = winner?.decisionAdjustments ?? []
  const adjustmentRows = adjustments.map(a =>
    `<tr><td class="adj-label">${escapeHtml(a.factor)}</td><td class="adj-val">-${a.penalty}</td></tr>`
  ).join('')

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Agentic Matrix — Platform Recommendation</title>
  <link href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Bricolage Grotesque', system-ui, sans-serif; color: #0f172a; background: #fff; }
    main { max-width: 820px; margin: 0 auto; padding: 56px 48px 64px; }

    /* Title block */
    .title-block { margin-bottom: 40px; }
    .title-block h1 { font-size: 32px; font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; }
    .title-block .sub { font-size: 13px; color: #64748b; margin-top: 6px; font-weight: 400; }

    /* Divider */
    hr { border: none; border-top: 1px solid #e2e8f0; margin: 32px 0; }
    hr.thick { border-top: 2.5px solid #0f172a; margin: 8px 0 32px; }

    /* Section label */
    .label { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #94a3b8; margin-bottom: 14px; }

    /* Lead recommendation */
    .lead { margin-bottom: 36px; }
    .lead .platform-name { font-size: 26px; font-weight: 800; letter-spacing: -0.01em; }
    .lead .thesis { font-size: 13px; font-weight: 600; color: #0f766e; margin-top: 2px; text-transform: capitalize; }
    .lead .narrative { font-size: 15px; line-height: 1.75; color: #334155; margin-top: 14px; }

    /* Metrics strip */
    .metrics { display: flex; gap: 0; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; margin: 20px 0; }
    .m { flex: 1; padding: 14px 0; text-align: center; border-right: 1px solid #e2e8f0; }
    .m:last-child { border-right: none; }
    .m .mv { font-size: 22px; font-weight: 800; color: #0f172a; }
    .m .ml { font-size: 10px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8; margin-top: 2px; }

    /* Evidence list */
    .evidence { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 12px; }
    .ev { font-size: 12px; font-weight: 500; padding: 3px 10px; border-radius: 3px; }
    .ev.pos { background: #f0fdf4; color: #166534; border: 1px solid #bbf7d0; }
    .ev.neg { background: #fffbeb; color: #92400e; border: 1px solid #fde68a; }

    /* Two-col layout */
    .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }

    /* Assessment inputs */
    .inputs { font-size: 13px; line-height: 2; color: #475569; }
    .inputs strong { color: #0f172a; font-weight: 600; }

    /* Score bridge */
    .bridge { font-size: 13px; }
    .bridge table { width: 100%; }
    .bridge td { padding: 4px 0; }
    .bridge .adj-label { color: #64748b; }
    .bridge .adj-val { text-align: right; color: #dc2626; font-weight: 600; font-variant-numeric: tabular-nums; }
    .bridge .total td { font-weight: 700; border-top: 1.5px solid #0f172a; padding-top: 8px; }
    .bridge .total .adj-val { color: #0f172a; }

    /* Alternatives */
    .alt { margin-bottom: 18px; }
    .alt .alt-name { font-size: 16px; font-weight: 700; }
    .alt .alt-gap { font-size: 12px; color: #94a3b8; font-weight: 500; margin-left: 8px; }
    .alt .alt-why { font-size: 13px; color: #475569; line-height: 1.65; margin-top: 4px; }
    .alt .alt-edge { font-size: 12px; color: #0f766e; font-weight: 500; margin-top: 4px; }

    /* Scenarios */
    .scenario { margin-bottom: 16px; padding-left: 16px; border-left: 2.5px solid #e2e8f0; }
    .scenario .sc-title { font-size: 14px; font-weight: 700; color: #0f172a; }
    .scenario .sc-body { font-size: 13px; color: #475569; line-height: 1.65; margin-top: 3px; }

    /* Leaderboard */
    table.lb { width: 100%; border-collapse: collapse; font-size: 13px; }
    table.lb th { font-size: 10px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #94a3b8; text-align: left; padding: 8px 0; border-bottom: 1.5px solid #0f172a; }
    table.lb td { padding: 10px 0; border-bottom: 1px solid #f1f5f9; vertical-align: top; }
    table.lb td:nth-child(1) { font-weight: 700; width: 24px; color: #94a3b8; }
    table.lb td:nth-child(3) { font-weight: 700; font-variant-numeric: tabular-nums; }

    /* Footer */
    .footer { margin-top: 48px; padding-top: 14px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; line-height: 1.6; }

    @media print {
      main { padding: 32px 24px; }
      .alt, .scenario, .lead { break-inside: avoid; }
    }
  </style>
</head>
<body>
  <main>
    <div class="title-block">
      <h1>Platform Recommendation</h1>
      <hr class="thick" />
      <div class="sub">Agentic Matrix &middot; ${escapeHtml(dateLabel)} &middot; Deterministic scoring &middot; Vendor-neutral analysis</div>
    </div>

    <div class="lead">
      <div class="label">Current Recommendation</div>
      <div class="platform-name">${escapeHtml(memo.winner.platformName)}</div>
      <div class="thesis">${escapeHtml(winnerThesis.replace(/-/g, ' '))}</div>
      <div class="narrative">${escapeHtml(memo.winner.lead)}</div>
      <div class="narrative" style="margin-top: 8px;">${escapeHtml(memo.winner.rationale)}</div>

      <div class="metrics">
        <div class="m"><div class="mv">${scores[0]?.decisionScore ?? memo.winner.totalScore}</div><div class="ml">Decision Score</div></div>
        <div class="m"><div class="mv">${scores[0]?.fitScore ?? '—'}</div><div class="ml">Fit Score</div></div>
        <div class="m"><div class="mv">${winnerCostLabel}</div><div class="ml">Annual Estimate</div></div>
        <div class="m"><div class="mv">${escapeHtml(winnerRisk)}</div><div class="ml">Impl. Risk</div></div>
        <div class="m"><div class="mv">${escapeHtml(winnerConfidence)}</div><div class="ml">Evidence</div></div>
      </div>

      <div class="evidence">
        ${winnerStrengths.map(s => `<span class="ev pos">${escapeHtml(s)}</span>`).join('')}
        ${winnerCaveats.map(c => `<span class="ev neg">${escapeHtml(c)}</span>`).join('')}
      </div>
    </div>

    <hr />

    <div class="two-col">
      <div>
        <div class="label">Assessment Inputs</div>
        <div class="inputs">
          ${assessmentLines.map(line => {
            const parts = line.replace(/^- /, '').split(': ')
            return `<strong>${escapeHtml(parts[0])}:</strong> ${escapeHtml(parts.slice(1).join(': '))}<br/>`
          }).join('')}
        </div>
      </div>
      <div>
        <div class="label">Score Bridge</div>
        <div class="bridge">
          <table>
            <tr><td>Fit score (SAW)</td><td class="adj-val" style="color: #0f172a;">${scores[0]?.fitScore ?? '—'}</td></tr>
            ${adjustmentRows}
            <tr class="total"><td>Decision score</td><td class="adj-val">${scores[0]?.decisionScore ?? memo.winner.totalScore}</td></tr>
          </table>
        </div>
      </div>
    </div>

    <hr />

    <div class="label">Why Not The Alternatives</div>
    ${memo.alternatives.map(alt => `
      <div class="alt">
        <span class="alt-name">${escapeHtml(alt.platformName)}</span>
        <span class="alt-gap">${alt.scoreGap > 0 ? '-' : ''}${alt.scoreGap} pts vs winner</span>
        <div class="alt-why">${escapeHtml(alt.whyNot)}</div>
        ${alt.strongerAreas.length > 0 ? `<div class="alt-edge">Stronger on: ${escapeHtml(alt.strongerAreas.join(', '))}</div>` : ''}
      </div>
    `).join('')}

    <hr />

    <div class="label">What Would Change This Recommendation</div>
    ${memo.scenarios.map(s => `
      <div class="scenario">
        <div class="sc-title">${escapeHtml(s.title)}</div>
        <div class="sc-body">${escapeHtml(s.detail)}</div>
      </div>
    `).join('')}

    <hr />

    <div class="label">Platform Leaderboard</div>
    <table class="lb">
      <thead><tr><th>#</th><th>Platform</th><th>Score</th><th>Annual Est.</th><th>Assessment</th></tr></thead>
      <tbody>${topScores}</tbody>
    </table>

    <div class="footer">
      Agentic Matrix &middot; No vendor sponsorships, affiliate payments, or compensation of any kind &middot; Scoring is deterministic and auditable &middot; ${escapeHtml(dateLabel)}
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
