# Architecture Patterns

**Domain:** Decision Support / Enterprise Assessment Tool
**Researched:** 2026-02-05
**Confidence:** MEDIUM-HIGH

## Recommended Architecture

The enterprise agent decision toolkit should follow a **modular, separation-of-concerns architecture** combining:

1. **Frontend:** React-based SPA with component-driven UI
2. **Backend:** RESTful API layer with business logic services
3. **Data Layer:** Structured content model for platform/blueprint data
4. **Engine Layer:** Isolated recommendation and calculation engines

```
┌─────────────────────────────────────────────────────────────┐
│                     PRESENTATION LAYER                       │
│  ┌────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │ Multi-Step │  │ Results      │  │ Admin/Content      │  │
│  │ Form UI    │  │ Dashboard    │  │ Management UI      │  │
│  └────────────┘  └──────────────┘  └────────────────────┘  │
│         React Components + State Management (Zustand)        │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                       │
│            RESTful API (Express/Next.js API Routes)          │
│  ┌──────────────┐  ┌────────────────┐  ┌──────────────┐   │
│  │ Form Data    │  │ Recommendation │  │ Content      │   │
│  │ Endpoints    │  │ Endpoints      │  │ Endpoints    │   │
│  └──────────────┘  └────────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    BUSINESS LOGIC LAYER                      │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐  │
│  │ Questionnaire │  │ Recommendation│  │ Cost          │  │
│  │ Flow Engine   │  │ Engine        │  │ Calculator    │  │
│  └───────────────┘  └───────────────┘  └───────────────┘  │
│  ┌───────────────┐  ┌───────────────┐                     │
│  │ Diagram       │  │ Timeline      │                     │
│  │ Generator     │  │ Estimator     │                     │
│  └───────────────┘  └───────────────┘                     │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                        DATA LAYER                            │
│  ┌───────────────────────┐  ┌──────────────────────────┐   │
│  │ Platform Data Model   │  │ Blueprint Content Model  │   │
│  │ - Capabilities        │  │ - Use Case Templates     │   │
│  │ - Pricing Tiers       │  │ - Architecture Patterns  │   │
│  │ - Pros/Cons           │  │ - Implementation Steps   │   │
│  │ - Requirements        │  │ - Best Practices         │   │
│  └───────────────────────┘  └──────────────────────────┘   │
│           JSON/TypeScript Schema or Headless CMS             │
└─────────────────────────────────────────────────────────────┘
```

### Component Boundaries

| Component | Responsibility | Communicates With | Input | Output |
|-----------|---------------|-------------------|-------|--------|
| **Questionnaire Flow Engine** | Manages multi-step form logic, conditional branching, validation | API Gateway, State Manager | User responses, flow rules | Validated assessment data |
| **Recommendation Engine** | Applies rule-based scoring to match platforms with requirements | Cost Calculator, Platform Data | Assessment data, platform capabilities | Ranked platform matches with scores |
| **Cost Calculator** | Computes pricing estimates based on usage parameters | Recommendation Engine, Timeline Estimator | Platform pricing tiers, usage inputs | Cost breakdown, TCO estimates |
| **Diagram Generator** | Creates architecture visualizations | Results Dashboard, Blueprint Data | Blueprint template, user selections | SVG/PNG architecture diagram |
| **Timeline Estimator** | Calculates implementation timeline | Results Dashboard, Blueprint Data | Project scope, team size, complexity | Phase-based timeline estimate |
| **Platform Data Model** | Stores structured platform information | Recommendation Engine, Admin UI | Platform specifications | Query results, comparison data |
| **Blueprint Content Model** | Manages use case templates and patterns | Diagram Generator, Results Dashboard | Use case metadata | Template content, pattern guides |
| **State Manager** | Maintains application and form state | All UI components | User actions | Synchronized state |
| **API Gateway** | Routes requests, handles auth, rate limiting | All engines, external services | HTTP requests | JSON responses |

### Data Flow

**User Journey Flow:**

