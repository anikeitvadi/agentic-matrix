# Phase 1: Foundation & Platform Data - Research

**Researched:** 2026-02-05
**Domain:** Next.js 16 web application with MDX content management
**Confidence:** HIGH

## Summary

Phase 1 establishes a Next.js 16 application with TypeScript, Tailwind CSS v4, and structured platform data for 5 core agent platforms. Research focused on the modern Next.js App Router architecture, content management approaches (evaluating Contentlayer alternatives), and the integration of shadcn/ui components.

**Key findings:** Contentlayer is abandoned and should be replaced with Velite or native MDX solutions. Next.js 16 introduces significant breaking changes including mandatory async request APIs and removal of `next lint`. Tailwind CSS v4 requires CSS-first configuration with zero-config automatic content detection. The recommended stack is mature and well-documented, with high confidence in implementation patterns.

**Primary recommendation:** Use Next.js 16 with Velite for type-safe content management, leveraging App Router Server Components for platform data display and client components only for interactive assessment features.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 16.x (latest) | React framework with App Router | Industry standard, Turbopack by default, React 19 support, Server Components |
| React | 19.2+ | UI library | Required by Next.js 16, new features like View Transitions and useEffectEvent |
| TypeScript | 5.1+ | Type safety | Minimum required for Next.js 16, excellent Next.js integration |
| Tailwind CSS | 4.x | Utility-first CSS | Zero-config setup, 3-5x faster builds, CSS-first configuration |
| Velite | Latest | Content layer with Zod validation | Active maintenance (replaces abandoned Contentlayer), type-safe MDX processing |
| shadcn/ui | Latest | Component library | Copy-paste components, excellent Next.js integration, customizable |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zustand | 5.0.10+ | State management | For client-side state (assessment progress, filters) - not for platform data |
| Zod | Latest | Schema validation | Velite dependency, validates MDX frontmatter |
| remark/rehype plugins | Latest | MDX processing | Custom MDX transformations via Velite config |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Velite | @next/mdx | Velite provides type safety via Zod schemas; @next/mdx simpler but no validation |
| Velite | next-mdx-remote | next-mdx-remote supports remote content; Velite better for local type-safe content |
| Zustand | React Context | Zustand more performant, no provider boilerplate, but Context sufficient for simple cases |
| Tailwind CSS v4 | Tailwind CSS v3 | v4 faster and simpler, but v3 more stable for risk-averse projects |

**Installation:**
```bash
# Core dependencies
npm install next@latest react@latest react-dom@latest

# Tailwind CSS v4
npm install tailwindcss@latest @tailwindcss/postcss

# Velite with dependencies
npm install velite zod

# shadcn/ui (interactive CLI)
pnpm dlx shadcn@latest init

# Zustand for client state
npm install zustand
```

## Architecture Patterns

### Recommended Project Structure
```
agentic-decisions/
├── app/                        # Next.js App Router
│   ├── layout.tsx             # Root layout (required)
│   ├── page.tsx               # Home page
│   ├── platforms/             # Platform listing/detail pages
│   │   └── [slug]/            # Dynamic platform routes
│   └── assessment/            # Interactive assessment (client components)
├── components/                # React components
│   ├── ui/                    # shadcn/ui components (generated)
│   └── platform/              # Custom platform display components
├── content/                   # MDX content source
│   ├── platforms/             # Platform profiles (5 MDX files)
│   └── policies/              # Editorial policy content
├── lib/                       # Utility functions
├── public/                    # Static assets (logos, images)
├── styles/                    # Global CSS
│   └── globals.css            # Tailwind imports
├── velite.config.ts           # Content layer configuration
├── next.config.mjs            # Next.js configuration
├── postcss.config.js          # Tailwind CSS v4 PostCSS plugin
├── tsconfig.json              # TypeScript configuration
└── package.json               # Dependencies and scripts
```

### Pattern 1: Content-First Architecture with Velite
**What:** MDX files in `content/` directory are processed by Velite at build time into type-safe JSON with Zod schema validation.

**When to use:** For structured content that needs type safety and validation (platform profiles, documentation).

