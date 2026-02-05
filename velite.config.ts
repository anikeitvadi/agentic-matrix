import { defineConfig, defineCollection, s } from 'velite'

const platforms = defineCollection({
  name: 'Platform',
  pattern: 'platforms/**/*.mdx',
  schema: s.object({
    slug: s.slug('platforms'),
    title: s.string().max(99),
    description: s.string().max(999),
    lastVerified: s.isodate(),
    tier: s.enum(['enterprise-os', 'ipaas-agent', 'developer-first', 'vertical']),
    capabilities: s.array(s.string()),
    pricing: s.object({
      model: s.string(),
      details: s.string(),
    }),
    officialDocs: s.string().url(),
    pricingPage: s.string().url().optional(),
    body: s.mdx(),
  })
})

const policies = defineCollection({
  name: 'Policy',
  pattern: 'policies/**/*.mdx',
  schema: s.object({
    slug: s.slug('policies'),
    title: s.string().max(99),
    lastUpdated: s.isodate(),
    body: s.mdx(),
  })
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
  collections: { platforms, policies },
  mdx: {
    rehypePlugins: [],
    remarkPlugins: [],
  },
})
