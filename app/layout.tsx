import type { Metadata } from "next"
import "./globals.css"
import { Sidebar } from "@/components/ui/Sidebar"

export const metadata: Metadata = {
  title: "Agentic Decisions",
  description: "AI agent platform decision toolkit for enterprise IT leaders.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="bg-neutral-50 font-sans">
        <Sidebar />
        <main className="ml-56 min-h-screen">
          {children}
        </main>
      </body>
    </html>
  )
}