```
1. User starts questionnaire
   └─> Questionnaire Flow Engine loads step 1

2. User answers questions (stack, use cases, constraints)
   └─> State Manager captures responses
   └─> Flow Engine determines next step (conditional logic)

3. User submits completed questionnaire
   └─> API Gateway validates and forwards to Recommendation Engine

4. Recommendation Engine processes:
   └─> Queries Platform Data Model for all platforms
   └─> Applies rule-based scoring against user requirements
   └─> Filters incompatible platforms (hard constraints)
   └─> Ranks compatible platforms (weighted scoring)
   └─> Forwards top matches to Cost Calculator

5. Cost Calculator computes:
   └─> Fetches pricing tiers for recommended platforms
   └─> Applies usage parameters from questionnaire
   └─> Calculates monthly/annual costs + TCO
   └─> Returns cost data to Results Dashboard

6. Timeline Estimator calculates:
   └─> Loads blueprint for selected use case
   └─> Adjusts timeline based on team size, complexity factors
   └─> Returns phase breakdown

7. Diagram Generator creates:
   └─> Fetches blueprint architecture template
   └─> Customizes with user's selected stack/platform
   └─> Renders SVG/PNG diagram

8. Results Dashboard displays:
   └─> Platform recommendation with justification
   └─> Cost breakdown (monthly, annual, 3-year TCO)
   └─> Architecture diagram
   └─> Implementation timeline
   └─> Next steps / resources
```

**Admin Content Management Flow:**

```
1. Admin logs into CMS interface
   └─> Authenticates via API Gateway

2. Admin updates platform data:
   └─> Edits capabilities, pricing, pros/cons
   └─> Validates schema compliance
   └─> Saves to Platform Data Model

3. Admin updates blueprint content:
   └─> Modifies use case templates
   └─> Updates architecture patterns
   └─> Adjusts timeline estimates
   └─> Saves to Blueprint Content Model

4. Changes immediately available:
   └─> Recommendation Engine uses latest data
   └─> Diagram Generator uses updated templates
```

## Patterns to Follow

### Pattern 1: State Machine for Questionnaire Flow

**What:** Use explicit state machine to manage multi-step form progression with conditional branching

**When:** Questionnaire has complex conditional logic (e.g., "If enterprise compliance = yes, ask additional security questions")

**Why:** Prevents spaghetti logic, makes flow testable, enables visualization of user paths

**Example:**
```typescript
// Using XState or custom state machine
interface QuestionnaireState {
  currentStep: string;
  answers: Record<string, any>;
  history: string[];
}

const questionnaireFlow = {
  initial: 'stack',
  states: {
    stack: {
      on: { NEXT: 'useCases' }
    },
    useCases: {
      on: {
        NEXT: [
          { target: 'compliance', cond: 'isEnterprise' },
          { target: 'budget' }
        ]
      }
    },
    compliance: {
      on: { NEXT: 'budget' }
    },
    budget: {
      on: { NEXT: 'summary' }
    },
    summary: {
      on: { SUBMIT: 'complete' }
    }
  }
};
```

### Pattern 2: Rule-Based Recommendation with Weighted Scoring

**What:** Apply explicit, transparent rules to score platforms against requirements

**When:** Users need to understand WHY a platform was recommended

**Why:**
- Explainable recommendations (vs black-box ML)
- Deterministic results (same inputs = same outputs)
- Easy to update rules without retraining models
- Builds user trust through transparency

