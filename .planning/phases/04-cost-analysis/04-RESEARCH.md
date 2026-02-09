# Phase 4: Cost Analysis - Research

**Researched:** 2026-02-08
**Domain:** TCO Calculation, Cost Projections, Pricing Calculator UX
**Confidence:** MEDIUM

## Summary

Phase 4 implements a cost analysis system that calculates and visualizes Total Cost of Ownership (TCO) for AI agent platforms. The system must handle four distinct pricing models found across the 11 platforms in scope: (1) token-based pay-per-use (Anthropic, OpenAI, Bedrock), (2) subscription tiers (Tray.ai, IBM watsonx), (3) per-conversation pricing (Salesforce Agentforce at $2/conversation), and (4) hybrid subscription + usage (Microsoft Copilot Studio).

The standard approach combines three cost categories: platform/infrastructure costs, token/usage costs, and personnel/implementation costs. The user provides expected usage volume (monthly conversations or API calls) through slider inputs, and the calculator projects costs across 12, 24, and 36-month timeframes using the TCO formula: `TCO = Initial Costs + (Monthly Operating Costs * Months) - Residual Value`. Engineering time estimation uses the industry-standard three-point formula `(O + 4M + P) / 6` with complexity multipliers based on platform tier and existing stack compatibility.

For UI implementation, the calculator should use Recharts (already in stack) for cost comparison bar charts and stacked area charts for timeline projections. The existing pricing schema in velite (`pricing.model` and `pricing.details`) needs extension to include structured pricing data (token rates, tier thresholds, base subscriptions).

**Primary recommendation:** Extend platform MDX frontmatter with structured pricing data, implement cost calculation utilities in `lib/cost/`, and build an interactive calculator UI with sliders for usage input and side-by-side platform cost comparisons using Recharts.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Recharts | 2.x | Cost visualization (bar charts, stacked area) | Already in stack, declarative React API, 1M+ weekly downloads |
| React Hook Form | 7.x | Usage input forms (sliders, dropdowns) | Already in stack from Phase 2, handles form state |
| Zod | 3.x | Pricing data validation, input schema | Already in stack, ensures pricing data integrity |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| @radix-ui/react-slider | 1.x | Accessible range slider component | For usage volume input (conversations/month, tokens/month) |
| clsx/tailwind-merge | Latest | Conditional styling for cost tiers | Highlight best-value options, color-code expensive tiers |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Recharts | Tremor | Tremor has pre-built cost-focused components but adds 50kb+ bundle; Recharts already in project |
| Custom slider | react-slider | Custom provides exact UX control; react-slider adds dependency without shadcn/ui integration |
| Inline calculations | Server API | Client-side keeps privacy (no usage data sent to server), works offline |

**Installation:**
```bash
# Slider likely already available via shadcn/ui - check existing components
npx shadcn-ui@latest add slider
```

## Architecture Patterns

### Recommended Project Structure
```
lib/
├── cost/                           # New cost calculation module
│   ├── types.ts                    # CostEstimate, PricingModel, TCO types
│   ├── token-calculator.ts         # Token-based pricing calculations
│   ├── subscription-calculator.ts  # Subscription tier calculations
│   ├── tco-calculator.ts           # Total Cost of Ownership aggregation
│   ├── engineering-estimate.ts     # Implementation time estimation
│   └── __tests__/                  # Unit tests for calculation accuracy
│       └── cost.test.ts
app/
├── assessment/
│   └── results/
│       └── components/
│           ├── CostCalculator.tsx      # Main calculator container
│           ├── UsageInputPanel.tsx     # Sliders for volume input
│           ├── CostComparisonChart.tsx # Recharts bar chart
│           ├── TCOProjectionChart.tsx  # 12/24/36 month stacked area
│           ├── PlatformCostCard.tsx    # Individual platform cost breakdown
│           └── EngineeringEstimate.tsx # Implementation effort display
content/
└── platforms/*.mdx                 # Extend frontmatter with structured pricing
```

### Pattern 1: Unified Cost Calculation Interface
**What:** Normalize all pricing models to a common output format regardless of input type (tokens, conversations, subscriptions).

**When to use:** When aggregating costs across platforms with different pricing models.

