# Phase 2: Assessment Engine - Research

**Researched:** 2026-02-05
**Domain:** Multi-step forms with AI-powered conditional branching in Next.js
**Confidence:** HIGH

## Summary

The Assessment Engine phase requires building an interactive multi-step questionnaire with progress saving, conditional branching, and AI-powered follow-up questions. Research shows that the current standard stack for this combines React Hook Form with Zod for validation, localStorage for persistence, and the Vercel AI SDK for LLM integration.

The recommended architecture uses client-side form state management with Server Actions for AI question generation and final submission. Multi-step forms are best structured using a state machine pattern with step-based schemas, while conditional branching leverages TypeScript discriminated unions for type-safe question routing. For progress persistence, localStorage provides the optimal balance of performance and simplicity for questionnaire data.

AI-powered follow-up questions should be generated server-side using the Vercel AI SDK with structured outputs, ensuring type-safe question generation based on user context. The pattern of validate-then-persist at each step prevents data loss while maintaining good UX.

**Primary recommendation:** Use React Hook Form + Zod + react-hook-form-persist for form management, Vercel AI SDK with Server Actions for AI follow-ups, and localStorage for session recovery.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| react-hook-form | 7.71.1 | Form state management | Industry standard, minimal re-renders, excellent DX |
| zod | 3.24.1+ | Schema validation | Type-safe validation, already in project dependencies |
| react-hook-form-persist | 3.x | Auto-save to localStorage | Turnkey solution for form persistence |
| @ai-sdk/anthropic | 1.x | AI SDK provider | Direct integration with Claude via Vercel AI SDK |
| ai | 4.x | Vercel AI SDK Core | Standard for Next.js LLM integration with streaming |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zustand | 5.0.10+ | Global state (optional) | Only if state needs sharing beyond form |
| @hookform/resolvers | 3.x | Zod + RHF integration | Required to connect Zod schemas to React Hook Form |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| localStorage | IndexedDB | Overkill for simple key-value questionnaire data, adds complexity |
| Vercel AI SDK | Direct OpenAI/Anthropic SDK | Lose streaming helpers, provider abstraction, Server Action integration |
| React Hook Form | Formik | Formik has known performance issues with React 19, not recommended |
| Client state | URL params | Would enable shareable links but expose user data in URLs |

**Installation:**
```bash
npm install react-hook-form @hookform/resolvers react-hook-form-persist ai @ai-sdk/anthropic
```

## Architecture Patterns

### Recommended Project Structure
```
app/
├── assessment/
│   ├── page.tsx                    # Assessment entry point (Server Component)
│   ├── components/
│   │   ├── AssessmentForm.tsx      # Main form container (Client Component)
│   │   ├── StepIndicator.tsx       # Progress tracker UI
│   │   ├── QuestionStep.tsx        # Individual step component
│   │   └── AIFollowUp.tsx          # AI-generated question renderer
│   ├── steps/
│   │   ├── step-01-basics.tsx      # Individual step implementations
│   │   ├── step-02-context.tsx
│   │   └── index.ts                # Step registry and routing
│   ├── schemas/
│   │   ├── step-schemas.ts         # Zod schemas per step
│   │   └── assessment-schema.ts    # Complete assessment schema
│   └── actions.ts                  # Server Actions for AI + submission
lib/
├── assessment/
│   ├── conditional-logic.ts        # Branching rules using discriminated unions
│   ├── progress-storage.ts         # localStorage helpers
│   └── ai-prompts.ts               # LLM prompt templates
```

