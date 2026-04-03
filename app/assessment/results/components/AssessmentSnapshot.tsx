import type { ReactNode } from 'react'

interface AssessmentSnapshotProps {
  assessment: Record<string, unknown> | null
}

const USE_CASE_LABELS: Record<string, string> = {
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
  '201-1000': '201-1000 employees',
  '1000+': '1000+ employees',
}

const TIMELINE_LABELS: Record<string, string> = {
  asap: 'ASAP',
  '1-3-months': '1-3 months',
  '3-6-months': '3-6 months',
  '6-12-months': '6-12 months',
  exploring: 'Exploring',
}

const BUDGET_LABELS: Record<string, string> = {
  'under-10k': '<$10k/year',
  '10k-50k': '$10k-$50k/year',
  '50k-200k': '$50k-$200k/year',
  '200k-plus': '$200k+/year',
  unknown: 'Budget unknown',
}

const TEAM_LEVEL_LABELS: Record<string, string> = {
  'non-technical': 'Non-technical team',
  'some-technical': 'Some technical support',
  'engineering-team': 'Engineering team available',
  'ai-ml-expertise': 'AI/ML expertise in-house',
}

const STACK_LABELS: Record<string, string> = {
  aws: 'AWS',
  azure: 'Azure',
  gcp: 'GCP',
  'on-premise': 'On-premise',
  hybrid: 'Hybrid',
}

const COMPLIANCE_LABELS: Record<string, string> = {
  soc2: 'SOC 2',
  hipaa: 'HIPAA',
  gdpr: 'GDPR',
  fedramp: 'FedRAMP',
  none: 'None',
}

const MONTHLY_USAGE_LABELS: Record<string, string> = {
  'under-1k': '<1k conversations',
  '1k-10k': '1k-10k conversations',
  '10k-100k': '10k-100k conversations',
  '100k-plus': '100k+ conversations',
}

export function AssessmentSnapshot({ assessment }: AssessmentSnapshotProps) {
  const items = buildSnapshotItems(assessment)

  return (
    <section className="surface-card rounded-[1.75rem] p-6 sm:p-7">
      <p className="paper-eyebrow">Assessment snapshot</p>
      <h2 className="mt-3 font-heading text-3xl text-white">What this decision optimized for.</h2>
      <p className="mt-2 text-sm leading-6 text-neutral-400">
        A quick summary of the inputs driving the current recommendation. This keeps the winner
        grounded in the actual operating context, not just an abstract score.
      </p>

      {items.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-neutral-800/60 bg-neutral-900/40 px-4 py-4 text-sm text-neutral-400">
          No saved assessment answers were found. The results are using the default profile.
        </div>
      ) : (
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-neutral-800/60 bg-neutral-900/40 px-4 py-4"
            >
              <div className="paper-eyebrow text-neutral-500">{item.label}</div>
              <div className="mt-2 text-sm leading-6 text-neutral-200">{item.value}</div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

function buildSnapshotItems(
  assessment: Record<string, unknown> | null,
): Array<{ label: string; value: ReactNode }> {
  if (!assessment) return []

  const items = [
    {
      label: 'Organization',
      value: formatSingleValue(assessment.organizationSize, ORGANIZATION_SIZE_LABELS),
    },
    {
      label: 'Timeline',
      value: formatSingleValue(assessment.timeline, TIMELINE_LABELS),
    },
    {
      label: 'Budget',
      value: formatSingleValue(assessment.budgetRange, BUDGET_LABELS),
    },
    {
      label: 'Team profile',
      value: formatSingleValue(assessment.teamTechnicalLevel, TEAM_LEVEL_LABELS),
    },
    {
      label: 'Monthly usage',
      value: formatSingleValue(assessment.expectedMonthlyConversations, MONTHLY_USAGE_LABELS),
    },
    {
      label: 'Use cases',
      value: formatArrayValue(assessment.primaryUseCases, USE_CASE_LABELS),
    },
    {
      label: 'Current environment',
      value: formatArrayValue(assessment.currentStack, STACK_LABELS),
    },
    {
      label: 'Compliance',
      value: formatArrayValue(assessment.complianceRequirements, COMPLIANCE_LABELS),
    },
  ]

  return items.filter((item): item is { label: string; value: ReactNode } => item.value !== null)
}

function formatSingleValue(
  raw: unknown,
  labels: Record<string, string>,
): ReactNode | null {
  if (typeof raw !== 'string' || raw.length === 0) return null
  return labels[raw] ?? raw
}

function formatArrayValue(
  raw: unknown,
  labels: Record<string, string>,
): ReactNode | null {
  if (!Array.isArray(raw) || raw.length === 0) return null

  const values = raw
    .filter((value): value is string => typeof value === 'string' && value.length > 0)
    .map((value) => labels[value] ?? value)

  if (values.length === 0) return null

  return values.join(', ')
}
