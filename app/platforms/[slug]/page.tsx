import { platforms } from "@/.velite"
import { PlatformProfile } from "@/components/platform/PlatformProfile"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

interface PlatformPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  return platforms.map((platform) => ({
    slug: platform.slug,
  }))
}

export async function generateMetadata({
  params,
}: PlatformPageProps): Promise<Metadata> {
  const { slug } = await params
  const platform = platforms.find((p) => p.slug === slug)

  if (!platform) {
    return {
      title: "Platform Not Found",
    }
  }

  return {
    title: `${platform.title} | Agentic Decisions`,
    description: platform.description,
  }
}

export default async function PlatformPage({ params }: PlatformPageProps) {
  const { slug } = await params
  const platform = platforms.find((p) => p.slug === slug)

  if (!platform) {
    notFound()
  }

  return (
    <div className="bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <nav className="mb-8">
          <a
            href="/platforms"
            className="inline-flex items-center gap-2 text-brand-600 hover:text-brand-700 font-medium"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Platforms
          </a>
        </nav>

        <PlatformProfile platform={platform} />
      </div>
    </div>
  )
}
