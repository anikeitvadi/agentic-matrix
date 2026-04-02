# Platform Research Queries

**Purpose:** Validate and update all platform data in Agentic Decisions. Paste these into Perplexity or Google to gather sourced answers, then bring the results back to update platform MDX files.

**Current state:** 19 platforms, structured capabilities, pricing data last verified Feb-Mar 2026. Several prices confirmed stale (Bedrock was showing batch pricing, Vertex AI had old model names, Claude model names were outdated — these were fixed 2026-03-30).

---

## What This Project Is

Agentic Decisions is a vendor-neutral AI agent platform comparison tool built as a portfolio project. It helps enterprise IT leaders compare 19 AI agent platforms across pricing, compliance, capabilities, and use-case fit through:

- A 4-step assessment questionnaire
- A weighted scoring engine (SAW methodology with structured capability matching)
- TCO cost calculator with PERT engineering estimates
- Decision memo with match report, AI-generated brief, and exportable decision packet
- 3 implementation blueprints (customer support, data extraction, workflow automation)

**Tech stack:** Next.js 15, TypeScript, Tailwind v4, Velite MDX, Zod, React Hook Form, Recharts, Vercel AI SDK

**The 19 platforms covered:**

| Tier | Platforms |
|------|-----------|
| Enterprise OS (6) | Amazon Bedrock Agents, Anthropic Claude with MCP, Google Vertex AI Agent Builder, IBM watsonx Orchestrate, Microsoft Copilot Studio / Azure AI Foundry, OpenAI Agents Platform |
| iPaaS + Agent (5) | Boomi Agent Studio, Relevance AI, Tray.ai, Workato, Zapier Central (AI) |
| Developer-First (4) | AutoGen, CrewAI, LangChain / LangGraph, n8n AI Agents |
| Vertical (4) | Salesforce Agentforce, SAP Joule, ServiceNow AI Agents, UiPath AI Agents |

---

## Scoring Methodology

The tool uses Simple Additive Weighting (SAW) across 5 criteria, with weights derived from user assessment answers:

1. **Integration Fit** — matches user's needed integrations against platform's `supportedIntegrations` array
2. **Compliance Match** — matches required certs (HIPAA, SOC2, GDPR, ISO27001, FedRAMP) against platform's `complianceCerts` array
3. **Budget Fit** — calculates actual annual cost using real pricing data from TCO calculator (not tier-based estimates)
4. **Feature Match** — checks platform's `useCaseStrengths` against user's selected use cases + capability bonuses (RAG, multi-modal, multi-agent)
5. **Stack Compatibility** — matches cloud provider (`cloudNative`), team technical level (tier-fit lookup tables), timeline, and low-code/self-hosted flags

**Budget disqualification:** Platforms costing >2x the user's stated budget ceiling get a hard score penalty.

**Known limitation:** SAW is compensatory (high score on one criterion can compensate for low on another). We partially address this with the budget penalty but haven't implemented full disqualification.

---

## What We Need Validated

### Priority 1: Pricing Data

For each platform, we need the current pricing as of 2026. Our data may be stale.

**Search queries:**

1. `OpenAI API pricing 2026 GPT-4o GPT-4.5 per million tokens`
2. `Microsoft Copilot Studio pricing per month 2026 conversations`
3. `Salesforce Agentforce pricing per conversation enterprise 2026`
4. `ServiceNow AI Agents pricing per user license 2026`
5. `IBM watsonx Orchestrate pricing per user 2026`
6. `SAP Joule pricing AI add-on per user 2026`
7. `Tray.ai pricing plans tasks 2026`
8. `Workato pricing enterprise recipes 2026`
9. `UiPath AI pricing per robot license 2026`
10. `Zapier pricing professional team enterprise 2026 tasks`
11. `Relevance AI pricing plans tasks 2026`
12. `Boomi pricing agent studio flow 2026`
13. `n8n cloud pricing plans 2026`
14. `CrewAI enterprise pricing plans 2026`

**What we currently have and need to verify:**

| Platform | Our Price | Model | Verify? |
|----------|-----------|-------|---------|
| Amazon Bedrock | $6/$30 per 1M tokens (Claude Sonnet) | pay-per-use | Updated 3/30 — confirm |
| Anthropic Claude | $3/$15 (Sonnet 4.6), $5/$25 (Opus 4.6) | pay-per-use | Updated 3/30 from official docs |
| Google Vertex AI | $1.25/$10 (Gemini 2.5 Pro) | pay-per-use | Updated 3/30 — confirm |
| OpenAI | $2.5/$10 (GPT-4o), $5/$15 (GPT-4.5) | pay-per-use | NEEDS VERIFICATION |
| Microsoft Copilot | $200/mo for 25K messages | hybrid | NEEDS VERIFICATION |
| Salesforce | $1/conversation (enterprise negotiated) | per-conversation | NEEDS VERIFICATION |
| ServiceNow | $5,000-$17,500/mo (50-100 user bundles) | subscription | NEEDS VERIFICATION |
| IBM watsonx | $5,000-$25,000/mo (50-100 user bundles) | hybrid | NEEDS VERIFICATION |
| SAP Joule | $0-$7,500/mo (included with SAP Cloud) | subscription | NEEDS VERIFICATION |
| Tray.ai | $995-$3,495/mo | subscription | NEEDS VERIFICATION |
| Workato | $1,999-$4,999/mo | subscription | NEEDS VERIFICATION |
| UiPath | $420-$1,500/mo per robot | subscription | NEEDS VERIFICATION |
| Zapier | $49-$149/mo | subscription | NEEDS VERIFICATION |
| Relevance AI | $0-$599/mo | subscription | NEEDS VERIFICATION |
| Boomi | $2,000-$5,000/mo | subscription | NEEDS VERIFICATION |
| n8n | $0-$60/mo (cloud) | hybrid | NEEDS VERIFICATION |
| CrewAI | $0-$500/mo | hybrid | NEEDS VERIFICATION |
| AutoGen | $0 (open source) | pay-per-use | Correct (MIT license) |
| LangChain | $0 (open source) | pay-per-use | Correct (MIT license) |