**Example:**
```typescript
// velite.config.ts
// Source: https://velite.js.org/guide/with-nextjs
import { defineConfig, s } from 'velite'

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true
  },
  collections: {
    platforms: {
      name: 'Platform',
      pattern: 'platforms/**/*.mdx',
      schema: s
        .object({
          slug: s.slug('platforms'),
          title: s.string().max(99),
          description: s.string().max(999),
          lastVerified: s.isodate(),
          capabilities: s.array(s.string()),
          pricing: s.object({
            tier: s.enum(['free', 'paid', 'enterprise']),
            details: s.string()
          }),
          officialDocs: s.string().url(),
          content: s.mdx()
        })
    }
  }
})

// next.config.mjs - Velite integration (Turbopack-compatible)
const isDev = process.argv.indexOf('dev') !== -1
const isBuild = process.argv.indexOf('build') !== -1
if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
  process.env.VELITE_STARTED = '1'
  const { build } = await import('velite')
  await build({ watch: isDev, clean: !isDev })
}

export default {
  // Next.js config
}

// Usage in Server Component
// app/platforms/[slug]/page.tsx
import { platforms } from '.velite'

export default async function PlatformPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params // Next.js 16 requires await
  const platform = platforms.find(p => p.slug === slug)

  if (!platform) notFound()

  return (
    <div>
      <h1>{platform.title}</h1>
      <p>Last verified: {new Date(platform.lastVerified).toLocaleDateString()}</p>
      {platform.content}
    </div>
  )
}
```

### Pattern 2: Server-First Component Architecture
**What:** All components are Server Components by default; opt-in to Client Components only for interactivity.

**When to use:** Always in Next.js App Router. Server Components for data fetching and display, Client Components for forms, state, and browser APIs.

**Example:**
```typescript
// Server Component (default) - app/platforms/page.tsx
// Source: https://nextjs.org/docs/app/getting-started/server-and-client-components
import { platforms } from '.velite'

export default function PlatformsPage() {
  // Data fetching on server, no client JavaScript
  return (
    <div>
      {platforms.map(platform => (
        <PlatformCard key={platform.slug} platform={platform} />
      ))}
    </div>
  )
}

// Client Component - components/assessment/filter-controls.tsx
'use client'

import { useState } from 'react'
import { useAssessmentStore } from '@/lib/store'

export function FilterControls() {
  const [filter, setFilter] = useState('')
  const updateFilter = useAssessmentStore(state => state.updateFilter)

  return (
    <input
      value={filter}
      onChange={e => {
        setFilter(e.target.value)
        updateFilter(e.target.value)
      }}
    />
  )
}
```

### Pattern 3: Zustand State Management (Client-Side Only)
**What:** Create stores with typed state and actions using Zustand's `create` API.

**When to use:** For client-side state like assessment progress, user preferences, UI state. NOT for platform data (use Server Components + Velite).

**Example:**
```typescript
// lib/store.ts
// Source: https://github.com/pmndrs/zustand
import { create } from 'zustand'

interface AssessmentState {
  currentStep: number
  answers: Record<string, string>
  setAnswer: (questionId: string, answer: string) => void
  nextStep: () => void
  resetAssessment: () => void
}

export const useAssessmentStore = create<AssessmentState>((set) => ({
  currentStep: 0,
  answers: {},
  setAnswer: (questionId, answer) =>
    set(state => ({
      answers: { ...state.answers, [questionId]: answer }
    })),
  nextStep: () =>
    set(state => ({ currentStep: state.currentStep + 1 })),
  resetAssessment: () =>
    set({ currentStep: 0, answers: {} })
}))

// Usage in Client Component
'use client'

import { useAssessmentStore } from '@/lib/store'

export function AssessmentQuestion() {
  const { currentStep, setAnswer } = useAssessmentStore()
  // Component logic
}
```

### Pattern 4: Tailwind CSS v4 Configuration
**What:** CSS-first configuration using `@theme` directive instead of `tailwind.config.js`.

**When to use:** For all styling customization - design tokens, breakpoints, colors.

**Example:**
```css
/* styles/globals.css */
/* Source: https://tailwindcss.com/blog/tailwindcss-v4 */
@import "tailwindcss";

@theme {
  /* Custom design tokens */
  --font-display: "Inter", sans-serif;
  --breakpoint-3xl: 1920px;

  /* Brand colors using oklch */
  --color-brand-primary: oklch(0.55 0.22 250.87);
  --color-brand-secondary: oklch(0.75 0.15 210.45);

  /* Custom easing */
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
}

/* postcss.config.js */
export default {
  plugins: ["@tailwindcss/postcss"]
}
```

### Anti-Patterns to Avoid