**Example:**
```typescript
interface ScoringRule {
  criterion: string;
  weight: number;
  evaluate: (platform: Platform, requirements: Requirements) => number;
}

const scoringRules: ScoringRule[] = [
  {
    criterion: 'Stack Compatibility',
    weight: 0.25,
    evaluate: (platform, req) => {
      const matches = platform.supportedLanguages.filter(
        lang => req.stack.includes(lang)
      ).length;
      return matches / req.stack.length;
    }
  },
  {
    criterion: 'Compliance Requirements',
    weight: 0.30,
    evaluate: (platform, req) => {
      if (req.compliance.includes('HIPAA') && !platform.certifications.includes('HIPAA')) {
        return 0; // Hard constraint - disqualifies platform
      }
      const matches = platform.certifications.filter(
        cert => req.compliance.includes(cert)
      ).length;
      return req.compliance.length > 0 ? matches / req.compliance.length : 1;
    }
  },
  {
    criterion: 'Budget Fit',
    weight: 0.20,
    evaluate: (platform, req) => {
      const estimatedCost = calculateMonthlyCost(platform, req.usage);
      if (estimatedCost > req.maxBudget) return 0; // Hard constraint
      return 1 - (estimatedCost / req.maxBudget);
    }
  },
  {
    criterion: 'Feature Coverage',
    weight: 0.25,
    evaluate: (platform, req) => {
      const matches = req.requiredFeatures.filter(
        feature => platform.capabilities.includes(feature)
      ).length;
      return matches / req.requiredFeatures.length;
    }
  }
];

function recommendPlatforms(requirements: Requirements): RankedPlatform[] {
  const platforms = getPlatformData();

  const scored = platforms.map(platform => {
    const scores = scoringRules.map(rule => ({
      criterion: rule.criterion,
      score: rule.evaluate(platform, requirements),
      weight: rule.weight
    }));

    const totalScore = scores.reduce(
      (sum, s) => sum + (s.score * s.weight),
      0
    );

    // Filter out platforms that failed hard constraints (score = 0)
    const hasHardConstraintFailure = scores.some(s => s.weight > 0.2 && s.score === 0);

    return {
      platform,
      totalScore,
      scoreBreakdown: scores,
      disqualified: hasHardConstraintFailure
    };
  });

  return scored
    .filter(s => !s.disqualified)
    .sort((a, b) => b.totalScore - a.totalScore);
}
```

### Pattern 3: Template + Customization for Diagram Generation

**What:** Store blueprint architecture diagrams as templates with substitution variables

**When:** Multiple users need similar diagrams customized with their specific platforms/stack

**Why:**
- Maintains design consistency
- Reduces generation complexity
- Easy for non-technical admins to update
- Fast rendering (no AI inference delays)

**Example:**
```typescript
interface DiagramTemplate {
  id: string;
  useCase: string;
  svgTemplate: string; // SVG with {{placeholders}}
  variables: {
    name: string;
    type: 'platform' | 'service' | 'dataStore';
    defaultValue: string;
  }[];
}

// Template stored in Blueprint Content Model
const chatbotTemplate: DiagramTemplate = {
  id: 'chatbot-architecture',
  useCase: 'Customer Support Chatbot',
  svgTemplate: `
    <svg viewBox="0 0 800 600">
      <rect x="50" y="50" width="200" height="100" />
      <text x="150" y="100">{{webApp}}</text>

      <rect x="300" y="50" width="200" height="100" />
      <text x="400" y="100">{{agentPlatform}}</text>

      <rect x="550" y="50" width="200" height="100" />
      <text x="650" y="100">{{llmProvider}}</text>

      <line x1="250" y1="100" x2="300" y2="100" />
      <line x1="500" y1="100" x2="550" y2="100" />
    </svg>
  `,
  variables: [
    { name: 'webApp', type: 'platform', defaultValue: 'Web UI' },
    { name: 'agentPlatform', type: 'platform', defaultValue: 'Agent Platform' },
    { name: 'llmProvider', type: 'service', defaultValue: 'LLM API' }
  ]
};

function generateDiagram(
  templateId: string,
  customizations: Record<string, string>
): string {
  const template = getBlueprintTemplate(templateId);

  let svg = template.svgTemplate;
  template.variables.forEach(variable => {
    const value = customizations[variable.name] || variable.defaultValue;
    svg = svg.replace(`{{${variable.name}}}`, value);
  });

  return svg;
}
```

### Pattern 4: Modular Data Model with Schema Validation

**What:** Define platform and blueprint data with strict TypeScript schemas

**When:** Building a system where data quality directly impacts recommendation accuracy

**Why:**
- Prevents invalid data from entering system
- Enables autocomplete and type checking in admin UI
- Self-documenting data structure
- Easy to version control and review changes