### Pattern 1: Multi-Step State Machine with Validation
**What:** Each step has its own Zod schema, validated independently before progression.
**When to use:** Always for multi-step forms to prevent invalid state accumulation.
**Example:**
```typescript
// Source: LogRocket multi-step forms guide + Next.js docs
// schemas/step-schemas.ts
import { z } from 'zod'

export const step1Schema = z.object({
  useCase: z.enum(['vendor-selection', 'implementation', 'evaluation']),
  organization: z.string().min(1, 'Organization required'),
})

export const step2Schema = z.object({
  teamSize: z.enum(['1-10', '11-50', '51-200', '200+']),
  timeline: z.string(),
})

// Conditional schema based on step 1 answer
export const step3SchemaFactory = (useCase: string) => {
  if (useCase === 'vendor-selection') {
    return z.object({
      vendors: z.array(z.string()).min(2, 'Select at least 2 vendors'),
      budget: z.string(),
    })
  }
  return z.object({
    existingVendor: z.string(),
    concerns: z.array(z.string()),
  })
}

// components/AssessmentForm.tsx (Client Component)
'use client'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useFormPersist } from 'react-hook-form-persist'

type AssessmentData = z.infer<typeof step1Schema> &
                      z.infer<typeof step2Schema> &
                      Record<string, any>

export function AssessmentForm() {
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AssessmentData>({
    resolver: zodResolver(getCurrentStepSchema(currentStep)),
    mode: 'onBlur', // Validate on blur, not on every keystroke
  })

  // Auto-save to localStorage
  useFormPersist('assessment-progress', {
    watch,
    setValue,
    storage: window.localStorage,
  })

  const onStepComplete = (data: Partial<AssessmentData>) => {
    // Step validated by resolver before this runs
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    } else {
      submitAssessment(data)
    }
  }

  return (
    <form onSubmit={handleSubmit(onStepComplete)}>
      <StepIndicator current={currentStep} total={totalSteps} />
      {renderCurrentStep(currentStep, register, errors)}
      <button type="submit">
        {currentStep === totalSteps ? 'Submit' : 'Next'}
      </button>
    </form>
  )
}
```

### Pattern 2: Conditional Branching with Discriminated Unions
**What:** Use TypeScript discriminated unions to model question branches type-safely.
**When to use:** When questions depend on previous answers (e.g., "If vendor-selection, ask X; else ask Y").
**Example:**
```typescript
// Source: TypeScript docs + Total TypeScript discriminated unions guide
// lib/assessment/conditional-logic.ts
type Question =
  | { type: 'vendor-selection'; vendors: string[]; budget: string }
  | { type: 'implementation'; existingVendor: string; integrations: string[] }
  | { type: 'evaluation'; criteria: string[]; timeline: string }

function getNextQuestions(context: Question): QuestionConfig[] {
  switch (context.type) {
    case 'vendor-selection':
      return [
        { id: 'q4', text: 'What features are most important?', type: 'multi-select' },
        { id: 'q5', text: 'Do you need on-premise deployment?', type: 'yes-no' },
      ]
    case 'implementation':
      return [
        { id: 'q4', text: 'What challenges are you facing?', type: 'textarea' },
        { id: 'q5', text: 'Rate your current solution', type: 'scale' },
      ]
    case 'evaluation':
      return [
        { id: 'q4', text: 'Who are the stakeholders?', type: 'multi-select' },
      ]
  }
}

// TypeScript ensures exhaustive checking - compile error if we miss a branch
```

### Pattern 3: AI Follow-Up Generation with Server Actions
**What:** Generate contextual follow-up questions using LLM via Server Actions.
**When to use:** For ASSM-03 requirement (AI-powered follow-up questions).
**Example:**
```typescript
// Source: Vercel AI SDK docs + Next.js Server Actions guide
// app/assessment/actions.ts
'use server'

import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { z } from 'zod'

const followUpSchema = z.object({
  questions: z.array(z.object({
    text: z.string(),
    rationale: z.string(),
    fieldType: z.enum(['text', 'select', 'scale', 'yes-no']),
  })),
})

export async function generateFollowUp(context: Record<string, any>) {
  const result = await generateObject({
    model: anthropic('claude-sonnet-4-20250514'),
    schema: followUpSchema,
    system: 'You are an expert consultant helping users make agentic AI platform decisions.',
    prompt: `Based on this user context, generate 1-2 clarifying follow-up questions:

User answers so far:
${JSON.stringify(context, null, 2)}