- **Using Contentlayer:** The library is abandoned and unmaintained. Use Velite or @next/mdx instead.
- **Synchronous params/cookies access:** Next.js 16 requires `await params`, `await cookies()`, `await headers()` - synchronous access removed.
- **Client Components for static content:** Don't use 'use client' for platform display pages. Server Components are faster and have better SEO.
- **Context API for assessment state:** Zustand is more performant and has less boilerplate than Context for client state.
- **JavaScript tailwind.config.js in v4:** Use CSS @theme directive for configuration in Tailwind v4.
- **Missing default.js in parallel routes:** Next.js 16 requires explicit `default.js` files for all parallel route slots.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| MDX frontmatter parsing | Custom YAML parser + TypeScript types | Velite with Zod schemas | Velite provides automatic type generation, validation, and error messages |
| Content validation | Manual checks in MDX files | Zod schemas in Velite config | Zod catches errors at build time with clear messages |
| Component library | Custom button/input components | shadcn/ui | Pre-built accessible components, easy customization, copy-paste workflow |
| State management | useContext + useReducer | Zustand | Less boilerplate, better performance, no provider wrappers |
| Styling system | Custom CSS-in-JS | Tailwind CSS v4 | Zero-config, automatic content detection, 100x faster rebuilds |
| MDX processing | Custom remark/rehype pipeline | Velite's built-in MDX processing | Handles remark/rehype plugins, code highlighting, automatic asset optimization |

**Key insight:** Next.js 16 ecosystem has mature, battle-tested solutions for every common problem. Custom solutions add maintenance burden without meaningful benefits.

## Common Pitfalls

### Pitfall 1: Next.js 16 Async Request APIs
**What goes wrong:** Code using synchronous `params`, `searchParams`, `cookies()`, `headers()`, or `draftMode()` breaks in Next.js 16.

**Why it happens:** Next.js 16 removed synchronous access to these APIs. All request-time data must be accessed asynchronously.

**How to avoid:**
- Always `await params` in page/layout components
- Always `await cookies()`, `await headers()`, `await draftMode()`
- Update TypeScript types to Promise-based

**Warning signs:**
```typescript
// WRONG (Next.js 15 pattern)
export default function Page({ params }: { params: { slug: string } }) {
  return <div>{params.slug}</div>
}

// CORRECT (Next.js 16 pattern)
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  return <div>{slug}</div>
}
```

### Pitfall 2: Contentlayer Maintenance Status
**What goes wrong:** Following outdated tutorials that recommend Contentlayer leads to unmaintained dependencies and unfixed bugs.

**Why it happens:** Contentlayer lost funding after Stackbit acquisition by Netlify and is effectively abandoned (as of 2024-2025).

**How to avoid:**
- Use Velite (actively maintained, similar API)
- Or use @next/mdx for simpler projects without type generation
- Check GitHub activity before adding any content layer library

**Warning signs:**
- GitHub issues with no maintainer response
- No releases in 6+ months
- Comments about "abandoned" or "looking for alternatives"

### Pitfall 3: Turbopack + Webpack Plugin Incompatibility
**What goes wrong:** Using Webpack-based plugins (like VeliteWebpackPlugin) fails silently or causes build errors when Turbopack is enabled (default in Next.js 16).

**Why it happens:** Turbopack is not fully compatible with Webpack plugin ecosystem.

**How to avoid:**
- Use top-level await in `next.config.mjs` for Velite integration (recommended)
- Or use npm-run-all to run Velite as separate process
- Avoid VeliteWebpackPlugin entirely

**Warning signs:**
- Build succeeds but content changes don't trigger rebuilds
- Errors mentioning "webpack" in Turbopack builds

### Pitfall 4: Tailwind CSS v4 Migration Breaking Changes
**What goes wrong:** Existing Tailwind v3 config doesn't work; utilities like `bg-gradient-to-r` are renamed.

**Why it happens:** v4 is a major rewrite with CSS-first configuration and renamed utilities for expanded gradient support.

**How to avoid:**
- Start fresh with CSS @theme configuration
- Use automated upgrade tool for migrations
- Update `bg-gradient-*` to `bg-linear-*`

**Warning signs:**
- Config file not being read
- Gradient utilities not working
- Colors look different (oklch vs rgb color space)

### Pitfall 5: shadcn/ui npm Peer Dependencies
**What goes wrong:** npm install fails with peer dependency conflicts when initializing shadcn/ui.

**Why it happens:** npm strict peer dependency resolution conflicts with shadcn/ui's flexible React version support.

**How to avoid:**
- Use `npx --legacy-peer-deps shadcn@latest init`
- Or use pnpm/yarn/bun instead of npm (recommended)