**Example:**
```typescript
// Platform Data Schema
interface Platform {
  id: string;
  name: string;
  vendor: string;
  category: 'framework' | 'managed_service' | 'platform';

  capabilities: Capability[];
  supportedLanguages: Language[];
  certifications: Certification[];

  pricing: {
    model: 'usage' | 'flat_rate' | 'per_seat' | 'hybrid';
    tiers: PricingTier[];
    calculationFormula: string; // For cost calculator
  };

  pros: string[];
  cons: string[];

  requirements: {
    technicalSkills: SkillLevel[];
    minimumTeamSize: number;
    infrastructureNeeds: string[];
  };

  metadata: {
    lastUpdated: string;
    sourceUrls: string[];
    reviewedBy: string;
  };
}

// Blueprint Data Schema
interface Blueprint {
  id: string;
  useCase: string;
  description: string;

  applicableTo: {
    industries: string[];
    organizationSizes: ('startup' | 'smb' | 'enterprise')[];
    complexityLevel: 'simple' | 'moderate' | 'complex';
  };

  architecture: {
    diagramTemplateId: string;
    components: Component[];
    dataFlow: string;
    scalabilityConsiderations: string;
  };

  implementation: {
    phases: Phase[];
    estimatedTimelineDays: number;
    teamRequirements: {
      roles: string[];
      minimumSize: number;
    };
  };

  bestPractices: string[];
  commonPitfalls: string[];

  metadata: {
    lastUpdated: string;
    sourceUrls: string[];
    reviewedBy: string;
  };
}

// Validation using Zod (recommended for runtime checks)
import { z } from 'zod';

const PlatformSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  vendor: z.string(),
  category: z.enum(['framework', 'managed_service', 'platform']),
  capabilities: z.array(z.string()),
  supportedLanguages: z.array(z.string()),
  certifications: z.array(z.string()),
  pricing: z.object({
    model: z.enum(['usage', 'flat_rate', 'per_seat', 'hybrid']),
    tiers: z.array(z.object({
      name: z.string(),
      pricePerMonth: z.number(),
      limits: z.record(z.number())
    })),
    calculationFormula: z.string()
  }),
  pros: z.array(z.string()).min(2),
  cons: z.array(z.string()).min(2),
  requirements: z.object({
    technicalSkills: z.array(z.string()),
    minimumTeamSize: z.number().min(1),
    infrastructureNeeds: z.array(z.string())
  }),
  metadata: z.object({
    lastUpdated: z.string().datetime(),
    sourceUrls: z.array(z.string().url()),
    reviewedBy: z.string()
  })
});

// Validate before saving to data model
function savePlatform(data: unknown): Platform {
  const validated = PlatformSchema.parse(data); // Throws if invalid
  // Save to data store
  return validated;
}
```

### Pattern 5: Separation of Concerns via Backend-for-Frontend (BFF)

**What:** Create dedicated API layer optimized for frontend needs, separate from business logic

**When:** Frontend needs data in specific formats or aggregations not directly available from services

**Why:**
- Frontend doesn't depend on business logic implementation details
- Can optimize responses for UI needs (reduce over-fetching)
- Easy to add new frontends (mobile, CLI) without changing backend
- Clear API contract between layers

**Example:**
```typescript
// API Gateway Layer (BFF)
// /api/assessment/recommend
app.post('/api/assessment/recommend', async (req, res) => {
  const { answers } = req.body;

  // Validate request
  const validation = AssessmentSchema.safeParse(answers);
  if (!validation.success) {
    return res.status(400).json({ errors: validation.error });
  }

  // Call business logic services
  const recommendations = await recommendationEngine.recommend(answers);
  const costs = await costCalculator.calculateAll(recommendations, answers.usage);
  const timeline = await timelineEstimator.estimate(answers.useCase, answers.teamSize);

  // Format for frontend
  const response = {
    topRecommendation: {
      platform: recommendations[0].platform,
      matchScore: recommendations[0].totalScore,
      reasoning: recommendations[0].scoreBreakdown.map(s => ({
        criterion: s.criterion,
        verdict: s.score > 0.7 ? 'Strong fit' : s.score > 0.4 ? 'Adequate' : 'Weak fit'
      })),
      estimatedCost: costs[0],
      timeline: timeline
    },
    alternatives: recommendations.slice(1, 4).map(r => ({
      platform: r.platform,
      matchScore: r.totalScore,
      costComparison: costs.find(c => c.platformId === r.platform.id)
    }))
  };

  res.json(response);
});
```