**Example:**
```typescript
// Source: TCO best practices from IBM and CIO.com research
// https://www.ibm.com/think/topics/total-cost-of-ownership

interface CostEstimate {
  platformId: string;
  platformName: string;
  monthlyUsageCost: number;      // Variable costs (tokens, conversations)
  monthlyBaseCost: number;       // Fixed costs (subscriptions, licenses)
  monthlyTotal: number;          // usageCost + baseCost
  yearlyTotal: number;           // monthlyTotal * 12
  engineeringDays: number;       // Implementation effort
  engineeringCost: number;       // Days * rate
  tcoPeriods: {
    months12: number;            // Year 1 TCO
    months24: number;            // Year 2 cumulative
    months36: number;            // Year 3 cumulative
  };
  breakdown: CostBreakdown[];    // Line-item details for transparency
}

interface CostBreakdown {
  category: 'platform' | 'token' | 'infrastructure' | 'personnel';
  item: string;
  monthlyCost: number;
  annualCost: number;
  notes: string;
}

function calculatePlatformCost(
  platform: Platform,
  usageParams: UsageParameters,
  engineerRate: number = 150 // $/hour default
): CostEstimate {
  const pricingModel = platform.pricing.model;

  let usageCost: number;
  let baseCost: number;

  switch (pricingModel) {
    case 'token-based':
      usageCost = calculateTokenCost(platform, usageParams);
      baseCost = 0;
      break;
    case 'per-conversation':
      usageCost = usageParams.monthlyConversations * platform.pricing.perConversationRate;
      baseCost = platform.pricing.baseSubscription || 0;
      break;
    case 'subscription':
      usageCost = 0;
      baseCost = selectTier(platform.pricing.tiers, usageParams).monthlyRate;
      break;
    case 'hybrid':
      usageCost = calculateTokenCost(platform, usageParams);
      baseCost = platform.pricing.baseSubscription;
      break;
    default:
      throw new Error(`Unknown pricing model: ${pricingModel}`);
  }

  const monthlyTotal = usageCost + baseCost;
  const engineeringDays = estimateEngineeringDays(platform, usageParams);
  const engineeringCost = engineeringDays * 8 * engineerRate;

  return {
    platformId: platform.slug,
    platformName: platform.title,
    monthlyUsageCost: usageCost,
    monthlyBaseCost: baseCost,
    monthlyTotal,
    yearlyTotal: monthlyTotal * 12,
    engineeringDays,
    engineeringCost,
    tcoPeriods: {
      months12: engineeringCost + (monthlyTotal * 12),
      months24: engineeringCost + (monthlyTotal * 24),
      months36: engineeringCost + (monthlyTotal * 36),
    },
    breakdown: generateBreakdown(platform, usageCost, baseCost, engineeringCost),
  };
}
```

### Pattern 2: Token Cost Calculation
**What:** Calculate monthly token costs from input/output token volumes and per-token rates.

**When to use:** For pay-per-use platforms (Anthropic, OpenAI, Bedrock).

**Example:**
```typescript
// Source: LLM pricing research from pricepertoken.com and official docs
// Token ratios from industry benchmarks

interface TokenUsage {
  monthlyInputTokens: number;
  monthlyOutputTokens: number;
}

interface TokenPricing {
  inputPricePerMillion: number;   // e.g., $3 for Claude 3.5 Sonnet
  outputPricePerMillion: number;  // e.g., $15 for Claude 3.5 Sonnet
  cachedInputDiscount?: number;   // % discount for cached prompts
}

function calculateTokenCost(
  platform: Platform,
  usage: TokenUsage
): number {
  const pricing = platform.pricing.tokenPricing;
  if (!pricing) return 0;

  const inputCost = (usage.monthlyInputTokens / 1_000_000) * pricing.inputPricePerMillion;
  const outputCost = (usage.monthlyOutputTokens / 1_000_000) * pricing.outputPricePerMillion;

  return inputCost + outputCost;
}

// Helper: Convert conversations to approximate tokens
// Average conversation: 2,000 input tokens, 500 output tokens
function conversationsToTokens(conversations: number): TokenUsage {
  return {
    monthlyInputTokens: conversations * 2000,
    monthlyOutputTokens: conversations * 500,
  };
}

// Helper: Apply volume discounts for enterprise tiers
function applyVolumeDiscount(
  baseCost: number,
  monthlyTokens: number,
  discountTiers: DiscountTier[]
): number {
  const applicableTier = discountTiers
    .filter(t => monthlyTokens >= t.minTokens)
    .sort((a, b) => b.minTokens - a.minTokens)[0];

  if (!applicableTier) return baseCost;

  return baseCost * (1 - applicableTier.discountPercent / 100);
}
```