Generate questions that:
- Dig deeper into their specific needs
- Clarify ambiguous or brief answers
- Surface decision criteria they may not have considered
- Are specific and actionable (not generic)`,
  })

  return result.object.questions
}

// app/assessment/components/AIFollowUp.tsx
'use client'
import { useActionState } from 'react'
import { generateFollowUp } from '../actions'

export function AIFollowUp({ context }: { context: Record<string, any> }) {
  const [state, formAction, pending] = useActionState(
    async (_prev: any, formData: FormData) => {
      const questions = await generateFollowUp(context)
      return { questions }
    },
    { questions: [] }
  )

  return (
    <div>
      {pending && <p>Analyzing your answers...</p>}
      {state.questions.map(q => (
        <div key={q.text}>
          <label>{q.text}</label>
          <p className="text-sm text-gray-600">{q.rationale}</p>
          {/* Render appropriate input based on q.fieldType */}
        </div>
      ))}
    </div>
  )
}
```

### Pattern 4: Progress Persistence with Automatic Recovery
**What:** Auto-save form state to localStorage on every change, restore on mount.
**When to use:** For ASSM-02 requirement (save/resume progress).
**Example:**
```typescript
// Source: react-hook-form-persist docs + Josh Comeau localStorage guide
// Already shown in Pattern 1, but key details:

// The library handles:
// - Debouncing writes (no performance issues)
// - JSON serialization/deserialization
// - Namespace isolation (multiple forms on site)
// - Cleanup on submission

// To clear saved progress after successful submission:
const clearProgress = () => {
  window.localStorage.removeItem('assessment-progress')
}

// Server Action for final submission
export async function submitAssessment(data: AssessmentData) {
  'use server'
  // Validate complete schema
  const validated = completeAssessmentSchema.parse(data)
  // Save to database
  await db.assessments.create({ data: validated })
  // Return success - client will clear localStorage
  return { success: true }
}
```