**Warning signs:**
- npm ERR! code ERESOLVE
- Peer dependency conflicts on React/React-DOM

### Pitfall 6: Image Optimization Defaults Changed
**What goes wrong:** Images render at different quality than expected; local IP images fail to optimize.

**Why it happens:** Next.js 16 changed `images.qualities` default from [1..100] to [75], and `dangerouslyAllowLocalIP` now defaults to false.

**How to avoid:**
- Explicitly configure `images.qualities` if using custom quality props
- Set `dangerouslyAllowLocalIP: true` only for private networks

**Warning signs:**
- Images look more compressed than before
- Local network images fail to load

## Code Examples

Verified patterns from official sources:

### Creating Next.js 16 App with Recommended Defaults
```bash
# Source: https://nextjs.org/docs/app/getting-started/installation
npx create-next-app@latest my-app --yes
cd my-app
npm run dev
```
The `--yes` flag uses recommended defaults: TypeScript, Tailwind, ESLint, App Router, Turbopack with `@/*` import alias.

### Platform MDX Content Structure
```markdown
---
title: "OpenAI Frontier"
slug: "openai-frontier"
description: "OpenAI's new agentic platform launched February 2026"
lastVerified: "2026-02-05"
capabilities:
  - "Multi-modal agents"
  - "Custom tool integration"
  - "GPT-4.5 models"
pricing:
  tier: "paid"
  details: "Pay-per-use with volume discounts"
officialDocs: "https://platform.openai.com/docs"
---

# OpenAI Frontier

OpenAI Frontier provides enterprise-grade agentic capabilities...

## Key Features
- Feature 1
- Feature 2
```

### Velite Schema for Platform Validation
```typescript
// Source: https://velite.js.org/guide/with-nextjs
import { defineConfig, s } from 'velite'

export default defineConfig({
  collections: {
    platforms: {
      name: 'Platform',
      pattern: 'platforms/**/*.mdx',
      schema: s.object({
        title: s.string().max(99),
        slug: s.slug('platforms'),
        description: s.string().max(999),
        lastVerified: s.isodate(),
        capabilities: s.array(s.string()),
        pricing: s.object({
          tier: s.enum(['free', 'paid', 'enterprise']),
          details: s.string()
        }),
        officialDocs: s.string().url(),
        body: s.mdx()
      })
    }
  }
})
```

### Next.js 16 Async Params Pattern
```typescript
// Source: https://nextjs.org/docs/app/guides/upgrading/version-16
// app/platforms/[slug]/page.tsx
export default async function PlatformPage({
  params
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params // MUST await in Next.js 16
  // Use slug...
}
```

### shadcn/ui Component Usage
```typescript
// Source: https://ui.shadcn.com/docs/installation/next
// After running: pnpm dlx shadcn@latest add button

import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <div>
      <Button variant="default">View Platforms</Button>
      <Button variant="outline">Start Assessment</Button>
    </div>
  )
}
```

### Tailwind CSS v4 Setup
```javascript
// postcss.config.js
// Source: https://tailwindcss.com/blog/tailwindcss-v4
export default {
  plugins: ["@tailwindcss/postcss"],
}
```