## Anti-Patterns to Avoid

### Anti-Pattern 1: Tight Coupling Between Recommendation Logic and UI

**What:** Putting recommendation scoring rules directly in React components

**Why bad:**
- Cannot test recommendation logic without rendering components
- Hard to reuse recommendation engine for other interfaces (API, CLI)
- Difficult to update rules without modifying UI code
- State management becomes complex and error-prone

**Instead:**
- Isolate recommendation engine as pure function or service
- UI components call engine via API or service layer
- Engine returns structured data, UI decides how to display

### Anti-Pattern 2: Storing Platform Data in Component State or Code

**What:** Hardcoding platform details in TypeScript constants within components

**Why bad:**
- Requires code deployment to update platform info (pricing changes frequently)
- No versioning or audit trail for data changes
- Cannot easily diff or review data changes in PRs
- Non-technical stakeholders cannot update content

**Instead:**
- Store platform/blueprint data in JSON files (version controlled) or headless CMS
- Expose admin UI for content updates
- Use schema validation to ensure data quality
- Hot-reload data without redeploying application

### Anti-Pattern 3: Monolithic "Calculate Everything" Function

**What:** Single large function that handles recommendation, cost calculation, timeline estimation, and diagram generation

**Why bad:**
- Difficult to test individual pieces
- Cannot reuse parts independently (e.g., just cost calculator)
- Changes to one concern affect all others
- Performance issues (must wait for all calculations even if user only needs some)

**Instead:**
- Separate engines with single responsibilities
- Compose engines via orchestration layer (API Gateway or BFF)
- Allow frontend to request only needed computations
- Each engine testable and deployable independently

### Anti-Pattern 4: Client-Side Cost Calculation with Exposed Pricing Logic

**What:** Calculating costs entirely in browser with visible pricing formulas

**Why bad:**
- Pricing logic visible in source code (competitors can copy)
- Users can manipulate calculations
- Cannot update pricing without frontend deployment
- Security risk for enterprise pricing tiers

**Instead:**
- Perform cost calculations server-side
- Return results to frontend, not formulas
- Apply business rules and access control on server
- Frontend displays results but doesn't compute them

### Anti-Pattern 5: No Validation Between Layers

**What:** Assuming data passed between components/layers is valid

**Why bad:**
- Runtime errors from malformed data crash application
- Security vulnerabilities from injection attacks
- Difficult to debug (error occurs far from source)
- No clear contract between services

**Instead:**
- Use schema validation (Zod, Yup) at API boundaries
- TypeScript interfaces + runtime validation for robustness
- Validate inputs at service entry points
- Return typed errors for validation failures

### Anti-Pattern 6: Overly Complex Questionnaire State Machine

**What:** Building elaborate state machine with dozens of states and complex transitions for every edge case

**Why bad:**
- Difficult to understand and maintain
- Small changes require updating many transitions
- Over-engineering for simple linear flows
- Testing becomes exponentially complex

**Instead:**
- Use state machine for genuinely complex flows with branching
- Simple linear forms can use basic step tracking (current step index)
- Separate flow logic (which step next) from validation (is this step complete)
- Document state machine visually for team understanding

## Scalability Considerations

