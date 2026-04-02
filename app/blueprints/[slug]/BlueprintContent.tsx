'use client'

import React from 'react'
import * as jsxRuntime from 'react/jsx-runtime'
import { Admonition } from '@/components/ui/Admonition'
import { ImplementationChecklist, ChecklistPhase, ChecklistItem } from '@/components/blueprint/ImplementationChecklist'
import { PlatformCallout } from '@/components/blueprint/PlatformCallout'

interface BlueprintContentProps {
  code: string
}

function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = React.useState<string>('')
  React.useEffect(() => {
    let mounted = true
    async function render() {
      try {
        const mermaid = (await import('mermaid')).default
        mermaid.initialize({ startOnLoad: false, theme: 'dark' })
        const id = `mermaid-${Math.random().toString(36).slice(2)}`
        const { svg: rendered } = await mermaid.render(id, chart)
        if (mounted) setSvg(rendered)
      } catch {
        if (mounted) setSvg(`<pre>${chart}</pre>`)
      }
    }
    render()
    return () => { mounted = false }
  }, [chart])
  if (!svg) return <div className="text-neutral-500 text-sm p-4">Loading diagram...</div>
  return <div className="my-6 flex justify-center [&>svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />
}

const mdxComponents = { Admonition, ImplementationChecklist, ChecklistPhase, ChecklistItem, PlatformCallout, Mermaid }

// Handles await import(_resolveDynamicMdxSpecifier("specifier"))
// _resolveDynamicMdxSpecifier returns the specifier string, then this resolves it to actual components
function fakeImport(specifier: string): Promise<Record<string, unknown>> {
  if (typeof specifier === 'string' && specifier.includes('Admonition')) return Promise.resolve({ Admonition })
  if (typeof specifier === 'string' && specifier.includes('mermaid')) return Promise.resolve({ default: Mermaid })
  return Promise.resolve({})
}

const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor

export function BlueprintContent({ code }: BlueprintContentProps) {
  const [Component, setComponent] = React.useState<React.ComponentType<any> | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isMounted = true

    async function loadComponent() {
      try {
        // Replace import() with __import__() to intercept dynamic imports
        const patchedCode = code.replace(/await import\(/g, 'await __import__(')

        // AsyncFunction params become arguments[0], arguments[1], etc.
        // Compiled MDX reads { Fragment, jsx, jsxs } from arguments[0]
        // So first param = opts object, second param = __import__ function
        const fn = new AsyncFunction(
          '_opts_',
          '__import__',
          patchedCode + '\nreturn _createMdxContent;'
        )

        const opts = {
          Fragment: (jsxRuntime as any).Fragment,
          jsx: (jsxRuntime as any).jsx,
          jsxs: (jsxRuntime as any).jsxs,
          baseUrl: '.',
        }

        const result = await fn(opts, fakeImport)

        if (isMounted && result) {
          // result might be a component function or an object with a default export
          const comp = typeof result === 'function'
            ? result
            : typeof result?.default === 'function'
            ? result.default
            : null

          if (comp) setComponent(() => comp)
        }
      } catch (err) {
        console.error('Error rendering MDX:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      }
    }

    loadComponent()
    return () => { isMounted = false }
  }, [code])

  if (error) {
    return <div className="text-red-400 p-4 bg-red-950/20 border border-red-800/30 rounded-lg">Error rendering content: {error}</div>
  }
  if (!Component) {
    return <div className="text-neutral-500 p-4">Loading content...</div>
  }
  return <Component components={mdxComponents} />
}
