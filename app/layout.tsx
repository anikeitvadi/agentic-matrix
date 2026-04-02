import type { Metadata } from "next"
import { Manrope, Newsreader } from "next/font/google"
import "./globals.css"
import { Sidebar } from "@/components/ui/Sidebar"

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
})

const newsreader = Newsreader({
  subsets: ["latin"],
  variable: "--font-newsreader",
})

export const metadata: Metadata = {
  metadataBase: new URL("https://agentic-matrix.vercel.app"),
  title: "Agentic Matrix — AI Agent Platform Comparison",
  description:
    "Vendor-neutral recommendations for enterprise AI agent platforms. Compare pricing, compliance, and capabilities across leading platforms with transparent scoring.",
  keywords: [
    "AI agent platforms",
    "enterprise AI",
    "platform comparison",
    "vendor-neutral",
    "AI decision toolkit",
    "agent framework",
    "LLM platforms",
    "AI scoring",
    "total cost of ownership",
    "AI compliance",
  ],
  openGraph: {
    title: "Agentic Matrix — AI Agent Platform Comparison",
    description:
      "Vendor-neutral recommendations for enterprise AI agent platforms. Compare pricing, compliance, and capabilities across leading platforms with transparent scoring.",
    type: "website",
    siteName: "Agentic Matrix",
  },
  twitter: {
    card: "summary_large_image",
    title: "Agentic Matrix — AI Agent Platform Comparison",
    description:
      "Vendor-neutral recommendations for enterprise AI agent platforms. Compare pricing, compliance, and capabilities across leading platforms with transparent scoring.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${manrope.variable} ${newsreader.variable} bg-[#06060a] antialiased`}
      >
        <Sidebar />
        <main className="relative min-h-screen overflow-x-clip pt-14 md:ml-64 md:pt-0">
          {children}
        </main>
      </body>
    </html>
  )
}