| Concern | At 100 users | At 10K users | At 1M users |
|---------|--------------|--------------|-------------|
| **Platform Data Storage** | JSON files in repo | JSON files or simple DB (SQLite) | Headless CMS (Contentful, Strapi) or PostgreSQL with caching |
| **Recommendation Engine** | Synchronous API calls | Same (stateless compute is fast) | Add Redis cache for common queries, CDN for static results |
| **Diagram Generation** | On-demand SVG generation | Same (SVG generation is lightweight) | Pre-generate common diagrams, cache per blueprint + platform combo |
| **Cost Calculation** | Compute on every request | Same (computation is cheap) | Cache pricing data, update hourly rather than per request |
| **Frontend Hosting** | Vercel/Netlify free tier | Same (static assets + API routes) | CDN distribution (Cloudflare, AWS CloudFront) |
| **State Management** | Client-side only (Zustand) | Same | Consider server-side session storage for long questionnaires |
| **Analytics** | Basic (Google Analytics) | Add user flow tracking | Custom analytics pipeline for conversion optimization |
| **Content Updates** | Manual file edits + deploy | Admin UI writing to files + deploy | Headless CMS with webhook-triggered builds |

### Performance Targets

| Metric | Target | Reasoning |
|--------|--------|-----------|
| Questionnaire step transition | < 100ms | Feels instant to user |
| Recommendation generation | < 2s | Acceptable "calculating" delay |
| Full results page load | < 3s | Includes recommendation, cost, diagram, timeline |
| Diagram generation | < 1s | Can show loading spinner if needed |
| Cost calculation | < 500ms | Should be near-instant |

### Scaling Strategy

**Phase 1: Static Site + Serverless (0-10K users)**
- Next.js with static generation for marketing pages
- API routes for dynamic recommendation logic
- Platform/blueprint data in JSON files
- Deploy to Vercel/Netlify
- Cost: $0-50/month

**Phase 2: Add Caching + Database (10K-100K users)**
- Move platform data to PostgreSQL or headless CMS
- Add Redis for caching frequent queries
- Upgrade to paid hosting tier
- CDN for diagram assets
- Cost: $100-500/month

**Phase 3: Microservices + CDN (100K-1M users)**
- Extract recommendation engine to separate service
- Distribute via CDN (Cloudflare, AWS CloudFront)
- Pre-generate common diagrams
- Advanced analytics and A/B testing
- Cost: $1K-5K/month

## Build Order and Dependencies

The following build order minimizes rework and allows for incremental testing:

### Phase 1: Foundation (Week 1-2)
**Goal:** Establish data models and basic structure

1. **Define TypeScript schemas** for Platform and Blueprint
   - No dependencies
   - Enables parallel work on all other components
   - Validate with mock data

2. **Create Platform Data Model** (JSON files or simple DB)
   - Depends on: Schema definitions
   - Start with 3-4 platforms for testing
   - Include all required fields even if incomplete

3. **Create Blueprint Content Model** (JSON files or simple DB)
   - Depends on: Schema definitions
   - Start with 1-2 use cases
   - Include basic architecture templates

**Why this order:** Data models are foundation for all other work. Define contracts first, implementation later.

### Phase 2: Core Engine (Week 3-4)
**Goal:** Build recommendation logic independent of UI

4. **Build Recommendation Engine**
   - Depends on: Platform Data Model, schemas
   - Pure functions, no UI coupling
   - Test with mock questionnaire answers
   - Return ranked list of platforms with scores

5. **Build Cost Calculator**
   - Depends on: Platform Data Model (pricing info)
   - Can develop in parallel with recommendation engine
   - Test with various usage scenarios

6. **Build Timeline Estimator**
   - Depends on: Blueprint Content Model
   - Simple algorithm based on complexity factors
   - Can develop in parallel with cost calculator

**Why this order:** Engines are pure business logic. Build and test thoroughly before adding UI or API layers.

### Phase 3: API Layer (Week 5)
**Goal:** Create backend-for-frontend API

7. **Build API Gateway / BFF**
   - Depends on: All engines (recommendation, cost, timeline)
   - Express or Next.js API routes
   - Define endpoint contracts first
   - Implement request validation
   - Test with curl/Postman before building UI

**Why this order:** API provides stable interface for frontend. Finalize API contracts before UI work begins.

### Phase 4: User Interface (Week 6-8)
**Goal:** Build user-facing application

8. **Build Questionnaire Flow Engine**
   - Depends on: API Gateway, state management decision
   - Start with linear flow, add branching later
   - Use Zustand for state management
   - Test navigation and validation

