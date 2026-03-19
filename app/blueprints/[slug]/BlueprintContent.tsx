'use client'

import React from 'react'
import { Admonition } from '@/components/ui/Admonition'
import { ImplementationChecklist, ChecklistPhase, ChecklistItem } from '@/components/blueprint/ImplementationChecklist'
import { PlatformCallout } from '@/components/blueprint/PlatformCallout'

interface BlueprintContentProps {
  code: string
}

export function BlueprintContent({ code }: BlueprintContentProps) {
  const [Component, setComponent] = React.useState<React.ComponentType<any> | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let isMounted = true

    async function loadComponent() {
      try {
        // Create an async function to handle await imports in MDX
        const func = new Function(
          'React',
          'Admonition',
          'ImplementationChecklist',
          'ChecklistPhase',
          'ChecklistItem',
          'PlatformCallout',
          `
          return (async function() {
            const { Fragment, jsx, jsxs } = React;

            // Helper to resolve dynamic MDX specifiers
            function _resolveDynamicMdxSpecifier(specifier) {
              // Map specifier to actual components
              if (specifier === '@/components/ui/Admonition') {
                return { Admonition };
              }
              if (specifier === 'mdx-mermaid') {
                // Return a minimal Mermaid component placeholder for now
                // The actual mermaid component will be loaded separately
                return { default: function Mermaid(props) {
                  return React.createElement('div', {
                    className: 'mermaid',
                    dangerouslySetInnerHTML: { __html: props.chart || '' }
                  });
                }};
              }
              return {};
            }

            ${code}

            return _createMdxContent;
          })();
          `
        )

        const componentPromise = func(
          React,
          Admonition,
          ImplementationChecklist,
          ChecklistPhase,
          ChecklistItem,
          PlatformCallout
        )

        const loadedComponent = await componentPromise

        if (isMounted) {
          setComponent(() => loadedComponent)
        }
      } catch (err) {
        console.error('Error rendering MDX:', err)
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error')
        }
      }
    }

    loadComponent()

    return () => {
      isMounted = false
    }
  }, [code])

  if (error) {
    return <div className="text-red-500 p-4 border border-red-300 rounded-lg">Error rendering content: {error}</div>
  }

  if (!Component) {
    return <div className="text-neutral-500 p-4">Loading content...</div>
  }

  return <Component components={{
    Admonition,
    ImplementationChecklist,
    ChecklistPhase,
    ChecklistItem,
    PlatformCallout,
  }} />
}