### Pattern 3: Engineering Time Estimation (Three-Point)
**What:** Estimate implementation effort using optimistic, most likely, and pessimistic estimates.

**When to use:** For COST-04 (engineering time estimates for each platform).

**Example:**
```typescript
// Source: Software estimation best practices
// https://fibery.io/blog/100-posts-about-products/software-development-time-estimation/

interface EngineeringEstimate {
  optimisticDays: number;    // O - Best case
  mostLikelyDays: number;    // M - Typical case
  pessimisticDays: number;   // P - Worst case
  expectedDays: number;      // (O + 4M + P) / 6
  confidenceRange: { low: number; high: number };
}

interface PlatformComplexity {
  tier: 'enterprise-os' | 'ipaas-agent' | 'developer-first' | 'vertical';
  hasNativeIntegration: boolean;  // With user's stack
  requiresCustomCode: boolean;
  complianceRequirements: string[];
}

// Base estimates by platform tier (days)
const BASE_ESTIMATES: Record<string, { O: number; M: number; P: number }> = {
  'enterprise-os': { O: 15, M: 25, P: 45 },      // Complex setup, governance
  'ipaas-agent': { O: 5, M: 10, P: 20 },         // Pre-built connectors
  'developer-first': { O: 10, M: 20, P: 35 },    // Requires engineering
  'vertical': { O: 3, M: 7, P: 15 },             // Domain-specific, guided
};

function estimateEngineeringDays(
  platform: Platform,
  context: PlatformComplexity
): EngineeringEstimate {
  const base = BASE_ESTIMATES[platform.tier];

  // Apply multipliers
  let multiplier = 1.0;

  if (!context.hasNativeIntegration) multiplier += 0.3;  // +30% for custom integration
  if (context.requiresCustomCode) multiplier += 0.25;    // +25% for custom development
  if (context.complianceRequirements.length > 0) {
    multiplier += context.complianceRequirements.length * 0.1; // +10% per compliance req
  }

  const O = Math.round(base.O * multiplier);
  const M = Math.round(base.M * multiplier);
  const P = Math.round(base.P * multiplier);

  // Three-point estimation formula
  const expected = (O + 4 * M + P) / 6;

  // Standard deviation for confidence range
  const stdDev = (P - O) / 6;

  return {
    optimisticDays: O,
    mostLikelyDays: M,
    pessimisticDays: P,
    expectedDays: Math.round(expected),
    confidenceRange: {
      low: Math.round(expected - stdDev),
      high: Math.round(expected + stdDev),
    },
  };
}

// Convert days to cost
function engineeringDaysToCost(
  days: number,
  hourlyRate: number = 150,  // Default senior engineer rate
  hoursPerDay: number = 8
): number {
  return days * hoursPerDay * hourlyRate;
}
```

### Pattern 4: TCO Projection Visualization
**What:** Stacked area chart showing cumulative costs over 12/24/36 months.

**When to use:** For COST-03 (TCO projections over time).

**Example:**
```typescript
// Source: Recharts stacked area chart patterns
// https://recharts.github.io/en-US/examples/StackedAreaChart/

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface TCODataPoint {
  month: number;
  platformFees: number;
  tokenCosts: number;
  infrastructure: number;
  personnel: number;  // One-time spread over timeline
  total: number;
}

function generateTCOTimeline(
  estimate: CostEstimate,
  months: number = 36
): TCODataPoint[] {
  const personnelPerMonth = estimate.engineeringCost / 3; // Spread over first 3 months

  return Array.from({ length: months }, (_, i) => {
    const month = i + 1;
    const cumulativeBase = estimate.monthlyBaseCost * month;
    const cumulativeUsage = estimate.monthlyUsageCost * month;
    const cumulativePersonnel = month <= 3 ? personnelPerMonth * month : estimate.engineeringCost;

    return {
      month,
      platformFees: cumulativeBase,
      tokenCosts: cumulativeUsage,
      infrastructure: 0, // Could add infra costs here
      personnel: cumulativePersonnel,
      total: cumulativeBase + cumulativeUsage + cumulativePersonnel,
    };
  });
}

function TCOProjectionChart({ estimates }: { estimates: CostEstimate[] }) {
  // Compare multiple platforms side by side
  const data = [12, 24, 36].map(months => ({
    period: `${months} months`,
    ...Object.fromEntries(
      estimates.map(e => [e.platformName, e.tcoPeriods[`months${months}` as keyof typeof e.tcoPeriods]])
    ),
  }));

  return (
    <ResponsiveContainer width="100%" height={400}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="period" />
        <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
        <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} />
        <Legend />
        {estimates.map((e, i) => (
          <Area
            key={e.platformId}
            type="monotone"
            dataKey={e.platformName}
            stackId="1"
            stroke={COLORS[i]}
            fill={COLORS[i]}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
```

