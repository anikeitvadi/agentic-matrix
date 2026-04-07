# Agentic Matrix

**Vendor-neutral AI platform evaluation tool that turns subjective platform selection into an auditable, explainable decision.**

Compares 19 agentic AI platforms across 4 tiers using deterministic scoring, real pricing data, and hard/soft requirement gating. No keyword matching, no vibes — every recommendation is traceable to a specific capability flag, compliance cert, or cost data point.

[Live Demo](https://agentic-matrix.vercel.app) <!-- Update with your actual URL -->

---

## Why This Exists

Choosing an AI agent platform today means reading 30 vendor pages, comparing incompatible pricing models, and making a gut call. Enterprise teams spend weeks on this. Agentic Matrix replaces that with a structured, repeatable evaluation that surfaces the right platform in under 2 minutes.

## How the Recommendation Works

The engine uses a two-layer scoring model:

```
Assessment Inputs
       |
       v
  SAW Scoring (5 weighted criteria)
       |
       v
  Fit Score (theoretical match quality)
       |
       v
  Decision Adjustments (evidence gaps, implementation risk, cost friction)
       |
       v
  Decision Score (production-readiness adjusted)
       |
       v
  Hard Gate Check (compliance, budget ceiling, deployment)
       |
       v
  Ranked Recommendation + Decision Memo + Exportable Packet
```

**Fit Score** — Simple Additive Weighting across 5 criteria (integration fit, compliance match, budget fit, feature match, stack compatibility). Weights shift dynamically based on what the user cares about most.

**Decision Score** — Fit score minus penalties for evidence gaps, implementation risk, and business friction. This is what determines the final ranking.

**Hard Gates** — Platforms missing required compliance certs or exceeding 2x the budget ceiling are ranked below all gate-passing platforms regardless of score.

Every score is auditable: expand any platform to see exactly how each criterion was calculated, what data drove it, and what would change the outcome.

## Key Features

- **19 platforms** with structured capability flags, verified pricing (March 2026), and compliance certifications
- **4-step assessment** with pre-screening, industry-aware compliance inference, and progressive disclosure
- **Decision memo** with winner rationale, "why not" alternatives, and sensitivity scenarios
- **AI decision brief** (OpenAI) that adds executive-level synthesis on top of the deterministic output
- **Exportable decision packet** — print-ready HTML with score bridge, cost analysis, and audit trail
- **Cost calculator** with real TCO projections (12/24/36 month) across token-based and subscription models
- **Comparison matrix** with sortable columns, budget/deployment filtering, and tier grouping
- **Implementation risk** and **confidence scoring** per platform

## Architecture

```
app/
  assessment/          # 4-step questionnaire + results page
    schemas/           # Zod validation per step
    steps/             # Step components with conditional logic
    results/
      components/      # PlatformScores, DecisionMemo, CostCalculator,
                       #   ComparisonMatrix, AIDecisionBrief, DecisionPacket
      actions.ts       # Server action for AI brief (rate-limited)

lib/
  scoring/
    score-platform.ts  # SAW engine + decision adjustments + gate checks
    decision-memo.ts   # Recruiter-facing summary builder
    decision-packet.ts # Exportable HTML packet
    weights.ts         # Dynamic weight derivation
    audit-trail.ts     # Audit entry formatting
    types.ts           # Full type contracts (PlatformScore, Evidence, Risk, etc.)
  cost/
    tco-calculator.ts  # Token + subscription cost modeling
  assessment/
    ai-prompts.ts      # OpenAI prompt engineering

content/
  platforms/           # 19 MDX files with structured frontmatter
  blueprints/          # Implementation blueprints (customer support, data extraction, workflow automation)
```

## Tech Stack

- **Framework:** Next.js 15 (App Router, SSG)
- **Language:** TypeScript (strict, zero `any` in production code)
- **Styling:** Tailwind CSS v4
- **Content:** Velite MDX with Zod-validated frontmatter schemas
- **Charts:** Recharts
- **AI:** Vercel AI SDK + OpenAI (gpt-4o-mini for decision briefs)
- **Validation:** Zod + React Hook Form
- **Testing:** Vitest (95 tests)

## Running Locally

```bash
git clone https://github.com/YOUR_USERNAME/agentic-decisions.git
cd agentic-decisions
npm install
npm run dev
```

The app works fully without an OpenAI key — the AI decision brief is the only feature that requires one. To enable it:

```bash
cp .env.example .env.local
# Add your OPENAI_API_KEY
```

## Testing

```bash
npm test              # Run all 95 tests
npm run lint          # ESLint (0 errors)
npx tsc --noEmit     # Full typecheck (0 errors)
npm run build         # Production build
```

## Screenshots

<!-- Add screenshots here after deploying -->
<!-- Recommended: landing page, assessment step, results page with decision memo, decision packet export -->

## License

MIT