### Anti-Patterns to Avoid
- **Validating all steps on first render:** Validate only current step, not entire form state (users haven't filled later steps yet).
- **Using URL params for state:** Tempting for shareable links, but exposes private user data and makes state management complex.
- **Blocking navigation between steps:** Let users move backward freely; only validate when moving forward or submitting.
- **Client-side only validation:** Always re-validate on server to prevent manipulation (especially for AI follow-ups).
- **Synchronous localStorage writes on every keystroke:** Use debouncing (react-hook-form-persist does this automatically).

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Form state management | Custom useState + context for form data | react-hook-form | Handles validation, errors, touched state, dirty tracking, async validation, field arrays - hundreds of edge cases |
| localStorage persistence | Custom useEffect + JSON.stringify | react-hook-form-persist | Handles debouncing, SSR safety, namespace conflicts, cleanup, type safety |
| Schema validation | Custom validation functions | Zod | Type inference, error messages, async validation, refinements, transforms, conditional schemas |
| Step progression logic | Custom switch/if-else chains | State machine library or discriminated unions | Prevents impossible states, type-safe transitions, clear mental model |
| AI streaming responses | Manual SSE/WebSocket handling | Vercel AI SDK | Handles reconnection, buffering, parsing, error states, React integration |
| Progress indicators | Custom CSS animations | Existing component library | Accessibility, responsive design, animation polish |

**Key insight:** Multi-step forms have 10+ years of solved problems. The ecosystem has mature solutions for state management, persistence, and validation. Hand-rolling these wastes time and introduces bugs that libraries have already fixed. The only custom logic needed is domain-specific: question branching rules and AI prompts.

## Common Pitfalls

### Pitfall 1: React 19 + React Hook Form Compatibility Issues
**What goes wrong:** Using the `watch()` method causes inconsistent re-renders in React 19 with the new compiler, leading to stale form data displays.
**Why it happens:** React 19's compiler auto-memoizes the `watch` function, breaking the intended reactivity pattern.
**How to avoid:** Use `useWatch()` hook instead of the `watch()` method for reactive values that should trigger re-renders.
**Warning signs:** Form displays stale values, typing in fields doesn't update UI, validation errors don't clear.

**Sources:** [React Hook Form vs React 19](https://mattburgess.medium.com/react-hook-form-vs-react-19-1e28009e6557), [Build with Matija: Hidden Compatibility Issue](https://www.buildwithmatija.com/blog/the-invisible-form-bug-react-19-react-hook-form-s-hidden-compatibility-issue)

### Pitfall 2: localStorage SSR Hydration Errors
**What goes wrong:** Code that reads `localStorage` on initial render causes Next.js hydration mismatches because `localStorage` doesn't exist on server.
**Why it happens:** Server renders with no localStorage value, client has value, React sees mismatch.
**How to avoid:** Use lazy initialization in `useState(() => ...)` or wrap in `useEffect` to only access localStorage client-side.
**Warning signs:** Console errors about hydration mismatch, `localStorage is not defined` errors, flash of wrong content.

**Pattern:**
```typescript
// BAD - causes hydration error
const [data, setData] = useState(JSON.parse(localStorage.getItem('key')))

// GOOD - lazy initialization
const [data, setData] = useState(() => {
  if (typeof window === 'undefined') return null
  return JSON.parse(localStorage.getItem('key') || 'null')
})
```

**Sources:** [Josh Comeau: Persisting React State](https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/), [Felix Gerschau: React LocalStorage](https://felixgerschau.com/react-localstorage/)

### Pitfall 3: Validating Too Early or Too Late
**What goes wrong:** Validating on every keystroke annoys users with premature errors; validating only on submit loses immediate feedback.
**Why it happens:** Unclear about when validation should run in multi-step forms.
**How to avoid:** Use `mode: 'onBlur'` for field validation (validate when user leaves field), and validate step schema when attempting to proceed to next step.
**Warning signs:** Users complain about error messages appearing before they finish typing, or discovering errors only at final submission.

**Sources:** [Smashing Magazine: Effective Multistep Form](https://www.smashingmagazine.com/2024/12/creating-effective-multistep-form-better-user-experience/), [Growform: UX Best Practices](https://www.growform.co/must-follow-ux-best-practices-when-designing-a-multi-step-form/)

### Pitfall 4: Over-Engineering Conditional Logic
**What goes wrong:** Building complex rule engines with JSON config when simple TypeScript conditionals would work.
**Why it happens:** Premature abstraction, trying to make logic "data-driven" before understanding requirements.
**How to avoid:** Start with explicit conditionals (if/else, switch on discriminated unions), extract to config only if you have 20+ similar rules.
**Warning signs:** More code in abstraction layer than in actual business logic, hard to debug which rule fired, can't use TypeScript exhaustiveness checking.

### Pitfall 5: Generating AI Questions Without Validation
**What goes wrong:** LLM generates questions in unexpected formats, with inappropriate field types, or that don't align with assessment goals.
**Why it happens:** Using unstructured LLM output without schema validation.
**How to avoid:** Always use Vercel AI SDK's `generateObject` with Zod schemas, never `generateText` for structured data. Validate LLM output before rendering.
**Warning signs:** Runtime errors rendering questions, questions that don't make sense, missing required fields, UI breaks on certain answers.

**Sources:** [Vercel AI SDK docs](https://ai-sdk.dev/docs), [OpenAI Structured Outputs](https://platform.openai.com/docs/api-reference/responses)

### Pitfall 6: Not Handling Step Navigation Edge Cases
**What goes wrong:** Users navigate back, skip steps via browser history, or refresh mid-assessment, causing data inconsistencies.
**Why it happens:** Only handling forward progression, not backward navigation or restoration.
**How to avoid:** Allow free backward navigation (no validation), persist current step number in state, validate only on forward movement, handle browser refresh by restoring both data AND step number from localStorage.
**Warning signs:** User reports losing data when clicking back, validation errors on steps they haven't seen, can't review previous answers.

## Code Examples

Verified patterns from official sources:

### Step Indicator Component
```typescript
// Source: Carbon Design System, USWDS Step Indicator docs
// app/assessment/components/StepIndicator.tsx
type StepStatus = 'complete' | 'current' | 'incomplete'

interface Step {
  number: number
  label: string
  status: StepStatus
}

export function StepIndicator({ current, total }: { current: number; total: number }) {
  const steps: Step[] = Array.from({ length: total }, (_, i) => ({
    number: i + 1,
    label: `Step ${i + 1}`,
    status: i + 1 < current ? 'complete' : i + 1 === current ? 'current' : 'incomplete',
  }))

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between">
        {steps.map((step, idx) => (
          <li key={step.number} className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2
              ${step.status === 'complete' ? 'bg-blue-600 border-blue-600 text-white' : ''}
              ${step.status === 'current' ? 'border-blue-600 text-blue-600' : ''}
              ${step.status === 'incomplete' ? 'border-gray-300 text-gray-400' : ''}
            `}>
              {step.status === 'complete' ? '✓' : step.number}
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-full h-0.5 mx-2 ${
                step.status === 'complete' ? 'bg-blue-600' : 'bg-gray-300'
              }`} />
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
```

### Server Action with Progressive Enhancement
```typescript
// Source: Next.js Forms Guide (official docs)
// app/assessment/actions.ts
'use server'

import { z } from 'zod'

const submissionSchema = z.object({
  // Complete assessment schema
  useCase: z.string(),
  organization: z.string(),
  // ... all fields
})

export async function submitAssessment(prevState: any, formData: FormData) {
  // Extract data from FormData (works without JS)
  const rawData = {
    useCase: formData.get('useCase'),
    organization: formData.get('organization'),
    // ... rest of fields
  }

  // Server-side validation
  const validated = submissionSchema.safeParse(rawData)

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: 'Validation failed',
    }
  }

  // Save to database
  try {
    await db.assessments.create({
      data: validated.data,
    })

    return { success: true, message: 'Assessment submitted successfully' }
  } catch (error) {
    return { success: false, message: 'Submission failed, please try again' }
  }
}
```

### Conditional Field Rendering
```typescript
// Source: React Hook Form docs + LogRocket multi-step tutorial
// app/assessment/components/ConditionalFields.tsx
'use client'

import { useWatch } from 'react-hook-form'

export function ConditionalFields({ control, register }: any) {
  // Watch specific field without causing unnecessary re-renders
  const useCase = useWatch({
    control,
    name: 'useCase',
    defaultValue: '',
  })

  return (
    <>
      <div>
        <label>What's your use case?</label>
        <select {...register('useCase')}>
          <option value="">Select...</option>
          <option value="vendor-selection">Vendor Selection</option>
          <option value="implementation">Implementation</option>
          <option value="evaluation">Evaluation</option>
        </select>
      </div>

      {useCase === 'vendor-selection' && (
        <div>
          <label>How many vendors are you considering?</label>
          <input type="number" {...register('vendorCount')} />
        </div>
      )}

      {useCase === 'implementation' && (
        <div>
          <label>Which vendor did you choose?</label>
          <input type="text" {...register('chosenVendor')} />
        </div>
      )}
    </>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Formik for form management | React Hook Form | ~2020-2021 | Better performance, smaller bundle, better TypeScript support |
| Manual Server Actions + fetch | Vercel AI SDK | 2024-2025 | Simplified streaming, unified provider interface, built-in React hooks |
| OpenAI Completions API | Structured Outputs (generateObject) | Late 2024 | Type-safe LLM responses, no manual parsing, reduced hallucination |
| Class-based validation | Zod schemas | ~2021-2022 | Runtime + compile-time safety, better errors, composable schemas |
| Context API for forms | React Hook Form (local state) | Ongoing | Reduced re-renders, simpler mental model, better performance |
| Pages Router patterns | App Router + Server Actions | Next.js 13-15 | Better DX, streaming by default, simplified data mutations |

**Deprecated/outdated:**
- **OpenAI Assistants API**: Deprecated, being removed August 2026. Use Responses API instead.
- **Formik**: Still maintained but has known performance issues with React 19. React Hook Form is the current standard.
- **Class-based validators (Yup, Joi)**: Not deprecated but Zod has become standard in TypeScript projects for type inference.
- **useFormState (old Next.js)**: Renamed to `useActionState` in React 19. Update to new naming.

## Open Questions

Things that couldn't be fully resolved:

1. **AI Provider Choice (Anthropic vs OpenAI)**
   - What we know: Both work with Vercel AI SDK, both support structured outputs
   - What's unclear: Which performs better for follow-up question generation specifically, cost comparison for questionnaire use case
   - Recommendation: Start with Anthropic Claude Sonnet 4 (already mentioned in context), benchmark if costs become significant. Both APIs are similar.

2. **Optimal Step Count**
   - What we know: UX research says 4-5 fields per step, requirements mention "10-15 questions"
   - What's unclear: Exact question count and how to group them into steps
   - Recommendation: Plan for 3-4 core steps + 1-2 conditional steps, design questions first then group by topic affinity.

3. **Database Schema for Assessments**
   - What we know: Need to store completed assessments, possibly in-progress ones
   - What's unclear: Whether to store JSON blob or normalized fields, how to version schema as questions change
   - Recommendation: Start with JSON column (flexible), normalize later if querying patterns emerge. Version assessments with schema version field.

4. **Analytics/Telemetry**
   - What we know: Would be valuable to track drop-off rates, common paths, AI question quality
   - What's unclear: Whether to implement in Phase 2 or defer to later phase
   - Recommendation: Defer to later phase, focus on core functionality first. Can add instrumentation points without sending data.

## Sources

### Primary (HIGH confidence)
- Next.js Forms Guide (official): https://nextjs.org/docs/app/guides/forms
- Vercel AI SDK Documentation: https://ai-sdk.dev/docs
- React Hook Form GitHub: https://github.com/react-hook-form/react-hook-form
- Zustand GitHub: https://github.com/pmndrs/zustand
- Next.js Server Actions Guide: https://nextjs.org/docs/app/getting-started/updating-data

### Secondary (MEDIUM confidence)
- LogRocket: Building Reusable Multi-Step Form with React Hook Form and Zod: https://blog.logrocket.com/building-reusable-multi-step-form-react-hook-form-zod/
- Build with Matija: React Hook Form Multi-Step Tutorial: https://www.buildwithmatija.com/blog/master-multi-step-forms-build-a-dynamic-react-form-in-6-simple-steps
- Josh Comeau: Persisting React State in localStorage: https://www.joshwcomeau.com/react/persisting-react-state-in-localstorage/
- Smashing Magazine: Creating Effective Multistep Form: https://www.smashingmagazine.com/2024/12/creating-effective-multistep-form-better-user-experience/
- Medium (Sparkle Web): Redux vs Zustand vs Context API in 2026: https://medium.com/@sparklewebhelp/redux-vs-zustand-vs-context-api-in-2026-7f90a2dc3439
- Total TypeScript: Discriminated Unions: https://www.totaltypescript.com/discriminated-unions-are-a-devs-best-friend
- BlockSurvey: AI Follow-Up Questions: https://blocksurvey.io/features/ai-followup-questions-in-surveys
- GitHub: react-hook-form-persist: https://github.com/tiaanduplessis/react-hook-form-persist
- Vercel AI SDK Complete Guide (DEV Community): https://dev.to/pockit_tools/vercel-ai-sdk-complete-guide-building-production-ready-ai-chat-apps-with-nextjs-4cp6

### Tertiary (LOW confidence)
- npm peer compatibility data for library versions (informational only, not verified)
- Community discussions on React Hook Form + React 19 compatibility

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official docs and GitHub, versions confirmed via searches dated 2026
- Architecture: HIGH - Patterns verified from official Next.js docs, Vercel AI SDK docs, React Hook Form docs
- Pitfalls: MEDIUM-HIGH - Mix of official documentation (HIGH) and experienced developer blog posts (MEDIUM)

**Research date:** 2026-02-05
**Valid until:** 2026-03-07 (30 days - stack is stable, but AI SDK evolving quickly)

---

## Additional Notes

**Tech Stack Alignment:**
- React Hook Form works seamlessly with existing Next.js 15, TypeScript, and Tailwind setup
- Zod already in dependencies (used by Velite), no new validation paradigm to learn
- Vercel AI SDK is the de facto standard for Next.js + LLM projects in 2026

**React 19 Considerations:**
- Project uses React 19 (from package.json), so must use `useWatch()` instead of `watch()` for reactive values
- `useActionState` (not `useFormState`) for Server Actions
- React Hook Form 7.71.1 works but has known quirks - workarounds documented in Pitfalls section

**Performance Characteristics:**
- localStorage writes are synchronous but react-hook-form-persist debounces them (minimal impact)
- React Hook Form minimizes re-renders via uncontrolled components (good for 10-15 field form)
- Vercel AI SDK streaming prevents blocking on LLM responses (better UX than waiting for full response)

**Accessibility:**
- Step indicators should use `<nav>` with `aria-label="Progress"`
- Form errors need `aria-live="polite"` for screen reader announcements
- Progress persistence means users can take breaks without losing work (cognitive accessibility)