```css
/* styles/globals.css */
@import "tailwindcss";

@theme {
  --font-display: "Inter", sans-serif;
  --color-brand: oklch(0.55 0.22 250.87);
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Contentlayer | Velite / @next/mdx | 2024-2025 | Must migrate from Contentlayer; Velite provides similar API with active maintenance |
| Tailwind CSS v3 config.js | Tailwind v4 CSS @theme | Dec 2024 | Simpler setup, zero-config content detection, 3-5x faster builds |
| Sync params access | Async params with await | Next.js 16 (2025) | All page components must be async and await params |
| middleware.ts | proxy.ts | Next.js 16 (2025) | Rename file and exported function for clarity |
| next lint command | Direct ESLint/Biome | Next.js 16 (2025) | Must add linting to npm scripts; next build no longer runs linter |
| React 18 | React 19.2 | Next.js 16 (2025) | New features: View Transitions, useEffectEvent, Activity component |
| Node.js 18 | Node.js 20.9+ | Next.js 16 (2025) | Minimum version requirement increased |

**Deprecated/outdated:**
- **Contentlayer**: Abandoned due to loss of Stackbit sponsorship. Use Velite or @next/mdx.
- **next lint**: Removed from `next build`. Use ESLint or Biome directly via npm scripts.
- **Webpack by default**: Turbopack now stable and default. Opt out with `--webpack` flag if needed.
- **AMP support**: Completely removed from Next.js 16.
- **serverRuntimeConfig / publicRuntimeConfig**: Use .env files instead.
- **bg-gradient-* utilities**: Renamed to bg-linear-* in Tailwind v4 (making room for bg-conic-*, bg-radial-*).

## Open Questions

Things that couldn't be fully resolved:

1. **OpenAI Frontier launch status**
   - What we know: Context mentions "OpenAI Frontier (just launched Feb 5, 2026)"
   - What's unclear: Official documentation and API availability not yet publicly confirmed
   - Recommendation: Verify OpenAI's official announcements on launch day (Feb 5, 2026) before creating platform profile. Have fallback plan to use "OpenAI GPT-4 Agents" as platform name if Frontier is not publicly available.

2. **Velite vs @next/mdx tradeoff for small content set**
   - What we know: Only 5 platform profiles in Phase 1
   - What's unclear: Whether Velite's complexity is justified for 5 files vs simpler @next/mdx
   - Recommendation: Use Velite for type safety and validation, which scales better to 10-12 platforms in later phases. The Zod schema prevents errors as content grows.

3. **Editorial Independence Policy format**
   - What we know: Must be "published and accessible to users"
   - What's unclear: Whether this should be a dedicated page, footer link, or about page section
   - Recommendation: Create dedicated `/editorial-policy` page with MDX content for SEO and clear accessibility. Link from footer and about page.

4. **Turbopack stability for production**
   - What we know: Turbopack stable in Next.js 16, used by default
   - What's unclear: Real-world production reliability vs Webpack legacy
   - Recommendation: Use Turbopack (default) for development speed. Vercel deployment uses production-optimized build pipeline regardless. Have `--webpack` flag as fallback if issues arise.

## Sources

### Primary (HIGH confidence)
- [Next.js Installation Documentation](https://nextjs.org/docs/app/getting-started/installation) - System requirements, TypeScript setup
- [Next.js 16 Release Blog](https://nextjs.org/blog/next-16) - Breaking changes, new features
- [Next.js Upgrade Guide v16](https://nextjs.org/docs/app/guides/upgrading/version-16) - Migration instructions
- [Tailwind CSS v4.0 Release](https://tailwindcss.com/blog/tailwindcss-v4) - Installation, breaking changes, new features
- [Velite Next.js Integration](https://velite.js.org/guide/with-nextjs) - Configuration, Turbopack compatibility
- [shadcn/ui Next.js Installation](https://ui.shadcn.com/docs/installation/next) - Setup process
- [Zustand GitHub Repository](https://github.com/pmndrs/zustand) - API documentation, TypeScript usage
- [Next.js Server/Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components) - Architecture patterns

### Secondary (MEDIUM confidence)
- [ContentLayer Abandoned Discussion](https://www.wisp.blog/blog/contentlayer-has-been-abandoned-what-are-the-alternatives) - Maintenance status verified with GitHub issues
- [Next.js Project Structure 2026](https://dev.to/bajrayejoon/best-practices-for-organizing-your-nextjs-15-2025-53ji) - Community best practices
- [Next.js App Router Advanced Patterns](https://medium.com/@beenakumawat002/next-js-app-router-advanced-patterns-for-2026-server-actions-ppr-streaming-edge-first-b76b1b3dcac7) - Server Components patterns
- [Velite Integration Examples](https://nooc.me/en/posts/integrate-a-blog-in-nextjs-with-velite) - Real-world usage

### Tertiary (LOW confidence)
- MDX frontmatter TypeScript typing patterns - Community discussions, no single authoritative source
- OpenAI Frontier February 2026 launch - User-provided context, not yet verified with official sources

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified via official documentation and release notes
- Architecture: HIGH - Next.js 16 patterns documented in official upgrade guide and App Router docs
- Pitfalls: HIGH - Breaking changes confirmed in official Next.js 16 release notes and migration guide
- Velite integration: MEDIUM - Official docs available but less mature ecosystem than Contentlayer was
- OpenAI Frontier: LOW - Launch date (Feb 5, 2026) not verified, may need adjustment

**Research date:** 2026-02-05
**Valid until:** 2026-03-07 (30 days - Next.js 16 stable, stack mature)

**Note:** If OpenAI Frontier is not publicly available by Feb 5, substitute with "OpenAI Assistants API" or "OpenAI GPT-4 Agents" as one of the 5 core platforms. All other findings remain valid.
