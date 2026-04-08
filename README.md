# Agentic Matrix

AI platform evaluation tool. Compares 19 agentic AI platforms using deterministic scoring, real pricing data, and hard/soft requirement gating. No keyword matching, no vibes — every recommendation traces back to a specific capability flag, compliance cert, or cost data point.

I built this because choosing an AI agent platform right now is a mess. You're reading 30 vendor pages, comparing pricing models that don't even use the same units, and making a gut call at the end anyway. This replaces that with a structured evaluation that actually explains why it's recommending what it's recommending.

[Live Demo](https://agenticmatrix.vercel.app)

---

## How It Works

You answer 4 steps of questions — what you're building, your stack, compliance needs, budget, team level. The engine scores every platform against your inputs using a two-layer model:

```
Assessment Inputs
       ↓
  SAW Scoring (5 weighted criteria)
       ↓
  Fit Score — theoretical match quality
       ↓
  Decision Adjustments — evidence gaps, implementation risk, cost friction
       ↓
  Decision Score — what actually determines the ranking
       ↓
  Hard Gate Check — compliance, budget ceiling, deployment
       ↓
  Ranked Recommendation + Decision Memo + Exportable Packet
```

**Fit Score** — Simple Additive Weighting across integration fit, compliance match, budget fit, feature match, and stack compatibility. Weights shift based on what you care about most.

**Decision Score** — Fit score minus penalties for things that matter in production: evidence gaps, implementation risk, business friction. This is what determines the final ranking.

**Hard Gates** — Missing a required compliance cert? Over 2x budget ceiling? You get ranked below every platform that passes, regardless of score.

Every score is auditable. Expand any platform and see exactly how each criterion was calculated, what data drove it, and what would change the outcome.

## What You Get

- **Decision memo** — who won, why, what would flip the recommendation
- **AI decision brief** — OpenAI synthesis on top of the deterministic output, for when you need to hand something to a VP
- **Exportable decision packet** — print-ready HTML with score breakdown, cost analysis, audit trail
- **Cost calculator** — TCO projections (12/24/36 month) using real token and subscription pricing
- **Comparison matrix** — sort, filter, compare side by side
- **Risk and confidence scores** for every platform

## Architecture

```
app/
  assessment/            # 4-step questionnaire + results page
    schemas/             # Zod validation per step
    steps/               # Step components with conditional logic
    results/
      components/        # PlatformScores, DecisionMemo, CostCalculator,
                         #   ComparisonMatrix, AIDecisionBrief, DecisionPacket
      actions.ts         # Server action for AI brief (rate-limited)

lib/
  scoring/
    score-platform.ts    # SAW engine + decision adjustments + gate checks
    decision-memo.ts     # Summary builder
    decision-packet.ts   # Exportable HTML packet
    weights.ts           # Dynamic weight derivation
    types.ts             # Full type contracts (PlatformScore, Evidence, Risk, etc.)
  cost/
    tco-calculator.ts    # Token + subscription cost modeling
  assessment/
    ai-prompts.ts        # OpenAI prompt engineering

content/
  platforms/             # 19 MDX files with structured frontmatter
  blueprints/            # Implementation blueprints
```

## Tech Stack

- **Next.js 15** — App Router, SSG
- **TypeScript** — strict, zero `any` in production code
- **Tailwind CSS v4**
- **Velite** — MDX content with Zod-validated frontmatter schemas
- **Recharts** — cost and comparison visualizations
- **Vercel AI SDK + OpenAI** — gpt-4o-mini for decision briefs
- **Zod + React Hook Form** — assessment validation
- **Vitest** — 95 tests

## Running Locally

```bash
git clone https://github.com/anikeitvadi/agentic-matrix.git
cd agentic-matrix
npm install
npm run dev
```

Everything works without an OpenAI key. The AI decision brief is the only feature that needs one:

```bash
cp .env.example .env.local
# Add your OPENAI_API_KEY
```

## Testing

```bash
npm test              # 95 tests
npm run lint          # 0 errors
npx tsc --noEmit     # 0 type errors
npm run build         # Production build
```

## Screenshots

<!-- Add after deploying -->

## License

MIT