9. **Build Results Dashboard**
   - Depends on: API Gateway, Recommendation Engine output format
   - Display recommendation, costs, timeline
   - Placeholder for diagram initially
   - Focus on clear information hierarchy

10. **Build Diagram Generator**
    - Depends on: Blueprint Content Model (templates)
    - Can develop late since non-critical for MVP
    - Start with simple SVG substitution
    - Integrate into results dashboard

**Why this order:** UI is last because it depends on everything else. Questionnaire flow must be solid before results display. Diagram generation is least critical, can be added after MVP.

### Phase 5: Content Management (Week 9-10)
**Goal:** Enable non-developers to update content

11. **Build Admin UI (if needed)**
    - Depends on: Data Models, API for content updates
    - CRUD operations for platforms and blueprints
    - Schema validation in UI
    - Version control integration or CMS

**Why this order:** Content management can come after initial content is created manually. Not needed for MVP launch.

### Critical Path Dependencies

```
Schemas
  ├─> Platform Data Model ──┐
  │                         ├─> Recommendation Engine ──┐
  │                         └─> Cost Calculator ────────┤
  │                                                      │
  └─> Blueprint Data Model ─────> Timeline Estimator ───┤
                                                         │
                                    API Gateway <────────┘
                                         │
                    ┌────────────────────┼────────────────────┐
                    │                    │                    │
            Questionnaire UI      Results Dashboard    Diagram Generator
```

**Parallelization Opportunities:**
- Platform Data Model + Blueprint Data Model (parallel)
- Recommendation Engine + Cost Calculator + Timeline Estimator (parallel after data models ready)
- Questionnaire UI + Results Dashboard skeleton (parallel after API ready)

**MVP Scope (Can Launch Without):**
- Diagram generation (show text description instead)
- Admin UI (update JSON files manually)
- Timeline estimation (show standard timeline)
- Advanced questionnaire branching (start with linear)

## Technology Alignment

This architecture pairs well with the following stack:

**Frontend:**
- React 18+ with TypeScript
- Next.js 14+ (App Router for SSR/SSG + API routes)
- Zustand for state management (lightweight, 2KB)
- React Hook Form + Zod for questionnaire validation
- TailwindCSS for styling

**Backend:**
- Next.js API routes (serverless functions)
- Express.js (if separate backend needed)
- TypeScript for type safety across stack

**Data Layer:**
- JSON files in repo (MVP, 0-1K users)
- PostgreSQL with Prisma (scaling phase)
- Contentful/Strapi (headless CMS for non-technical editors)

**Diagram Generation:**
- SVG templates with string substitution (simple, fast)
- D3.js or Mermaid (if dynamic generation needed)

**Deployment:**
- Vercel or Netlify (frontend + serverless backend)
- AWS Lambda + API Gateway (separate backend alternative)
- Cloudflare CDN (for global distribution)

## Sources

