# Agentic Decisions

## What This Is

A vendor-neutral decision toolkit that helps enterprise IT leaders choose the right AI agent platform for their specific use cases. It combines an interactive assessment tool, a decision framework, and implementation-ready blueprints — essentially "Wirecutter for enterprise agent deployment."

## Core Value

IT leaders can input their situation (stack, use cases, budget, compliance) and get an honest, actionable recommendation — not a vendor pitch.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Decision framework with classification logic (task complexity, existing stack, cross-system vs single, regulated vs unregulated)
- [ ] Interactive web-based assessment tool where users input their situation
- [ ] Platform comparison covering 10-12 agent platforms (Frontier, Tray, LangGraph, Copilot Studio, ServiceNow, Workato, CrewAI, n8n, Vertex AI, UiPath, Agentforce, OpenAI Agents SDK)
- [ ] 5-6 implementation-ready use case blueprints (IT ticketing, customer support, data pipeline monitoring, sales lead routing, knowledge base Q&A, procurement approval)
- [ ] Cost calculator with token costs + platform fees + engineering time estimates
- [ ] Architecture diagrams for each recommendation path
- [ ] Vendor comparison matrix with honest, non-vendor-biased scoring

### Out of Scope

- Consulting services — this is a self-serve product, not a services business (for v1)
- Platform partnerships/referrals — focus on building the tool first, monetization later
- White-labeling for SIs — future consideration after product-market fit
- Mobile app — web-first

## Context

**Market Gap:** No vendor-neutral, practitioner-grade decision toolkit exists for enterprise AI agent deployment. Current landscape:
- Vendor listicles rank themselves #1 (Vellum, Kore.ai, Stack AI all claim top spot)
- Consulting firms charge $300-500/hr for this guidance
- Microsoft's GitHub framework only covers their ecosystem
- Developer-focused comparisons (MachineLearningMastery) ignore enterprise platforms

**Timing:** OpenAI Frontier launched Feb 5, 2026, positioning as "enterprise OS for agents." Market is hot and confusing — perfect time for honest guidance.

**Competitive Landscape (platforms to cover):**

| Tier | Platforms | Target |
|------|-----------|--------|
| Enterprise OS | OpenAI Frontier, Copilot Studio, Vertex AI | Large enterprise |
| iPaaS + Agent | Tray.ai, Workato, Boomi | Mid-market to enterprise |
| Developer-first | LangGraph, CrewAI, OpenAI Agents SDK, n8n | Engineering teams |
| Vertical | ServiceNow AI Agents, UiPath, Agentforce | Domain-specific |

**Decision Tree Logic:**
- Single-tool, single-step → Don't use an agent (Zapier/Make)
- Multi-step within one system → Native AI features (Agentforce, ServiceNow)
- Cross-system structured workflows → iPaaS + agent (Tray, Workato)
- Complex reasoning, unstructured data → Full orchestration (LangGraph, CrewAI)
- Enterprise-wide agent management → Platform play (Frontier, Copilot Studio)

**Target User:** IT leaders at mid-market companies (200-2000 employees) who:
- Know they need AI agents
- Don't have budget for Deloitte/EY
- Are drowning in vendor pitches
- Need practical, implementation-ready guidance

**User's Background:** Integration consulting experience (Boomi, Celigo), hands-on AI building, client-facing technical work. This informs the practitioner credibility of the content.

## Constraints

- **Solo build**: One person building this — scope must be achievable
- **Speed to market**: Agent platform landscape changing rapidly; need to ship fast and iterate
- **No vendor bias**: Must remain independent; no platform sponsorships that compromise recommendations
- **Data freshness**: Platform capabilities and pricing change frequently; need update strategy

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Web app over static content | Interactive assessment provides more value than a PDF/blog | — Pending |
| 10-12 platforms in v1 | Cover full landscape to be comprehensive, not just top 5 | — Pending |
| 5-6 blueprints in v1 | Most common enterprise use cases; can expand based on demand | — Pending |
| Vendor-neutral positioning | Core differentiator; sacrificing this would kill the value prop | — Pending |

---
*Last updated: 2026-02-05 after initialization*
