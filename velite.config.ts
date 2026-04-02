import { defineConfig, defineCollection, s } from 'velite'
// @ts-ignore - mdx-mermaid works correctly but has TypeScript issues
import mdxMermaid from 'mdx-mermaid'

const platforms = defineCollection({
  name: 'Platform',
  pattern: 'platforms/**/*.mdx',
  schema: s
    .object({
      slug: s.path(),
      title: s.string().max(99),
      description: s.string().max(999),
      lastVerified: s.isodate(),
      tier: s.enum(['enterprise-os', 'ipaas-agent', 'developer-first', 'vertical']),
      capabilities: s.array(s.string()),
      // Structured capability flags for deterministic scoring (no keyword matching)
      structuredCapabilities: s.object({
        hasRAG: s.boolean().default(false),
        hasMultiModal: s.boolean().default(false),
        hasLowCode: s.boolean().default(false),
        hasSelfHosted: s.boolean().default(false),
        hasMultiAgent: s.boolean().default(false),
        cloudNative: s.array(s.enum(['aws', 'azure', 'gcp', 'ibm', 'salesforce', 'sap', 'servicenow'])).default([]),
        complianceCerts: s.array(s.enum(['soc2', 'hipaa', 'gdpr', 'iso27001', 'fedramp'])).default([]),
        supportedIntegrations: s.array(s.string()).default([]),
        useCaseStrengths: s.array(s.enum([
          'customer-support', 'data-extraction', 'workflow-automation',
          'knowledge-qa', 'sales-routing', 'it-ticketing'
        ])).default([]),
        // Enterprise security flags
        zeroDataRetention: s.boolean().default(false),
        bringYourOwnKey: s.boolean().default(false),
        deploymentOptions: s.array(s.enum(['saas', 'vpc', 'on-prem', 'hybrid-cloud'])).default(['saas']),
      }).optional(),
      // Extended evaluation dimensions (informational, not weighted in scoring)
      evaluationContext: s.object({
        modelFlexibility: s.enum(['single-provider', 'multi-provider', 'bring-your-own']).default('single-provider'),
        ecosystemMaturity: s.enum(['emerging', 'growing', 'established', 'dominant']).default('growing'),
        observability: s.enum(['minimal', 'basic', 'comprehensive']).default('basic'),
        vendorViability: s.enum(['startup', 'established', 'big-tech']).default('established'),
        dataResidency: s.array(s.string()).default([]),
        documentationQuality: s.enum(['minimal', 'adequate', 'comprehensive']).default('adequate'),
      }).optional(),
      pricing: s.object({
        model: s.enum(['pay-per-use', 'subscription', 'per-conversation', 'hybrid']),
        details: s.string(),

        // Token pricing (for pay-per-use and hybrid models)
        tokenPricing: s
          .object({
            inputPricePerMillion: s.number(),
            outputPricePerMillion: s.number(),
            cachedInputDiscount: s.number().optional(),
            modelVariants: s
              .array(
                s.object({
                  name: s.string(),
                  inputPrice: s.number(),
                  outputPrice: s.number(),
                })
              )
              .optional(),
          })
          .optional(),

        // Subscription tiers
        tiers: s
          .array(
            s.object({
              name: s.string(),
              monthlyPrice: s.number(),
              includedUnits: s.number().optional(),
              unitType: s.enum(['conversations', 'users', 'tasks', 'tokens']).optional(),
            })
          )
          .optional(),

        // Per-conversation pricing
        perConversationRate: s.number().optional(),
        includedConversations: s.number().optional(),

        // Flags
        enterpriseContact: s.boolean().optional(),
        infrastructureCosts: s.string().optional(),
      }),
      officialDocs: s.string().url(),
      pricingPage: s.string().url().optional(),
      body: s.markdown(),
    })
    .transform((data) => ({
      ...data,
      slug: data.slug.replace(/^platforms\//, '').replace(/\.mdx$/, ''),
    })),
})

const policies = defineCollection({
  name: 'Policy',
  pattern: 'policies/**/*.mdx',
  schema: s.object({
    slug: s.slug('policies'),
    title: s.string().max(99),
    lastUpdated: s.isodate(),
    body: s.markdown(),
  })
})

const blueprints = defineCollection({
  name: 'Blueprint',
  pattern: 'blueprints/**/*.mdx',
  schema: s.object({
    slug: s.path(),
    title: s.string().max(99),
    useCase: s.enum([
      'customer-support',
      'data-extraction',
      'workflow-automation',
      'knowledge-base',
      'approval-workflows'
    ]),
    description: s.string().max(999),
    lastVerified: s.isodate(),

    // Platform relationships
    applicablePlatforms: s.array(s.string()), // Slugs from platforms collection
    recommendedPlatforms: s.array(s.string()).optional(),

    // Metadata
    complexity: s.enum(['simple', 'moderate', 'complex']),
    estimatedDuration: s.object({
      foundation: s.string(), // "1-2 weeks"
      build: s.string(),
      test: s.string(),
      deploy: s.string(),
    }),
    prerequisites: s.array(s.string()),

    // Content
    body: s.mdx(),
  }).transform((data) => ({
    ...data,
    slug: data.slug.replace(/^blueprints\//, ''),
  })),
})

export default defineConfig({
  root: 'content',
  output: {
    data: '.velite',
    assets: 'public/static',
    base: '/static/',
    name: '[name]-[hash:6].[ext]',
    clean: true,
  },
  collections: { platforms, policies, blueprints },
  mdx: {
    remarkPlugins: [mdxMermaid],
    rehypePlugins: [],
  },
})