### Pattern 5: Usage Input with Slider
**What:** Accessible slider component for inputting expected monthly usage volume.

**When to use:** For COST-01 usage volume input.

**Example:**
```typescript
// Source: shadcn/ui Slider + pricing slider patterns
// https://ui.shadcn.com/docs/components/slider

'use client';

import { Slider } from '@/components/ui/slider';
import { useState, useCallback } from 'react';

interface UsageSliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  presetValues?: { value: number; label: string }[];
}

function UsageSlider({
  label,
  min,
  max,
  step,
  value,
  onChange,
  formatValue = (v) => v.toLocaleString(),
  presetValues,
}: UsageSliderProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">{label}</label>
        <span className="text-lg font-bold text-primary">
          {formatValue(value)}
        </span>
      </div>

      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={min}
        max={max}
        step={step}
        className="w-full"
      />

      {presetValues && (
        <div className="flex justify-between text-xs text-muted-foreground">
          {presetValues.map((preset) => (
            <button
              key={preset.value}
              onClick={() => onChange(preset.value)}
              className="hover:text-primary transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Usage in calculator
function UsageInputPanel({ onUsageChange }: Props) {
  const [monthlyConversations, setMonthlyConversations] = useState(10000);
  const [avgTokensPerConversation, setAvgTokensPerConversation] = useState(2500);

  const handleChange = useCallback(() => {
    onUsageChange({
      monthlyConversations,
      monthlyInputTokens: monthlyConversations * 2000,
      monthlyOutputTokens: monthlyConversations * 500,
    });
  }, [monthlyConversations, onUsageChange]);

  return (
    <div className="space-y-6 p-6 bg-card rounded-lg border">
      <h3 className="text-lg font-semibold">Expected Usage</h3>

      <UsageSlider
        label="Monthly Conversations"
        min={1000}
        max={1000000}
        step={1000}
        value={monthlyConversations}
        onChange={setMonthlyConversations}
        formatValue={(v) => `${(v / 1000).toFixed(0)}K`}
        presetValues={[
          { value: 5000, label: 'Starter' },
          { value: 50000, label: 'Growth' },
          { value: 500000, label: 'Enterprise' },
        ]}
      />

      {/* Additional inputs as needed */}
    </div>
  );
}
```

### Anti-Patterns to Avoid

- **Hardcoded pricing data:** Pricing changes frequently. Store in MDX frontmatter or external config, not in calculation code.

- **Single pricing model assumption:** Different platforms use different models (tokens vs subscriptions vs per-conversation). The calculator must handle all types.

- **Ignoring input/output asymmetry:** Output tokens cost 3-8x more than input tokens. Failing to separate these dramatically underestimates costs.

- **Missing infrastructure costs:** Token costs are not the full picture. Enterprise deployments often require dedicated infrastructure, data residency, or premium support tiers.

- **Over-precise estimates:** Presenting "$12,847.23/month" implies false precision. Round to meaningful increments and show ranges.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Range slider UI | Custom draggable div | @radix-ui/react-slider or shadcn/ui Slider | Accessibility (keyboard, screen reader), touch support, proper ARIA labels |
| Number formatting | Manual string manipulation | Intl.NumberFormat | Handles currency, thousands separators, locale differences |
| Chart rendering | SVG/Canvas manipulation | Recharts | Responsive, accessible, handles data updates, tooltips |
| Form validation | Manual if/else | Zod schemas | Already in stack, type-safe, composable validation |

