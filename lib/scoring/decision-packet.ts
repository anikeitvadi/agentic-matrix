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
          <td>${score.totalScore}/100</td>
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

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Recommendation Packet</title>
    <style>
      body {
        font-family: Georgia, "Times New Roman", serif;
        margin: 0;
        color: #111827;
        background: #ffffff;
      }
      main {
        max-width: 880px;
        margin: 0 auto;
        padding: 48px 32px 64px;
      }
      h1, h2, h3 {
        margin: 0;
        line-height: 1.2;
      }
      h1 {
        font-size: 34px;
      }
      h2 {
        font-size: 14px;
        letter-spacing: 0.18em;
        text-transform: uppercase;
        color: #4b5563;
        margin-bottom: 16px;
      }
      h3 {
        font-size: 20px;
        margin-bottom: 10px;
      }
      p, li, td, th {
        font-size: 15px;
        line-height: 1.7;
      }
      .lede {
        margin-top: 16px;
        margin-bottom: 8px;
        color: #374151;
      }
      .meta {
        color: #6b7280;
        font-size: 13px;
      }
      .section {
        margin-top: 40px;
      }
      .grid {
        display: grid;
        grid-template-columns: 1.2fr 0.8fr;
        gap: 20px;
      }
      .card {
        border: 1px solid #e5e7eb;
        border-radius: 16px;
        padding: 18px 20px;
        background: #f9fafb;
        margin-bottom: 14px;
      }
      .card.dark {
        background: #111827;
        color: white;
        border-color: #1f2937;
      }
      .score {
        font-size: 14px;
        color: #2563eb;
      }
      ul {
        padding-left: 20px;
        margin: 0;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 12px;
      }
      th, td {
        border-bottom: 1px solid #e5e7eb;
        text-align: left;
        padding: 10px 0;
        vertical-align: top;
      }
      th {
        font-size: 12px;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #6b7280;
      }
      @media print {
        main {
          padding: 24px 20px 32px;
        }
        .card {
          break-inside: avoid;
        }
      }
    </style>
  </head>
  <body>
    <main>
      <header>
        <h1>Agentic Decisions Recommendation Packet</h1>
        <p class="meta">Generated ${escapeHtml(dateLabel)}</p>
        <p class="lede">${escapeHtml(memo.winner.lead)}</p>
      </header>

      <section class="section">
        <h2>Assessment Snapshot</h2>
        <ul>
          ${assessmentLines
            .map((line) => `<li>${escapeHtml(line.replace(/^- /, ''))}</li>`)
            .join('')}
        </ul>
      </section>

      <section class="section grid">
        <div>
          <h2>Current Recommendation</h2>
          <h3>${escapeHtml(memo.winner.platformName)} <span class="score">${memo.winner.totalScore}/100</span></h3>
          <p>${escapeHtml(memo.winner.rationale)}</p>
          <ul>
            ${memo.winner.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join('')}
          </ul>
        </div>
        <div>
          <h2>Confidence</h2>
          <div class="card">
            <h3>${escapeHtml(memo.winner.confidenceLabel)}</h3>
            <p>${escapeHtml(memo.winner.lead)}</p>
          </div>
        </div>
      </section>

      <section class="section">
        <h2>Why Not The Next Best Options</h2>
        ${alternatives || '<p>No runner-up platforms available.</p>'}
      </section>

      <section class="section">
        <h2>What Would Change The Recommendation</h2>
        ${scenarios}
      </section>

      <section class="section">
        <h2>Top Ranked Platforms</h2>
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Platform</th>
              <th>Score</th>
              <th>Annual Cost</th>
              <th>Headline</th>
            </tr>
          </thead>
          <tbody>
            ${topScores}
          </tbody>
        </table>
      </section>
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