### Priority 2: Compliance Certifications

We claim specific compliance certifications for each platform. These need to be verified against official sources.

**Search queries:**

15. `AWS Bedrock FedRAMP certification status 2026`
16. `Microsoft Copilot Studio FedRAMP HIPAA GDPR ISO27001 certifications`
17. `Google Vertex AI compliance certifications SOC2 HIPAA FedRAMP ISO27001`
18. `ServiceNow FedRAMP authorization ATO status`
19. `Salesforce compliance certifications HIPAA SOC2 GDPR list`
20. `IBM watsonx compliance certifications SOC2 HIPAA ISO27001`
21. `SAP Joule compliance GDPR SOC2 ISO27001`
22. `UiPath compliance certifications SOC2 HIPAA`

**What we currently claim:**

| Platform | Claimed Certs | Confidence |
|----------|--------------|------------|
| Microsoft Copilot | soc2, hipaa, gdpr, iso27001, fedramp | Medium — FedRAMP needs verification |
| Google Vertex AI | soc2, hipaa, iso27001, fedramp | Medium — FedRAMP needs verification |
| ServiceNow | soc2, hipaa, iso27001, fedramp | Medium — FedRAMP needs verification |
| Amazon Bedrock | soc2, hipaa, fedramp | Medium — FedRAMP via GovCloud? |
| Salesforce | soc2, hipaa, gdpr | High — well-documented |
| IBM watsonx | soc2, hipaa, iso27001 | Medium |
| Others | soc2 at minimum | Low-Medium |

### Priority 3: Platform Capabilities

Verify our `structuredCapabilities` claims — particularly RAG, multi-modal, low-code, and use case strengths.

**Search queries:**

23. `Microsoft Copilot Studio RAG capabilities Azure AI Search SharePoint 2026`
24. `Amazon Bedrock Agents multi-agent collaboration capabilities 2026`
25. `Google Vertex AI Agent Builder Document AI OCR grounding capabilities`
26. `Salesforce Agentforce Data Cloud knowledge base RAG capabilities`
27. `ServiceNow AI Agents Now Assist Virtual Agent CMDB knowledge capabilities`
28. `LangGraph vs CrewAI vs AutoGen multi-agent framework comparison 2026`
29. `IBM watsonx Orchestrate skills catalog capabilities use cases`
30. `UiPath AI Document Understanding OCR capabilities 2026`

### Priority 4: Scoring Methodology

Validate our approach against industry best practices.

**Search queries:**

31. `multi-criteria decision analysis SAW TOPSIS comparison limitations software evaluation`
32. `Gartner Magic Quadrant AI agent platforms 2025 2026 criteria` (likely paywalled — look for summaries)
33. `Forrester Wave AI agents 2025 2026 evaluation criteria` (likely paywalled)
34. `how to evaluate enterprise AI agent platforms criteria framework`
35. `vendor neutral software comparison methodology best practices`

**Our approach vs industry standard:**

| Dimension | Our Approach | Industry Standard (Gartner/Forrester) |
|-----------|-------------|--------------------------------------|
| Criteria count | 5 weighted + 6 informational | 15-20 weighted |
| Methodology | SAW with min-max normalization | Proprietary (Magic Quadrant uses 2-axis) |
| Data source | Self-attested structured YAML | Vendor submissions + analyst validation |
| User input | 4-step questionnaire (~12 fields) | Typically 50-100 requirement fields |
| Output | Ranked list + match report | Quadrant placement + detailed profile |

### Priority 5: Market Context (for README)

**Search queries:**

36. `enterprise AI agent market size 2025 2026 growth`
37. `how many companies evaluating AI agent platforms 2026`
38. `AI agent adoption challenges enterprise 2026`
39. `vendor neutral AI platform comparison tools alternatives`
40. `AI agent platform landscape categories 2026`

### Priority 6: Anthropic-Specific (using their AI SDK)

**Search queries:**

41. `Anthropic building effective agents best practices architecture patterns`
42. `Model Context Protocol MCP what it does tool integration`
43. `Claude extended thinking mode when to use vs standard`
44. `Vercel AI SDK structured outputs Zod schema generateObject`

---

## How to Use These Results

1. **Pricing**: Update the `pricing` section in each platform's MDX file (`content/platforms/*.mdx`). Update `lastVerified` date.

2. **Compliance**: Update `complianceCerts` array in `structuredCapabilities`. Remove any we can't verify. Add any we missed.

3. **Capabilities**: Update `structuredCapabilities` flags (hasRAG, hasMultiModal, etc.) and `useCaseStrengths` array.

4. **Methodology**: If research surfaces a better approach than SAW, document it in `.planning/REDESIGN-SCORING-RESULTS.md` for potential future implementation.

5. **Market context**: Use for the README.md hero section to establish credibility ("The enterprise AI agent market is projected to reach $X by 2027...").

---

## After Research: Next Steps

- [ ] Update all platform MDX files with verified data
- [ ] Update lastVerified dates
- [ ] Write README.md with market context
- [ ] Deploy to Vercel
- [ ] Take screenshots for repo

*Created: 2026-03-30*