**Key insight:** Cost calculation logic should be implemented directly (it's business logic specific to this domain), but all UI components should use existing accessible libraries.

## Common Pitfalls

### Pitfall 1: Stale Pricing Data
**What goes wrong:** Calculator shows prices from 6 months ago. AI platform pricing changes frequently (OpenAI has changed prices 4+ times in 18 months).

**Why it happens:** Pricing data hardcoded at build time, no update mechanism.

**How to avoid:**
- Store pricing in MDX frontmatter with `lastVerified` date (already exists)
- Display warning when `lastVerified > 30 days ago`
- Link to official pricing page for each platform
- Consider quarterly pricing review process

**Warning signs:**
- User reports price mismatch vs official site
- Platforms announce price changes not reflected in calculator

### Pitfall 2: Misleading Token Estimates
**What goes wrong:** Estimated token usage doesn't match actual production usage. Users think they'll use 10K tokens/conversation but actually use 50K.

**Why it happens:** Hard to estimate tokens without domain expertise. Prompts, context windows, and response lengths vary dramatically.

**How to avoid:**
- Provide usage presets: "Customer Support (avg 2,500 tokens)", "Document Analysis (avg 15,000 tokens)"
- Show token usage breakdown: "~2,000 input + ~500 output = 2,500 total"
- Include disclaimer: "Actual usage depends on your specific prompts and use case"
- Link to platform-specific token estimator tools

**Warning signs:**
- Users selecting wrong usage tier
- High variance between estimated and actual costs in testimonials

### Pitfall 3: Ignoring Volume Discounts
**What goes wrong:** Calculator shows list prices, but enterprise customers get 20-40% discounts on high volume.

**Why it happens:** Discount structures are often unpublished or require sales contact.

**How to avoid:**
- Add note: "Enterprise volume discounts may apply. Contact [platform] for custom pricing."
- For known tiers (e.g., Salesforce editions), model the discount structure
- Show both "list price" and "estimated enterprise price" where data available

**Warning signs:**
- Enterprise users complaining estimates are too high
- Missing discount information in pricing research

### Pitfall 4: False Precision in Engineering Estimates
**What goes wrong:** Showing "27.3 days" implies a precision that doesn't exist for software estimation.

**Why it happens:** Formulas output decimal values, developers display them directly.

**How to avoid:**
- Round to meaningful units: "4-6 weeks" not "27.3 days"
- Show confidence ranges: "Expected: 25 days (optimistic: 15, pessimistic: 45)"
- Use three-point estimation to communicate uncertainty
- Include caveats: "Estimate assumes experienced team familiar with [stack]"

**Warning signs:**
- Estimates with decimal precision
- No confidence intervals shown
- Users treating estimates as commitments

### Pitfall 5: Apples-to-Oranges Comparisons
**What goes wrong:** Comparing token cost only misses that one platform includes support while another charges separately.

**Why it happens:** Focusing on headline price metric, ignoring total cost components.

**How to avoid:**
- Always show total TCO, not just token costs
- Include all cost categories: platform, tokens, infrastructure, personnel
- Note what's included: "Price includes 24/7 support" vs "Support extra at $X/month"
- Use consistent assumptions across all platforms

**Warning signs:**
- Users surprised by "hidden" costs after selection
- Cost breakdowns missing major categories

## Code Examples

Verified patterns from official sources:

### Extended Pricing Schema for MDX
```typescript
// velite.config.ts extension
// Extend existing pricing schema with structured data

const pricingSchema = s.object({
  model: s.enum([
    'pay-per-use',      // Token-based (OpenAI, Anthropic, Bedrock)
    'subscription',     // Flat monthly fee (Tray.ai)
    'per-conversation', // Per-interaction (Salesforce Agentforce)
    'hybrid',           // Base + usage (Copilot Studio)
  ]),
  details: s.string(),  // Human-readable description

  // Token pricing (for pay-per-use and hybrid)
  tokenPricing: s.object({
    inputPricePerMillion: s.number().optional(),
    outputPricePerMillion: s.number().optional(),
    cachedInputDiscount: s.number().optional(),
    modelVariants: s.array(s.object({
      name: s.string(),
      inputPrice: s.number(),
      outputPrice: s.number(),
    })).optional(),
  }).optional(),

  // Subscription tiers
  tiers: s.array(s.object({
    name: s.string(),
    monthlyPrice: s.number(),
    includedUnits: s.number().optional(),
    unitType: s.string().optional(), // 'conversations', 'users', 'tasks'
  })).optional(),

  // Per-conversation pricing
  perConversationRate: s.number().optional(),
  includedConversations: s.number().optional(),

  // Additional costs
  infrastructureCosts: s.string().optional(),
  enterpriseContact: s.boolean().optional(),
});
```

### Platform Pricing Examples (MDX Frontmatter)
```yaml
# anthropic-claude.mdx
pricing:
  model: pay-per-use
  details: Token-based with API credits, enterprise plans available
  tokenPricing:
    modelVariants:
      - name: Claude 3.5 Sonnet
        inputPrice: 3       # per million tokens
        outputPrice: 15
      - name: Claude Opus 4.5
        inputPrice: 5
        outputPrice: 25
  enterpriseContact: true

# salesforce-agentforce.mdx
pricing:
  model: per-conversation
  details: $2 per conversation, included conversations vary by Salesforce edition
  perConversationRate: 2
  tiers:
    - name: Starter
      monthlyPrice: 0
      includedUnits: 1000
      unitType: conversations
    - name: Professional
      monthlyPrice: 150
      includedUnits: 5000
      unitType: conversations

# tray-ai.mdx
pricing:
  model: subscription
  details: Tiered plans based on tasks and connectors
  tiers:
    - name: Professional
      monthlyPrice: 995
      includedUnits: 5000
      unitType: tasks
    - name: Enterprise
      monthlyPrice: 3495
      includedUnits: 25000
      unitType: tasks
```

### Cost Comparison Bar Chart
```typescript
// Source: Recharts grouped bar chart patterns
// https://recharts.github.io/en-US/examples/StackedBarChart/

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';

interface CostComparisonProps {
  estimates: CostEstimate[];
  period: 'monthly' | 'yearly' | 'tco36';
}

const COLORS = {
  platformFees: '#3b82f6',  // Blue
  tokenCosts: '#10b981',    // Green
  engineering: '#f59e0b',   // Amber
};

function CostComparisonChart({ estimates, period }: CostComparisonProps) {
  const data = estimates.map(e => ({
    name: e.platformName,
    'Platform Fees': period === 'monthly'
      ? e.monthlyBaseCost
      : e.monthlyBaseCost * (period === 'yearly' ? 12 : 36),
    'Token/Usage Costs': period === 'monthly'
      ? e.monthlyUsageCost
      : e.monthlyUsageCost * (period === 'yearly' ? 12 : 36),
    'Engineering': period === 'monthly'
      ? 0
      : e.engineeringCost,
  }));

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value.toFixed(0)}`;
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" tickFormatter={formatCurrency} />
        <YAxis type="category" dataKey="name" width={100} />
        <Tooltip
          formatter={(value: number) => `$${value.toLocaleString()}`}
          labelFormatter={(label) => `Platform: ${label}`}
        />
        <Legend />
        <Bar dataKey="Platform Fees" stackId="a" fill={COLORS.platformFees} />
        <Bar dataKey="Token/Usage Costs" stackId="a" fill={COLORS.tokenCosts} />
        <Bar dataKey="Engineering" stackId="a" fill={COLORS.engineering} />
      </BarChart>
    </ResponsiveContainer>
  );
}
```

### Formatting Utilities
```typescript
// lib/cost/format.ts
// Consistent formatting across cost displays