**Decision Support System Architecture:**
- [Decision Support Systems: Technical Architecture and Application Practices](https://www.oreateai.com/blog/decision-support-systems-technical-architecture-and-application-practices-for-datadriven-decision-making/009862aea8296224187fa9210bf64ec7)
- [Technical Review: AI-Driven Decision Support System](https://www.mdpi.com/1999-5903/17/9/383)

**Web Application Architecture (2026):**
- [Web Application Architecture: The Latest Guide (2026 AI Update)](https://www.clickittech.com/software-development/web-application-architecture/)
- [Modern Web Application Architecture in 2026: A Practical Guide](https://quokkalabs.com/blog/modern-web-application-architecture/)
- [Exploring Modern Web App Architectures: Trends and Best Practices for 2026](https://tech-stack.com/blog/modern-application-development/)

**Questionnaire/Form Flow:**
- [GitHub - questionnaire-engine](https://github.com/Praqma/questionnaire-engine)
- [Managing State in a Multi-Step Form](https://birdeatsbug.com/blog/managing-state-in-a-multi-step-form)

**Recommendation Systems:**
- [Recommendation Systems: Applications and Examples](https://research.aimultiple.com/recommendation-system/)
- [What is a Recommendation Engine? - IBM](https://www.ibm.com/think/topics/recommendation-engine)
- [Aman's AI Journal - Recommendation Systems Architectures](https://aman.ai/recsys/architectures/)
- [Rule-based Recommendations](https://www.metabase.com/community-posts/rule-based-recommendations)

**Comparison Tools & UI Patterns:**
- [Comparison Tables for Products - Nielsen Norman Group](https://www.nngroup.com/articles/comparison-tables/)
- [Vue vs React: A Complete 2026 Comparison](https://www.thefrontendcompany.com/posts/vue-vs-react)

**Configuration Engines:**
- [Best Product Configurator Software Options in 2026](https://www.salesforce.com/sales/revenue-lifecycle-management/product-configurator-software/)
- [Top 10 Enterprise Architecture Tools in 2026](https://www.superblocks.com/blog/enterprise-architecture-tools)

**Diagram Generation:**
- [AI Architecture Diagram Generator](https://www.eraser.io/ai/architecture-diagram-generator)
- [GitHub - next-ai-draw-io](https://github.com/DayuanJiang/next-ai-draw-io)
- [Architecture Diagram Basics & Best Practices](https://vfunction.com/blog/architecture-diagram-guide/)

**Vendor Comparison & Multi-Criteria Decision:**
- [The Essential IT Vendor Selection Criteria Checklist](https://technologymatch.com/blog/the-essential-it-vendor-selection-criteria-and-checklist)
- [IT Vendor Scorecard Template + Guide](https://www.oneio.cloud/blog/it-vendor-scorecard-template)
- [Shyft Vendor Comparison Matrix](https://www.myshyft.com/blog/vendor-comparison-matrix/)
- [How to Build & Use a Vendor Comparison Matrix](https://ramp.com/blog/vendor-comparison-matrix)

**Content Management Systems:**
- [Structured Content: The Ultimate 2026 Guide](https://www.heretto.com/blog/structured-content)
- [Top Content Management Systems for Websites in 2026](https://www.ingeniux.com/blog/top-content-management-systems-for-websites-in-2026)
- [Content Architecture: Building Scalable Systems](https://www.aprimo.com/blog/content-architecture)
- [Component Content Management System - Hygraph](https://hygraph.com/blog/what-is-a-component-content-management-system)

**State Management (React 2026):**
- [7 Top React State Management Libraries in 2026](https://trio.dev/7-top-react-state-management-libraries/)
- [React Hook Form Multi-Step Tutorial: Zustand + Zod](https://www.buildwithmatija.com/blog/master-multi-step-forms-build-a-dynamic-react-form-in-6-simple-steps)
- [State Management in 2026: Redux, Context API, and Modern Patterns](https://www.nucamp.co/blog/state-management-in-2026-redux-context-api-and-modern-patterns)

**Separation of Concerns & Backend-for-Frontend:**
- [Front-End Architecture: In-Depth Analysis for 2026](https://elitex.systems/blog/front-end-architecture-in-depth-analysis)
- [Backend for Frontend (BFF) Architecture Guide](https://talent500.com/blog/backend-for-frontend-bff-architecture-guide/)
- [Backends for Frontends Pattern - Azure](https://learn.microsoft.com/en-us/azure/architecture/patterns/backends-for-frontends)
- [Common Web Application Architectures - Microsoft](https://learn.microsoft.com/en-us/dotnet/architecture/modern-web-apps-azure/common-web-application-architectures)

**Data Modeling & Pricing:**
- [Complete Data Catalog Pricing Guide for 2026](https://www.ovaledge.com/blog/data-catalog-pricing-guide)
- [Data Catalog Pricing: Costs, Models & Hidden Fees 2026](https://atlan.com/data-catalog-pricing/)
- [Top 10 Data Modeling Tools in 2026](https://blog.skyvia.com/top-data-modeling-tools/)

**Cost Calculation & Scalability:**
- [How to Build a Scalable Web Application: 2026 Guide](https://www.weweb.io/blog/how-to-build-a-scalable-web-application)
- [Web Application Development Cost: Detailed Estimation for 2026](https://www.cleveroad.com/blog/web-app-development-cost/)