export function formatCurrency(
  value: number,
  options: { compact?: boolean; showCents?: boolean } = {}
): string {
  const { compact = false, showCents = false } = options;

  if (compact) {
    if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showCents ? 2 : 0,
    maximumFractionDigits: showCents ? 2 : 0,
  }).format(value);
}

export function formatTokenCount(tokens: number): string {
  if (tokens >= 1_000_000_000) return `${(tokens / 1_000_000_000).toFixed(1)}B`;
  if (tokens >= 1_000_000) return `${(tokens / 1_000_000).toFixed(1)}M`;
  if (tokens >= 1_000) return `${(tokens / 1_000).toFixed(0)}K`;
  return tokens.toString();
}

export function formatDuration(days: number): string {
  if (days >= 20) {
    const weeks = Math.round(days / 5);
    return `${weeks} week${weeks === 1 ? '' : 's'}`;
  }
  return `${days} day${days === 1 ? '' : 's'}`;
}

export function formatRange(low: number, high: number): string {
  return `${formatDuration(low)} - ${formatDuration(high)}`;
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Static pricing tables | Interactive calculators with sliders | 2024-2025 | Users can see cost impact of their specific usage patterns |
| Single-price comparison | TCO with multiple cost categories | 2025-2026 | More accurate total cost picture including implementation |
| Annual contracts only | Usage-based pricing with monthly flexibility | 2024+ | Enterprises want pay-as-you-go with scale discounts |
| Hidden pricing | Transparent pricing pages | 2025-2026 | Competitive pressure forcing price transparency |

**Deprecated/outdated:**
- **ROI calculators without TCO:** Pure ROI (return/investment) ignores ongoing costs. TCO is now standard.
- **Single model pricing assumptions:** Assuming all platforms use tokens ignores subscription and per-conversation models.
- **Static PDFs:** Interactive web calculators have replaced downloadable pricing PDFs for B2B SaaS.

## Open Questions

Things that couldn't be fully resolved:

1. **Exact token pricing for all 11 platforms**
   - What we know: Anthropic, OpenAI, and Bedrock use token-based pricing with published rates. Salesforce uses $2/conversation.
   - What's unclear: Exact per-token rates for IBM watsonx, Google Vertex AI model selection, ServiceNow AI Agents pricing structure.
   - Recommendation: Use "Contact for pricing" fallback with link to official pricing page. Display warning that estimate is incomplete.

2. **Enterprise discount structures**
   - What we know: Volume discounts exist (typically 20-40% for high volume).
   - What's unclear: Exact discount thresholds and percentages (usually requires sales contact).
   - Recommendation: Show list prices with note "Enterprise volume discounts may apply." Don't attempt to model unpublished discounts.

3. **Infrastructure cost allocation**
   - What we know: Some platforms (Bedrock, Vertex AI) require cloud infrastructure costs.
   - What's unclear: How to estimate infrastructure costs without knowing user's existing cloud spend.
   - Recommendation: Show as optional line item with typical ranges ($500-$5000/month) based on platform tier.

4. **Personnel cost assumptions**
   - What we know: Need to convert engineering days to dollars.
   - What's unclear: What hourly rate to use (varies $100-$300+ for senior engineers).
   - Recommendation: Use configurable rate with sensible default ($150/hour). Allow user to override.

## Sources

### Primary (HIGH confidence)
- [IBM TCO Methodology](https://www.ibm.com/think/topics/total-cost-of-ownership) - TCO calculation framework
- [CIO Enterprise Software TCO](https://www.cio.com/article/242681/calculating-the-total-cost-of-ownership-for-enterprise-software.html) - Time horizons and cost categories
- [Anthropic Claude Pricing](https://platform.claude.com/docs/en/about-claude/pricing) - Official token pricing
- [OpenAI Pricing](https://openai.com/api/pricing/) - Official API pricing
- [Recharts Documentation](https://recharts.github.io/) - Chart component patterns

### Secondary (MEDIUM confidence)
- [AI Agent Pricing 2026](https://www.nocodefinder.com/blog-posts/ai-agent-pricing) - Pricing model taxonomy
- [LLM API Pricing Comparison](https://pricepertoken.com/) - Cross-platform token pricing
- [Software Estimation Techniques](https://fibery.io/blog/100-posts-about-products/software-development-time-estimation/) - Three-point estimation
- [SaaS Calculator UI Patterns](https://www.saasframe.io/patterns/calculator) - Calculator design patterns
- [Recharts Bar Chart Examples](https://recharts.github.io/en-US/examples/StackedBarChart/) - Stacked bar visualization

### Tertiary (LOW confidence - flagged for validation)
- Platform-specific pricing beyond Anthropic/OpenAI (IBM, ServiceNow, SAP Joule) - may require direct verification
- Engineering time estimates by platform tier - based on general software estimation, not platform-specific benchmarks
- Volume discount percentages - typical ranges but not verified with specific platforms

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Recharts and React Hook Form already in project, patterns well-documented
- Architecture: MEDIUM - TCO calculation methodology established, but pricing data structures need validation
- Pitfalls: HIGH - Common cost calculator pitfalls well-documented across sources
- Engineering estimates: LOW - Three-point methodology is standard, but platform-specific multipliers are approximations

**Research date:** 2026-02-08
**Valid until:** 2026-03-08 (30 days - pricing data changes frequently, consider quarterly refresh)

**Notes:**
- The 11 platforms use 4 different pricing models - calculator must handle all types
- Output tokens cost 3-8x more than input tokens - this asymmetry is critical
- Engineering estimates have high variance - always show ranges, not point estimates
- Pricing data freshness is a real concern - display lastVerified prominently
- User usage volume inputs drive cost variation more than platform selection
